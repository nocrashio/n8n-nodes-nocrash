/**
 * n8nApiClient — thin wrapper over the user's OWN n8n public REST API.
 *
 * Uses ONLY n8n's built-in authenticated request helper
 * (`this.helpers.httpRequestWithAuthentication`) so the package ships with zero
 * runtime dependencies (a verified-node gate). The NocrashN8nApi credential
 * injects the `X-N8N-API-KEY` header.
 *
 * The n8n public API paginates with an opaque `nextCursor`. We follow it until
 * exhausted or until `maxWorkflows` design JSONs have been collected.
 */

import type { IExecuteFunctions } from "n8n-workflow";

/** Credential name registered by NocrashN8nApi.credentials.ts. */
const N8N_CRED_NAME = "nocrashN8nApi";

/** Page size for the workflow list call. n8n caps this server-side. */
const LIST_PAGE_SIZE = 100;

export interface N8nWorkflowSummary {
  id: string;
  name?: string;
  active?: boolean;
}

interface WorkflowListResponse {
  data?: N8nWorkflowSummary[];
  nextCursor?: string | null;
}

/** Read the user's n8n instance base URL from the active credential. */
async function getInstanceUrl(ctx: IExecuteFunctions): Promise<string> {
  const credentials = await ctx.getCredentials(N8N_CRED_NAME);
  const raw = String(credentials.instanceUrl ?? "").trim();
  // Normalize: strip any trailing slash so we can safely concatenate paths.
  return raw.replace(/\/+$/, "");
}

/**
 * List workflow summaries from the user's n8n, following cursor pagination.
 *
 * @param activeOnly  when true, only `active: true` workflows are returned
 * @param maxWorkflows hard cap on how many summaries to collect
 */
export async function listWorkflowSummaries(
  ctx: IExecuteFunctions,
  activeOnly: boolean,
  maxWorkflows: number,
): Promise<N8nWorkflowSummary[]> {
  const instanceUrl = await getInstanceUrl(ctx);
  const collected: N8nWorkflowSummary[] = [];
  let cursor: string | undefined;

  do {
    const qs: Record<string, string | number | boolean> = { limit: LIST_PAGE_SIZE };
    if (cursor) {
      qs.cursor = cursor;
    }
    if (activeOnly) {
      qs.active = true;
    }

    const response = (await ctx.helpers.httpRequestWithAuthentication.call(
      ctx,
      N8N_CRED_NAME,
      {
        method: "GET",
        url: `${instanceUrl}/api/v1/workflows`,
        qs,
        json: true,
      },
    )) as WorkflowListResponse;

    const page = Array.isArray(response.data) ? response.data : [];
    for (const summary of page) {
      collected.push(summary);
      if (collected.length >= maxWorkflows) {
        return collected;
      }
    }

    cursor = response.nextCursor ?? undefined;
  } while (cursor);

  return collected;
}

/** Fetch the full design JSON for a single workflow by id. */
export async function getWorkflowDetail(
  ctx: IExecuteFunctions,
  workflowId: string,
): Promise<Record<string, unknown>> {
  const instanceUrl = await getInstanceUrl(ctx);
  const detail = (await ctx.helpers.httpRequestWithAuthentication.call(
    ctx,
    N8N_CRED_NAME,
    {
      method: "GET",
      url: `${instanceUrl}/api/v1/workflows/${encodeURIComponent(workflowId)}`,
      json: true,
    },
  )) as Record<string, unknown>;
  return detail;
}
