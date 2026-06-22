# Templates

Ready-to-import n8n workflow templates that showcase the NoCrash node.

The 5 launch templates are tracked in **#2094**. Each will land here as an
exported workflow JSON plus a short description of what it demonstrates:

1. Heartbeat on every run of a critical workflow.
2. Report Failure from an error-trigger workflow.
3. Daily self-audit (scheduled "Audit my n8n" → post the grade to Slack).
4. Audit gate before deploy (fail the run if instance grade drops).
5. New-workflow onboarding (audit + connect CTA).

To import: in n8n, **Workflows → Import from File**, then select the JSON.
