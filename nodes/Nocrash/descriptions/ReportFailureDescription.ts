import type { INodeProperties } from "n8n-workflow";

/**
 * Properties for the "Report Failure" operation.
 *
 * Records that a workflow failed, with error details, against a NoCrash
 * monitor. Authenticated with the NocrashApi (nc_ bearer) credential.
 */
export const reportFailureFields: INodeProperties[] = [
  {
    displayName: "Monitor ID",
    name: "monitorId",
    type: "string",
    default: "",
    required: true,
    description: "Which NoCrash watch this failure is for (its Monitor ID, from your NoCrash dashboard)",
    displayOptions: {
      show: { operation: ["reportFailure"] },
    },
  },
  {
    displayName: "Error Message",
    name: "errorMessage",
    type: "string",
    default: "",
    required: true,
    description: "Plain-language description of what went wrong",
    displayOptions: {
      show: { operation: ["reportFailure"] },
    },
  },
  {
    displayName: "Failed Node",
    name: "failedNode",
    type: "string",
    default: "",
    description: "Optional name of the n8n node that failed",
    displayOptions: {
      show: { operation: ["reportFailure"] },
    },
  },
  {
    displayName: "Execution ID",
    name: "executionId",
    type: "string",
    default: "={{$execution.id}}",
    description: 'Optional n8n execution ID to correlate this failure',
    displayOptions: {
      show: { operation: ["reportFailure"] },
    },
  },
];
