/**
 * graderClient — talks to the NoCrash public Grader API.
 *
 * Uses ONLY n8n's built-in unauthenticated request helper
 * (`this.helpers.httpRequest`) so the package ships with zero runtime
 * dependencies. The Grader endpoint is public (no auth) for the free static
 * audit — it grades design JSON only and never reads runtime/execution data.
 *
 * Endpoint (contract per issue #2319, built in parallel):
 *   POST {nocrashBaseUrl}/api/v1/grade/batch
 *   body: { workflows: [<stripped design JSON>, ...] }   // cap 50
 *   response: GraderBatchResponse (below)
 */

import type { IExecuteFunctions } from "n8n-workflow";

/** Hard cap on workflows the Grader will accept in a single batch. */
export const GRADER_BATCH_CAP = 50;

/** Per-workflow grade row returned by the Grader. */
export interface GraderWorkflowRow {
  name?: string;
  score: number;
  band: string;
  top_issue: string;
}

/** Full Grader batch response (agreed contract with #2319). */
export interface GraderBatchResponse {
  instance_score: number;
  instance_band: string;
  instance_band_label: string;
  workflow_count: number;
  workflows: GraderWorkflowRow[];
  capped: boolean;
  cap_reason: string | null;
}

/**
 * Grade a batch of (already credential-stripped) workflow design JSONs.
 *
 * Caller is responsible for having run stripCredentials() on every entry and
 * for capping the list at GRADER_BATCH_CAP — but we defensively slice here too.
 */
export async function gradeBatch(
  ctx: IExecuteFunctions,
  nocrashBaseUrl: string,
  strippedWorkflows: Array<Record<string, unknown>>,
): Promise<GraderBatchResponse> {
  const baseUrl = nocrashBaseUrl.replace(/\/+$/, "");
  const batch = strippedWorkflows.slice(0, GRADER_BATCH_CAP);

  const response = (await ctx.helpers.httpRequest.call(ctx, {
    method: "POST",
    url: `${baseUrl}/api/v1/grade/batch`,
    body: { workflows: batch },
    json: true,
  })) as GraderBatchResponse;

  return response;
}
