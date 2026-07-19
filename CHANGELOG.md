# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.5] - 2026-07-19

### Changed

- Heartbeat and Report Failure operations: sharpened the **Monitor ID** field so a new user knows exactly what to enter. The field now shows a `mon_1a2b3c4d5e6f` placeholder and its hint names the exact source ("starts with mon_ and is shown on the watch's page in your NoCrash account") plus a note that Audit does not need it. Prompted by a real user hitting the generic "Parameter Monitor ID is required" error with no idea where the value comes from.

## [0.1.2] - 2026-06-24

### Changed

- README: clarified that the package integrates a single third-party service (NoCrash); the n8n-instance credential is the user's own instance, used only for the local Audit read.

## [0.1.1] - 2026-06-22

### Fixed

- Corrected the GitHub organization slug in package metadata (`repository` + `bugs` URLs), the publish workflow, and CODEOWNERS: `nocrash-io` -> `nocrashio`.

### Changed

- First release published via OIDC trusted publishing with npm provenance.

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

[Unreleased]: https://github.com/nocrashio/n8n-nodes-nocrash/commits/main
