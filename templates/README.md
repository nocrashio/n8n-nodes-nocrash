# Templates

Ready-to-import n8n workflow templates. Five showcase the **NoCrash node**; one
(`catch-silent-n8n-failures`) is a **standalone watchdog** that needs no NoCrash
account or community node — it reads your own n8n executions and flags the two
failures a green run hides (a missed run, and a run that finished green but did
nothing).

Each one is built as a **well-made** n8n workflow — descriptive step names, retries on
every step that calls a service, an execution timeout, a set timezone, and a
sticky note explaining the flow. Every template scores **97 / 100 ("Solid")**
on the public [NoCrash Workflow Grader](https://nocrash.io/tools/n8n-workflow-grader?utm_source=n8n-template&utm_medium=community&utm_campaign=node-launch-2026)
(the only deduction is that the NoCrash node itself is an unverified community
add-on — expected for a community node).

> **The five node templates require a free NoCrash account — https://nocrash.io/?utm_source=n8n-template&utm_medium=community&utm_campaign=node-launch-2026 .** The standalone `catch-silent-n8n-failures` watchdog does not — it runs on your own n8n API credential.

## How to import

In n8n: **Workflows → Import from File**, then select the JSON. After importing,
open each NoCrash / Slack / Telegram / email step and pick your own credential,
and replace the `REPLACE_WITH_...` placeholders (Monitor ID, chat ID, etc.).

## Credentials used

| Credential | Used by | What it is |
|---|---|---|
| **NoCrash — Your n8n Instance API** (`nocrashN8nApi`) | the **Audit my n8n** op | your own n8n instance URL + an n8n API key. NoCrash reads workflow **design only**; credentials are stripped locally before anything is sent. |
| **NoCrash API** (`nocrashApi`) | the **Heartbeat** and **Report Failure** ops | your NoCrash key (starts with `nc_`), created in the NoCrash dashboard under *Settings → API keys*. |
| **n8n API** (`n8nApi`, built-in) | the standalone **`catch-silent-n8n-failures`** watchdog | your own n8n base URL + an n8n API key. The watchdog reads your recent executions to flag missed and green-but-empty runs. No NoCrash account or community node needed. |

---

## The templates (5 node templates + 1 standalone watchdog)

### 1. `daily-n8n-self-audit-to-slack.json` — Grader: 97/100 (Solid)

Every morning, runs **Audit my n8n** to grade every workflow in your instance,
then posts the instance grade, the number of workflows that need a look, and a
connect CTA to a Slack channel.

- **NoCrash op:** Audit my n8n · **Credential:** NoCrash — Your n8n Instance API
- **Also needs:** a Slack credential.

### 2. `daily-n8n-self-audit-to-telegram.json` — Grader: 97/100 (Solid)

The same daily self-audit, delivered to a Telegram chat instead of Slack.

- **NoCrash op:** Audit my n8n · **Credential:** NoCrash — Your n8n Instance API
- **Also needs:** a Telegram credential + the chat ID to message.

### 3. `heartbeat-on-every-run.json` — Grader: 97/100 (Solid)

A dead-man's-switch pattern: the NoCrash **Heartbeat** node sits as the **last
node** of a critical workflow and pings NoCrash on every run. If the ping stops
arriving, NoCrash notices the missing heartbeat and alerts you — so you find out
the workflow stopped even when there's no error to catch. Swap the demo middle
step for your real work; keep Heartbeat last.

- **NoCrash op:** Heartbeat · **Credential:** NoCrash API
- **Also needs:** the Monitor ID of the watch you created in NoCrash.

### 4. `report-failure-from-error-trigger.json` — Grader: 97/100 (Solid)

Set this as the **Error Workflow** for any (or every) workflow in your n8n. When
one of them throws an error, n8n fires the Error Trigger and the NoCrash **Report
Failure** step self-reports exactly what broke, on which node, with the execution
ID — so every failure lands in your NoCrash brief and alerts in plain language.

- **NoCrash op:** Report Failure · **Credential:** NoCrash API
- **Also needs:** the Monitor ID of the watch you created in NoCrash.

### 5. `weekly-reliability-scorecard.json` — Grader: 97/100 (Solid)

Every Monday, runs **Audit my n8n** and turns the result into a shareable
scorecard (instance grade, at-risk count, the three lowest-scoring workflows),
then posts it to Slack **and** emails it — ideal for a weekly team or client
report.

- **NoCrash op:** Audit my n8n · **Credential:** NoCrash — Your n8n Instance API
- **Also needs:** a Slack credential and an SMTP/email credential.

### 6. `catch-silent-n8n-failures.json` — standalone watchdog (no NoCrash node)

A **node-free** watchdog you import and point at your own instance. A Schedule
Trigger runs hourly; the built-in **n8n** node reads your workflows and recent
executions; a **Code** node flags the two failures a green checkmark hides — a
scheduled run that **never fired**, and a run that finished green while moving
**zero items**. If anything is flagged, it alerts you in Slack. It needs **no
NoCrash account and no community node**, so it imports and runs on n8n Cloud and
self-hosted alike.

- **NoCrash op:** none (standalone) · **Credential:** n8n API (your own instance URL + API key)
- **Also needs:** a Slack credential (swap for Telegram or email if you prefer).
- **Verified:** e2e-tested in a real n8n instance — catches a planted missed run and a planted green-but-empty run.

---

## Links

- Public n8n Workflow Grader: <https://nocrash.io/tools/n8n-workflow-grader?utm_source=n8n-template&utm_medium=community&utm_campaign=node-launch-2026>
- Start watching your n8n: <https://nocrash.io/?utm_source=n8n-template&utm_medium=community&utm_campaign=node-launch-2026>
- Free NoCrash account: <https://nocrash.io/?utm_source=n8n-template&utm_medium=community&utm_campaign=node-launch-2026>
