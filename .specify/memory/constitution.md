# Reorder YouTube Playlist Constitution
<!-- Minimal constitution for a small web application -->

## Core Principles

### Functional Style
Whenever possible follow functional style: avoid side effects, transformation over mutation, deterministic functions, isolate mutations.

### Simplicity First
Keep scope narrow, UX straightforward, and dependencies minimal. Avoid premature abstractions; prefer small, readable modules.

### Web-App Focus
Deliver a lightweight web UI with clear separation of concerns (UI, domain logic, API calls). Support responsive design and mobile display.

### Midlayer Testing
Unit test is too low and UI test is too high. Aim to test the services / libraries with actual DB or APIs. Avoid using complex mocks. Test data setup and teardown should use actual services.

### Observability & Errors
Provide human-friendly error messages and structured logs (no PII). Capture basic metrics/server logs when applicable to diagnose issues.

## Constraints & Standards
Technology-agnostic by default. Support modern browsers. Follow essential WCAG 2.1 AA practices (keyboard access, contrast, labels). Respect external API quotas/limits and comply with the provider’s policies.

## Development Workflow
Branch-per-change with PRs. At least one approval for non-trivial changes. CI runs formatter/linter, type-checks (if applicable), unit tests, and the critical-path smoke test. Use Semantic Versioning for releases and tag versions. Document setup/run/deploy in the README.

**Version**: 1.0.0 | **Ratified**: 2025-09-16 | **Last Amended**: 2025-09-16