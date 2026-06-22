/**
 * renderTeasers — builds the "what you get when you connect" upsell payload.
 *
 * The free node returns the STATIC design grade only. For each graded workflow
 * we attach a `lockedAi` teaser describing the paid runtime depth (AI
 * root-cause, runtime Reliability Score, 24/7 watch, 3am alerts) so the node's
 * output naturally points the operator to the connect CTA — without computing
 * or implying any runtime signal in the free path.
 */

import type { GraderWorkflowRow } from "./graderClient";

/**
 * Public connect destination — the NoCrash landing page (root). Node users are
 * first-touch, so we send them to the page that warms them up and carries the
 * "Start free" CTA, not straight to a sign-up form. The node appends a source
 * attribution param.
 */
const CONNECT_PATH = "/";

/** Source attribution so we can measure node-driven activations. */
const CONNECT_SOURCE = "n8n-node-audit";

/** Static teaser copy shown per workflow (free path: no runtime computation). */
const LOCKED_AI_TEASER =
  "Connect this workflow to NoCrash and we watch it 24/7: a runtime Reliability " +
  "Score, AI root-cause and fix, a daily plain-language brief, and a 3am alert " +
  "(Telegram, email, Discord, or Slack) the moment it silently breaks — so your " +
  "customers aren't the first to know.";

export interface TeasedWorkflowRow extends GraderWorkflowRow {
  /** Upsell line describing the paid runtime depth for this workflow. */
  lockedAi: string;
}

/** Attach the locked-AI teaser to every per-workflow grade row. */
export function attachTeasers(rows: GraderWorkflowRow[]): TeasedWorkflowRow[] {
  return rows.map((row) => ({ ...row, lockedAi: LOCKED_AI_TEASER }));
}

/**
 * Build the top-level connect URL the node surfaces in its output, with a
 * stable source attribution query param.
 */
export function buildConnectUrl(nocrashBaseUrl: string): string {
  const baseUrl = nocrashBaseUrl.replace(/\/+$/, "");
  return `${baseUrl}${CONNECT_PATH}?source=${CONNECT_SOURCE}`;
}
