import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  JsonObject,
} from "n8n-workflow";
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from "n8n-workflow";

import { auditFields } from "./descriptions/AuditDescription";
import { heartbeatFields } from "./descriptions/HeartbeatDescription";
import { reportFailureFields } from "./descriptions/ReportFailureDescription";

import { stripCredentials } from "./shared/stripCredentials";
import {
  gradeBatch,
  GRADER_BATCH_CAP,
  type GraderBatchResponse,
} from "./shared/graderClient";
import {
  getWorkflowDetail,
  listWorkflowSummaries,
} from "./shared/n8nApiClient";
import { attachTeasers, buildConnectUrl } from "./shared/renderTeasers";

/** Default NoCrash base URL. Overridable (advanced) for dev environments. */
const DEFAULT_NOCRASH_BASE_URL = "https://nocrash.io";

export class Nocrash implements INodeType {
  description: INodeTypeDescription = {
    displayName: "NoCrash",
    name: "nocrash",
    icon: { light: "file:nocrash.svg", dark: "file:nocrash.dark.svg" },
    group: ["transform"],
    version: [1],
    subtitle: '={{$parameter["operation"]}}',
    description:
      "Audit your entire n8n in 30 seconds, free. Then connect to catch silent failures before your customers do.",
    defaults: {
      name: "NoCrash",
    },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    usableAsTool: true,
    credentials: [
      {
        name: "nocrashN8nApi",
        required: true,
        displayOptions: {
          show: { operation: ["audit"] },
        },
      },
      {
        name: "nocrashApi",
        required: true,
        displayOptions: {
          show: { operation: ["heartbeat", "reportFailure"] },
        },
      },
    ],
    properties: [
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        default: "audit",
        options: [
          {
            name: "Audit My N8n",
            value: "audit",
            description:
              "Grade every workflow in your n8n and get an instance scorecard (free, static design grade)",
            action: "Audit my n8n",
          },
          {
            name: "Heartbeat",
            value: "heartbeat",
            description: "Send a heartbeat to confirm a workflow is running",
            action: "Send a heartbeat",
          },
          {
            name: "Report Failure",
            value: "reportFailure",
            description: "Record that a workflow failed, with error details",
            action: "Report a failure",
          },
        ],
      },
      ...auditFields,
      ...heartbeatFields,
      ...reportFailureFields,
      {
        displayName: "NoCrash Base URL",
        name: "nocrashBaseUrl",
        type: "string",
        default: DEFAULT_NOCRASH_BASE_URL,
        description:
          "Advanced: override the NoCrash base URL (for development/self-hosted testing)",
        displayOptions: {
          show: { "@version": [1] },
        },
        // Keep this out of the main flow — it is an advanced/escape-hatch field.
        typeOptions: {},
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const operation = this.getNodeParameter("operation", 0) as string;
    const nocrashBaseUrl = (
      (this.getNodeParameter("nocrashBaseUrl", 0, DEFAULT_NOCRASH_BASE_URL) as string) ||
      DEFAULT_NOCRASH_BASE_URL
    ).trim();

    if (operation === "audit") {
      return [await runAudit.call(this, nocrashBaseUrl)];
    }

    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        if (operation === "heartbeat") {
          returnData.push(await runHeartbeat.call(this, i, nocrashBaseUrl));
        } else if (operation === "reportFailure") {
          returnData.push(await runReportFailure.call(this, i, nocrashBaseUrl));
        } else {
          throw new NodeOperationError(
            this.getNode(),
            `Unknown operation: ${operation}`,
            { itemIndex: i },
          );
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message }, pairedItem: i });
          continue;
        }
        // Surface every failure with HTTP context preserved in the n8n UI.
        throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
      }
    }

    return [returnData];
  }
}

/**
 * "Audit my n8n" — list workflows from the user's own n8n, fetch each design
 * JSON, strip credentials, POST the batch to the NoCrash Grader, and emit one
 * output item with the instance scorecard + per-workflow rows + teasers.
 *
 * FREE TIER = STATIC GRADE ONLY: no executions read, no runtime signal.
 */
async function runAudit(
  this: IExecuteFunctions,
  nocrashBaseUrl: string,
): Promise<INodeExecutionData[]> {
  const scope = this.getNodeParameter("scope", 0, "all") as string;
  const requestedMax = this.getNodeParameter("maxWorkflows", 0, GRADER_BATCH_CAP) as number;
  const activeOnly = scope === "active";

  // The Grader caps a batch at GRADER_BATCH_CAP; never collect more than that.
  const maxWorkflows = Math.min(Math.max(1, requestedMax), GRADER_BATCH_CAP);

  // Collect one extra so we can detect "there were more than we graded".
  const summaries = await listWorkflowSummaries(this, activeOnly, maxWorkflows + 1);

  const localCapped = summaries.length > maxWorkflows;
  const toGrade = summaries.slice(0, maxWorkflows);

  // Fetch full design JSON for each, then strip credentials before it leaves.
  const strippedWorkflows: Array<Record<string, unknown>> = [];
  for (const summary of toGrade) {
    const detail = await getWorkflowDetail(this, summary.id);
    strippedWorkflows.push(stripCredentials(detail) as Record<string, unknown>);
  }

  let grade: GraderBatchResponse;
  try {
    grade = await gradeBatch(this, nocrashBaseUrl, strippedWorkflows);
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `NoCrash Grader request failed: ${(error as Error).message}`,
      { itemIndex: 0 },
    );
  }

  const workflows = attachTeasers(grade.workflows ?? []);
  const connectUrl = buildConnectUrl(nocrashBaseUrl);

  // The Grader may also report a server-side cap; surface either signal.
  const capped = Boolean(grade.capped) || localCapped;
  const capReason =
    grade.cap_reason ??
    (localCapped
      ? `Graded the first ${maxWorkflows} of ${summaries.length}+ workflows. Connect to NoCrash to grade them all.`
      : null);

  return [
    {
      json: {
        instanceScore: grade.instance_score,
        instanceBand: grade.instance_band,
        instanceBandLabel: grade.instance_band_label,
        workflowCount: grade.workflow_count,
        workflows,
        capped,
        capReason,
        connectUrl,
      },
      pairedItem: 0,
    },
  ];
}

/** "Heartbeat" — POST /api/v1/monitors/:id/ping with the NocrashApi credential. */
async function runHeartbeat(
  this: IExecuteFunctions,
  itemIndex: number,
  nocrashBaseUrl: string,
): Promise<INodeExecutionData> {
  const monitorId = this.getNodeParameter("monitorId", itemIndex) as string;
  const executionId = this.getNodeParameter("executionId", itemIndex, "") as string;
  const durationMs = this.getNodeParameter("durationMs", itemIndex, 0) as number;
  const metadataRaw = this.getNodeParameter("metadata", itemIndex, "{}") as string;

  const body: Record<string, unknown> = {};
  if (executionId) {
    body.executionId = executionId;
  }
  if (durationMs > 0) {
    body.durationMs = durationMs;
  }
  const metadata = parseOptionalJson.call(this, metadataRaw, itemIndex, "Metadata");
  if (metadata !== undefined) {
    body.metadata = metadata;
  }

  const baseUrl = nocrashBaseUrl.replace(/\/+$/, "");
  const response = await this.helpers.httpRequestWithAuthentication.call(
    this,
    "nocrashApi",
    {
      method: "POST",
      url: `${baseUrl}/api/v1/monitors/${encodeURIComponent(monitorId)}/ping`,
      body,
      json: true,
    },
  );

  return { json: response as IDataObject, pairedItem: itemIndex };
}

/** "Report Failure" — POST /api/v1/monitors/:id/fail with the NocrashApi credential. */
async function runReportFailure(
  this: IExecuteFunctions,
  itemIndex: number,
  nocrashBaseUrl: string,
): Promise<INodeExecutionData> {
  const monitorId = this.getNodeParameter("monitorId", itemIndex) as string;
  const errorMessage = this.getNodeParameter("errorMessage", itemIndex) as string;
  const failedNode = this.getNodeParameter("failedNode", itemIndex, "") as string;
  const executionId = this.getNodeParameter("executionId", itemIndex, "") as string;

  const body: Record<string, unknown> = { errorMessage };
  if (failedNode) {
    body.failedNode = failedNode;
  }
  if (executionId) {
    body.executionId = executionId;
  }

  const baseUrl = nocrashBaseUrl.replace(/\/+$/, "");
  const response = await this.helpers.httpRequestWithAuthentication.call(
    this,
    "nocrashApi",
    {
      method: "POST",
      url: `${baseUrl}/api/v1/monitors/${encodeURIComponent(monitorId)}/fail`,
      body,
      json: true,
    },
  );

  return { json: response as IDataObject, pairedItem: itemIndex };
}

/** Parse an optional JSON-string node parameter, raising a clean node error. */
function parseOptionalJson(
  this: IExecuteFunctions,
  raw: string,
  itemIndex: number,
  fieldLabel: string,
): unknown {
  const trimmed = (raw ?? "").trim();
  if (trimmed === "" || trimmed === "{}") {
    return undefined;
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    throw new NodeOperationError(
      this.getNode(),
      `${fieldLabel} is not valid JSON`,
      { itemIndex },
    );
  }
}
