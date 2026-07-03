# NoCrash — n8n Creator Portal submission copy (all 6)

Paste each field into the matching portal field. All English, audit-clean, word minimums cleared.
Note: the real credential is named "NoCrash — Your n8n Instance API" (em-dash); the copy below uses a colon ("NoCrash: Your n8n Instance API") — cosmetic only, the credential resolves by type.

---

## 1 — daily-n8n-self-audit-to-slack

**Title:** Daily n8n Self-Audit to Slack with NoCrash

**Quick overview:** Every morning, NoCrash grades every workflow in your n8n instance and posts the overall grade plus the number of at-risk workflows to a Slack channel, so your whole team sees how healthy your automations are before the day starts.

**How it works:**
1. A Schedule Trigger fires every morning at 8am.
2. The NoCrash node runs an Audit across all workflows in your n8n instance and returns an instance grade, a band label, and a per-workflow breakdown.
3. A Set node formats the grade, counts how many workflows are not green, and picks a colored status circle.
4. A Slack node posts the grade, the at-risk count, and a link to watch your workflows in NoCrash to your chosen channel. The audit grades design only and never reads your executions.

**Setup:**
1. Add the NoCrash: Your n8n Instance API credential (your own n8n base URL plus an n8n API key) and attach it to the Audit step.
2. Add a Slack credential and attach it to the post step.
3. Set the target channel name on the Slack node; the template uses automation-health.
4. Confirm the 8am Schedule Trigger time suits your timezone, then save and activate the workflow.

**Requirements:**
- A free NoCrash account and a NoCrash n8n Instance API credential (your n8n base URL plus an n8n API key)
- A Slack workspace and Slack credential with permission to post to your channel
- An active n8n instance with at least one workflow to grade

**Customization:**
- Change the trigger time or make it hourly instead of daily
- Point it at a different Slack channel, or swap Slack for Telegram, Discord, or email
- Adjust the grade thresholds that pick the green, yellow, or red status circle

---

## 2 — daily-n8n-self-audit-to-telegram

**Title:** Daily n8n Self-Audit to Telegram with NoCrash

**Quick overview:** Every morning, NoCrash grades every workflow in your n8n instance and sends the overall grade plus the number of at-risk workflows to a Telegram chat, giving you a plain-language health check on your automations before the day starts.

**How it works:**
1. A Schedule Trigger fires every morning at 8am.
2. The NoCrash node runs an Audit across all workflows in your n8n instance and returns an instance grade, a band label, and a per-workflow breakdown.
3. A Set node formats the grade, counts how many workflows are not green, and picks a colored status circle.
4. A Telegram node sends the grade, the at-risk count, and a link to watch your workflows in NoCrash to your chosen chat. The audit grades design only and never reads your executions.

**Setup:**
1. Add the NoCrash: Your n8n Instance API credential (your own n8n base URL plus an n8n API key) and attach it to the Audit step.
2. Add a Telegram credential and attach it to the send step.
3. Put your Telegram chat ID in the chat ID field on the send node.
4. Confirm the 8am Schedule Trigger time suits your timezone, then save and activate the workflow.

**Requirements:**
- A free NoCrash account and a NoCrash n8n Instance API credential (your n8n base URL plus an n8n API key)
- A Telegram bot credential and the chat ID you want to message
- An active n8n instance with at least one workflow to grade

**Customization:**
- Change the trigger time or make it hourly instead of daily
- Send to a different chat or group, or swap Telegram for Slack, Discord, or email
- Adjust the grade thresholds that pick the green, yellow, or red status circle

---

## 3 — heartbeat-on-every-run

**Title:** Heartbeat on Every n8n Run with NoCrash (Dead-Man's Switch)

**Quick overview:** Drop a NoCrash Heartbeat node at the end of any critical workflow. Each time it finishes, it pings NoCrash to confirm it ran. If the ping ever stops arriving, NoCrash notices the silence and alerts you, so you find out it stopped even when no error was thrown.

**How it works:**
1. A Schedule Trigger runs the workflow on your chosen interval (hourly in the template).
2. Your real work runs in the middle; the demo HTTP step stands in for it.
3. The NoCrash Heartbeat node, placed last, pings NoCrash with the execution ID once the run finishes.
4. NoCrash records the ping and learns the workflow's normal cadence. If an expected ping never arrives, NoCrash flags the missing heartbeat and alerts you, catching a silent stop that throws no error.

**Setup:**
1. In NoCrash, create a watch for this workflow and copy its Monitor ID.
2. Add a NoCrash API credential using your nc_ key and attach it to the Heartbeat node.
3. Paste the Monitor ID into the Monitor ID field on the Heartbeat node.
4. Replace the demo HTTP step with your real work, keeping Heartbeat as the last node.
5. Set the trigger interval to match how often this workflow should run, then save and activate.

**Requirements:**
- A free NoCrash account with a watch created for this workflow (to get its Monitor ID)
- A NoCrash API credential using your nc_ key
- Any critical n8n workflow you want to confirm keeps running

**Customization:**
- Set the trigger interval to match the workflow's real schedule
- Add real values to the durationMs and metadata fields to record run detail with each ping
- Reuse the Heartbeat node at the end of any other critical workflow with its own Monitor ID

---

## 4 — report-failure-from-error-trigger

**Title:** Report n8n Failures to NoCrash from an Error Trigger

**Quick overview:** Set this workflow as the Error Workflow for any or every workflow in your n8n. Whenever one throws an error, the Error Trigger fires and the NoCrash Report Failure step records what broke, which node failed, and the execution ID, so failures land in your NoCrash brief and alerts.

**How it works:**
1. The Error Trigger fires automatically whenever a workflow that uses this one as its Error Workflow throws an error.
2. A Set node pulls out the error message, the name of the node that failed, and the execution ID.
3. The NoCrash Report Failure node records the failure against your monitor, with the error details attached.
4. NoCrash surfaces the failure in plain language in your daily brief and sends an alert, so a broken pipeline no longer sits unnoticed for days.

**Setup:**
1. In NoCrash, create a watch for the workflow (or group of workflows) you want to cover and copy its Monitor ID.
2. Add a NoCrash API credential using your nc_ key and attach it to the Report Failure node.
3. Paste the Monitor ID into the Monitor ID field.
4. In each workflow you want covered, open Settings, Error Workflow, and choose this workflow.
5. Save and activate, then trigger a test error to confirm it reports.

**Requirements:**
- A free NoCrash account with a watch created (to get its Monitor ID)
- A NoCrash API credential using your nc_ key
- One or more n8n workflows set to use this workflow as their Error Workflow

**Customization:**
- Point several workflows at this one Error Workflow so every failure reports to the same watch
- Use separate Monitor IDs and copies if you want failures grouped per workflow
- Add extra fields to the Report Failure step to include more context with each report

---

## 5 — weekly-reliability-scorecard

**Title:** Weekly n8n Reliability Scorecard to Slack and Email with NoCrash

**Quick overview:** Every Monday morning, NoCrash audits every workflow in your n8n instance and builds a shareable scorecard: the instance grade, how many workflows are at risk, and the lowest-scoring offenders. It posts the scorecard to Slack and emails it, ready for a weekly team or client report.

**How it works:**
1. A Schedule Trigger fires every Monday at 9am.
2. The NoCrash node runs an Audit across all workflows in your n8n instance and returns the instance grade, a band label, and a per-workflow breakdown.
3. A Set node builds the scorecard: the grade, the at-risk count, and the three lowest-scoring workflows.
4. A Slack node posts the scorecard to your channel.
5. In parallel, an Email node sends the same scorecard by SMTP. The audit grades design only and never reads your executions.

**Setup:**
1. Add the NoCrash: Your n8n Instance API credential (your own n8n base URL plus an n8n API key) and attach it to the Audit step.
2. Add a Slack credential and attach it to the post step; set your channel name.
3. Add an SMTP credential and attach it to the email step.
4. Set the from and to addresses on the Email node.
5. Confirm the Monday 9am trigger suits your timezone, then save and activate.

**Requirements:**
- A free NoCrash account and a NoCrash n8n Instance API credential (your n8n base URL plus an n8n API key)
- A Slack workspace and Slack credential with permission to post
- An SMTP or email credential with from and to addresses set

**Customization:**
- Change the schedule to fortnightly or monthly, or shift the day and hour
- Adjust how many worst offenders the scorecard lists (the template shows three)
- Send only to Slack or only by email by removing the step you do not want

---

## 6 — catch-silent-n8n-failures (node-free watchdog / AEO)

**Title:** Catch Silent n8n Failures with NoCrash: Missed Runs and Green-but-Empty Alerts

**Quick overview:** This workflow reads your own n8n executions every hour and flags the two failures a green checkmark hides: a run that never fired, and a run that finished green but moved nothing. It alerts you in Slack. No NoCrash account or node required to run it.

**How it works:**
1. A Schedule Trigger runs the check every hour.
2. A Set node holds your watchlist: each workflow name, how often it should run, and the minimum items a real run should move.
3. Two n8n nodes read your workflows and your recent executions.
4. A Code node compares them and flags any workflow that missed its expected run or finished green while moving too few items.
5. An If node checks whether anything was flagged.
6. If anything is flagged, a Slack node posts the findings with a link to the free NoCrash Workflow Grader.

**Setup:**
1. Add an n8n API credential (your n8n base URL plus an n8n API key) and attach it to both the List your workflows and Recent runs nodes.
2. Add a Slack credential and attach it to the alert node; set your channel name.
3. Open the Which workflows to watch node and edit the list: for each workflow set its exact name, expectedEveryMinutes, and minItems.
4. Save and activate. The check runs hourly and only alerts when something is flagged.

**Requirements:**
- An n8n API credential: your n8n base URL plus an n8n API key
- A Slack workspace and Slack credential with permission to post
- The exact names of the workflows you want to watch

**Customization:**
- Edit expectedEveryMinutes and minItems per workflow to match its real cadence
- Swap the Slack node for a Telegram or Send Email node (the same message text works in any)
- Score any workflow free, no signup, on the NoCrash Workflow Grader: https://nocrash.io/tools/n8n-workflow-grader?utm_source=n8n-templates&utm_medium=community&utm_campaign=node-launch-2026
