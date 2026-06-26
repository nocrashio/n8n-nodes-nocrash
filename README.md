# n8n-nodes-nocrash

**Grade your entire n8n in 30 seconds. Free.**

This is an [n8n community node](https://docs.n8n.io/integrations/community-nodes/). Drop it into a workflow, point it at your own n8n, and get an instant X-ray of how well every workflow is built — a design grade out of 100, a per-workflow scorecard, and the one issue holding each one back. No account required to try it.

The grade tells you how *solid* your workflows are. It doesn't tell you when one quietly stops running. For that, connect your instance to NoCrash — and we'll watch every workflow around the clock and tell you, in plain language, the moment something breaks. Before your customers do.

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

  Connect to NoCrash and we watch every workflow 24/7: a runtime Reliability
  Score, AI root-cause + fix, a daily plain-language brief, and a 3am alert
  (Telegram, email, Discord, or Slack) the moment one silently breaks.

  → Start free: https://nocrash.io/?utm_source=n8n-node&utm_medium=community&utm_campaign=node-launch-2026
```

---

## Your data stays yours

> **The grading runs inside your own n8n with your own API key. Every credential and secret is stripped out on your machine before anything leaves it. We never store your workflow definitions.**

The node lists your workflows and reads how they're built, using your own n8n API key. Before any workflow is sent to the NoCrash Grader, every credential reference and secret-bearing field is removed locally (see [`stripCredentials`](nodes/Nocrash/shared/stripCredentials.ts)). The free grade looks at **design only** — it never reads what your workflows actually ran or any of your data.

---

## Free vs Connected

| | **Free (this node)** | **Connected to NoCrash** |
|---|---|---|
| Static workflow **Grade** (how well it's built) | ✅ | ✅ |
| Design-issue detection | ✅ | ✅ |
| Instance scorecard | ✅ | ✅ |
| Runtime **Reliability Score** (how it's actually behaving) | — | ✅ |
| AI root-cause + fix | — | ✅ |
| 24/7 watch — we notice when a workflow goes quiet | — | ✅ |
| 3am alerts — Telegram, email, Discord, and Slack | — | ✅ |
| Daily plain-language brief | — | ✅ |

The free grade is a one-time, design-only check — it tells you how well your workflows are built. It does **not** watch them or know when something breaks. Connecting to NoCrash adds the runtime side: continuous watching, plain-language alerts, and a daily brief.

---

## Operations

### Audit my n8n (default)

Grades every workflow in your instance and returns one item: the instance grade, a per-workflow scorecard, and a link to start watching them for real.

- **Credential:** *NoCrash — Your n8n API* (your own n8n instance URL + API key)
- **Scope:** All workflows / Active only
- **Max Workflows:** up to 50 per audit

### Heartbeat

Confirms a workflow ran by sending a ping to a NoCrash watch.

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

> **One third-party service.** This package integrates a single third-party service — **NoCrash**. The *NoCrash — Your n8n API* credential is your own n8n instance's API key, used only by the Audit operation to read your workflow design locally (credentials are stripped before anything is sent). It is not a second third-party integration.

---

## Templates

Five ready-to-import starter workflows live in [`templates/`](templates/) — a daily self-grade to Slack or Telegram, a dead-man's-switch heartbeat, an auto-report-on-error workflow, and a weekly reliability scorecard. Each one is a well-built n8n workflow you can adapt to your own steps. See [`templates/README.md`](templates/README.md).

---

## Links

- Public n8n Workflow Grader: <https://nocrash.io/tools/n8n-workflow-grader?utm_source=n8n-node&utm_medium=community&utm_campaign=node-launch-2026>
- Start watching your n8n: <https://nocrash.io/?utm_source=n8n-node&utm_medium=community&utm_campaign=node-launch-2026>

---

## License

[MIT](LICENSE)
