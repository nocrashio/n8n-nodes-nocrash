import type { INodeProperties } from "n8n-workflow";

/**
 * Properties for the "Audit my n8n" operation (the hero, default op).
 *
 * Free tier = STATIC GRADE ONLY. These fields scope which workflows to grade
 * and never expose any runtime/execution toggle — runtime is the paid 2X.
 */
export const auditFields: INodeProperties[] = [
  {
    displayName: "Scope",
    name: "scope",
    type: "options",
    default: "all",
    description: "Which workflows in your n8n to include in the audit",
    options: [
      {
        name: "All Workflows",
        value: "all",
        description: "Grade every workflow in your instance",
      },
      {
        name: "Active Only",
        value: "active",
        description: "Grade only workflows that are currently active",
      },
    ],
    displayOptions: {
      show: { operation: ["audit"] },
    },
  },
  {
    displayName: "Max Workflows",
    name: "maxWorkflows",
    type: "number",
    default: 50,
    typeOptions: { minValue: 1, maxValue: 50 },
    description:
      "How many workflows to grade (the Grader accepts up to 50 per audit)",
    displayOptions: {
      show: { operation: ["audit"] },
    },
  },
];
