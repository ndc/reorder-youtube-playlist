# Phase 0 Research: Reorder Playlists

## Decisions

- Ownership Scope: Only playlists owned by the authenticated user are reorderable.
- Max Items: Support up to 500 videos per playlist with responsive list operations.
- Keyboard Shortcuts:
    - Navigation: Up/Down (move selection), Home/End (jump), PageUp/PageDown (page).
    - Reorder: Ctrl+Up (move up), Ctrl+Down (move down), Enter (Move to position prompt), Ctrl+Z (Undo).
    - Help: `?` toggles shortcuts overlay.
- Sorting Unknowns: Items with missing metadata sort after known values; stable sort preserves original order among equals; final tie-breaker is original index.
- Collation & Case: Locale-aware, case-insensitive, numeric-aware comparison for strings (title/channel).
- Accessibility: Keyboard-operable UI, visible focus, ARIA labels/roles for lists and controls.
- Data Handling: No backend. No tokens or PII persisted beyond session memory. Clear error states and retry guidance.
- Undo: Single-level undo for manual moves before Apply.

## Alternatives Considered

- Dedicated backend to proxy API: Rejected to keep scope small and avoid server ops.
- Full E2E live API testing in CI: Rejected due to quotas and secrets; use recorded fixtures for CI and manual live validation locally.

## Open Questions (resolved)

- Apply semantics: Apply overwrites playlist order with preview order atomically from the user's perspective; failures surface error with guidance to retry.
- Concurrency: If external changes detected before Apply, prompt user to refresh or continue with known risk.
