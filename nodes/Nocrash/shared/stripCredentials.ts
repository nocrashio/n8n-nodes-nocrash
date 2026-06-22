/**
 * stripCredentials — load-bearing security boundary.
 *
 * Before any workflow design JSON leaves the user's own n8n instance and is
 * sent to the NoCrash Grader API, it MUST pass through this function.
 *
 * It produces a design-only copy of the workflow with ALL credential material
 * removed:
 *   1. Every node's `credentials` object is deleted entirely.
 *   2. Any node parameter whose key looks secret-bearing
 *      (token / apiKey / api_key / password / secret / authorization /
 *      header-auth) is redacted, at any depth, including inside arrays.
 *
 * The function is pure: it deep-clones its input and never mutates the original
 * workflow object. This is the single source of truth for the public promise
 * "Credentials are stripped before anything is sent. We never store your
 * workflow definitions."
 */

/** Matches parameter keys that may carry secret material. */
const SECRET_KEY_PATTERN = /token|apikey|api_key|password|secret|authorization|header.*auth/i;

/** Placeholder written in place of a redacted secret value. */
export const REDACTED = "[redacted]";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

interface WorkflowNode {
  [key: string]: unknown;
  credentials?: unknown;
  parameters?: unknown;
}

interface Workflow {
  [key: string]: unknown;
  nodes?: WorkflowNode[];
}

/** Keys that, in n8n's {name, value} convention, hold the LABEL of a pair. */
const NAME_KEYS = new Set(["name", "key"]);
/** Keys that, in the same convention, hold the secret VALUE of a pair. */
const VALUE_KEYS = new Set(["value"]);

/**
 * Recursively redact any object property whose key matches the secret pattern.
 *
 * Also handles n8n's pervasive {name, value} pair convention (header params,
 * query params, generic auth): when an object has a `name`/`key` whose VALUE
 * matches the secret pattern (e.g. `name: "Authorization"`), the sibling
 * `value` is redacted even though the literal key "value" is not secret-looking.
 *
 * Walks plain objects and arrays; primitives are returned untouched.
 */
function scrubSecretsDeep(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map((entry) => scrubSecretsDeep(entry));
  }

  if (value !== null && typeof value === "object") {
    // Detect the {name: "<secret-ish>", value: "<secret>"} pair convention.
    const labelIsSecret = Object.entries(value).some(
      ([k, v]) =>
        NAME_KEYS.has(k) && typeof v === "string" && SECRET_KEY_PATTERN.test(v),
    );

    const result: { [key: string]: JsonValue } = {};
    for (const [key, child] of Object.entries(value)) {
      if (SECRET_KEY_PATTERN.test(key)) {
        result[key] = REDACTED;
      } else if (labelIsSecret && VALUE_KEYS.has(key)) {
        result[key] = REDACTED;
      } else {
        result[key] = scrubSecretsDeep(child);
      }
    }
    return result;
  }

  return value;
}

/**
 * Returns a design-only deep copy of the workflow with all credential material
 * removed. The input is never mutated.
 */
export function stripCredentials(workflow: Workflow): Workflow {
  // Deep-clone first so the caller's original object is never touched.
  const clone = JSON.parse(JSON.stringify(workflow)) as Workflow;

  if (Array.isArray(clone.nodes)) {
    clone.nodes = clone.nodes.map((node) => {
      const stripped: WorkflowNode = { ...node };
      // 1. Drop the entire credentials object — references AND any inline values.
      delete stripped.credentials;
      // 2. Scrub secret-bearing parameter keys at any depth.
      if (stripped.parameters !== undefined) {
        stripped.parameters = scrubSecretsDeep(stripped.parameters as JsonValue);
      }
      return stripped;
    });
  }

  // Also scrub any top-level secret-bearing keys (e.g. settings, staticData).
  return scrubSecretsDeep(clone as unknown as JsonValue) as unknown as Workflow;
}
