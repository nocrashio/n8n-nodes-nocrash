import type { INodeProperties } from "n8n-workflow";

/**
 * Properties for the "Heartbeat" operation.
 *
 * Sends a ping to a NoCrash monitor to confirm a workflow ran. Authenticated
 * with the NocrashApi (nc_ bearer) credential.
 */
export const heartbeatFields: INodeProperties[] = [
  {
    displayName: "Monitor ID",
    name: "monitorId",
    type: "string",
    default: "",
    required: true,
    description: "The NoCrash monitor (watch) to send a heartbeat for",
    displayOptions: {
      show: { operation: ["heartbeat"] },
    },
  },
  {
    displayName: "Execution ID",
    name: "executionId",
    type: "string",
    default: "={{$execution.id}}",
    description: 'Optional n8n execution ID to correlate this heartbeat',
    displayOptions: {
      show: { operation: ["heartbeat"] },
    },
  },
  {
    displayName: "Duration (Ms)",
    name: "durationMs",
    type: "number",
    default: 0,
    description: "Optional run duration in milliseconds",
    displayOptions: {
      show: { operation: ["heartbeat"] },
    },
  },
  {
    displayName: "Metadata",
    name: "metadata",
    type: "json",
    default: "{}",
    description: "Optional JSON metadata to attach to this heartbeat",
    displayOptions: {
      show: { operation: ["heartbeat"] },
    },
  },
];
