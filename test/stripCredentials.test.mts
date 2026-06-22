import { describe, it, expect } from "vitest";
import { stripCredentials, REDACTED } from "../nodes/Nocrash/shared/stripCredentials";

/**
 * stripCredentials is the load-bearing security boundary: nothing with
 * credential material may ever leave the user's n8n. These tests assert that
 * the stripped output contains ZERO credential material, and — critically —
 * they are written so they FAIL if the strip is bypassed (mutation check).
 */

/** A realistic workflow carrying both credential references and secret params. */
function workflowWithSecrets() {
  return {
    id: "wf-1",
    name: "Sync orders to Sheets",
    active: true,
    nodes: [
      {
        id: "node-1",
        name: "HTTP Request",
        type: "n8n-nodes-base.httpRequest",
        credentials: {
          httpHeaderAuth: { id: "5", name: "My Secret Header Auth" },
        },
        parameters: {
          url: "https://api.example.com/orders",
          method: "GET",
          apiKey: "sk_live_SUPER_SECRET_KEY_123",
          headerParameters: {
            parameters: [
              { name: "Authorization", value: "Bearer TOKEN_ABC_456" },
            ],
          },
          options: {},
        },
      },
      {
        id: "node-2",
        name: "Postgres",
        type: "n8n-nodes-base.postgres",
        credentials: {
          postgres: { id: "9", name: "Prod DB" },
        },
        parameters: {
          query: "SELECT * FROM orders",
          password: "hunter2",
          connection: { secret: "db-secret-value" },
        },
      },
    ],
  };
}

/** All literal secret strings that must NEVER appear in the stripped output. */
const SECRET_VALUES = [
  "sk_live_SUPER_SECRET_KEY_123",
  "Bearer TOKEN_ABC_456",
  "hunter2",
  "db-secret-value",
  "My Secret Header Auth",
  "Prod DB",
];

describe("stripCredentials", () => {
  it("removes the credentials object from every node", () => {
    const stripped = stripCredentials(workflowWithSecrets());
    for (const node of stripped.nodes ?? []) {
      expect((node as Record<string, unknown>).credentials).toBeUndefined();
    }
  });

  it("redacts secret-bearing parameter keys at any depth", () => {
    const stripped = stripCredentials(workflowWithSecrets());
    const httpNode = (stripped.nodes ?? [])[0] as Record<string, unknown>;
    const params = httpNode.parameters as Record<string, unknown>;
    expect(params.apiKey).toBe(REDACTED);

    const pgNode = (stripped.nodes ?? [])[1] as Record<string, unknown>;
    const pgParams = pgNode.parameters as Record<string, unknown>;
    expect(pgParams.password).toBe(REDACTED);
    expect((pgParams.connection as Record<string, unknown>).secret).toBe(REDACTED);
  });

  it("produces JSON containing ZERO credential material (mutation guard)", () => {
    const stripped = stripCredentials(workflowWithSecrets());
    const serialized = JSON.stringify(stripped);
    // This is the assertion that FAILS if the strip is bypassed: if
    // stripCredentials ever returns the input untouched, these secret
    // strings appear in the serialized output and the test goes red.
    for (const secret of SECRET_VALUES) {
      expect(serialized).not.toContain(secret);
    }
  });

  it("FAILS when the strip is bypassed (explicit mutation simulation)", () => {
    // Simulate the bug where the workflow is sent WITHOUT stripping.
    const bypassed = JSON.stringify(workflowWithSecrets());
    // Prove the secrets ARE present in the un-stripped form...
    expect(bypassed).toContain("sk_live_SUPER_SECRET_KEY_123");
    // ...and that the real function removes them — so swapping the call for
    // the identity function would flip this assertion red.
    const properlyStripped = JSON.stringify(stripCredentials(workflowWithSecrets()));
    expect(properlyStripped).not.toContain("sk_live_SUPER_SECRET_KEY_123");
  });

  it("preserves non-secret design fields (it strips, it does not gut)", () => {
    const stripped = stripCredentials(workflowWithSecrets());
    expect(stripped.name).toBe("Sync orders to Sheets");
    const httpNode = (stripped.nodes ?? [])[0] as Record<string, unknown>;
    const params = httpNode.parameters as Record<string, unknown>;
    expect(params.url).toBe("https://api.example.com/orders");
    expect(params.method).toBe("GET");
  });

  it("does not mutate the original input workflow", () => {
    const original = workflowWithSecrets();
    stripCredentials(original);
    // The original still has its credentials and secrets intact.
    expect(original.nodes[0].credentials).toBeDefined();
    expect(original.nodes[0].parameters.apiKey).toBe("sk_live_SUPER_SECRET_KEY_123");
  });

  it("handles workflows with no nodes array gracefully", () => {
    const result = stripCredentials({ id: "empty", name: "Empty" });
    expect(result.name).toBe("Empty");
  });
});
