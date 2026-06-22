# n8n-nodes-nocrash

**Audit your entire n8n in 30 seconds. Free.**

This is an [n8n community node](https://docs.n8n.io/integrations/community-nodes/). Drop it into a workflow, point it at your own n8n, and get an instant X-ray of every workflow you run — a health grade, a per-workflow scorecard, and the top issue holding each one back.

Then, when you want NoCrash to catch silent failures before your customers do, connect your instance for the runtime Reliability Score, AI root-cause, and 3am alerts.

---

## Sample audit output

```
Instance grade:  72 / 100   ·   Needs a look   ·   18 workflows graded

  ┌─────────────────────────────────┬───────┬─────────┬──────────────────────────────┐
  │ Workflow                        │ Score │ Band    │ Top issue                    │
  ├─────────────────────────────────┼───────┼─────────┼──────────────────────────────┤
  │ Sync orders to Sheets           │  88   │ green   │ No error handling on HTTP    │
  │ Lead enrichment                 │  56   │ yellow  │ No retry on failed requests  │
  │ Nightly DB backup               │  34   │ red     │ Silent fail: no alert path   │
  └─────────────────────────────────┴───────┴─────────┴──────────────────────────────┘

  Connect this workflow to NoCrash to unlock the runtime Reliability Score,
  AI root-cause + fix, 24/7 watch, and 3am alerts when it silently breaks.

  → Connect: https://nocrash.io/connect?source=n8n-node-audit
```

---

## Trust

> **The audit runs inside your own n8n with your own API key. Credentials are stripped before anything is sent. We never store your workflow definitions.**

The node lists your workflows and reads their design via your own n8n API key. Before any workflow is sent to the NoCrash Grader, every credential reference and secret-bearing field is removed locally (see [`stripCredentials`](nodes/Nocrash/shared/stripCredentials.ts)). The free audit grades **design only** — it never reads your executions or runtime data.

---

## Free vs Connected

| | **Free (this node)** | **Connected to NoCrash** |
|---|---|---|
| Static workflow **Grade** | ✅ | ✅ |
| Design-issue detection | ✅ | ✅ |
| Instance scorecard | ✅ | ✅ |
| Runtime **Reliability Score** | — | ✅ |
| AI root-cause + fix | — | ✅ |
| 24/7 watch | — | ✅ |
| 3am alerts (Telegram, email) | — | ✅ |
| Daily plain-language brief | — | ✅ |

The free audit is a one-shot design grade. Connecting turns it into continuous, runtime monitoring.

---

## Operations

### Audit my n8n (default)

Grades every workflow in your instance and returns one item: the instance grade, a per-workflow scorecard, and a connect CTA.

- **Credential:** *NoCrash — Your n8n API* (your own n8n instance URL + API key)
- **Scope:** All workflows / Active only
- **Max Workflows:** up to 50 per audit

### Heartbeat

Confirms a workflow ran by sending a ping to a NoCrash monitor.

- **Credential:** *NoCrash API* (your `nc_` key)
- **Monitor ID** (required), optional Execution ID / Duration / Metadata

### Report Failure

Records that a workflow failed, with error details.

- **Credential:** *NoCrash API* (your `nc_` key)
- **Monitor ID** + **Error Message** (required), optional Failed Node / Execution ID

---

## Install

In n8n: **Settings → Community Nodes → Install**, then enter:

```
n8n-nodes-nocrash
```

Or via npm in a self-hosted instance:

```bash
npm install n8n-nodes-nocrash
```

---

## Credentials

- **NoCrash — Your n8n API** — your n8n instance URL + an n8n API key (Settings → API in your n8n). Used only for the audit. Credentials are stripped before any workflow design is sent.
- **NoCrash API** — your NoCrash key (starts with `nc_`), created in the NoCrash dashboard under Settings → API keys. Used for Heartbeat and Report Failure.

---

## Templates

Ready-to-import starter workflows live in [`templates/`](templates/). *(The 5 launch templates are tracked in #2094.)*

---

## Links

- Public n8n Workflow Grader: <https://nocrash.io/tools/n8n-workflow-grader>
- Connect your instance: <https://nocrash.io/connect>

---

## License

[MIT](LICENSE)
