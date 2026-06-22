# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial package scaffold and V1 implementation.
- **NoCrash** node with three operations:
  - **Audit my n8n** (default) — grades every workflow in your instance via the
    NoCrash Grader and returns an instance scorecard + per-workflow rows + a
    connect CTA. Free, static design grade only.
  - **Heartbeat** — sends a ping to a NoCrash monitor.
  - **Report Failure** — records a workflow failure with error details.
- Credentials: **NoCrash — Your n8n API** (your own n8n) and **NoCrash API**
  (`nc_` bearer).
- `stripCredentials` security boundary: credentials and secret-bearing params
  are removed before any workflow design leaves your n8n.
- Zero runtime dependencies — uses only n8n's built-in request helpers.

[Unreleased]: https://github.com/nocrash-io/n8n-nodes-nocrash/commits/main
