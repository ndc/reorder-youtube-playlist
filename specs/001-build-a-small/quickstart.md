# Quickstart: Reorder Playlists (SPA)

## Prerequisites

- Node.js LTS and npm installed
- Modern browser

## Run (local)

- This plan targets a frontend-only SPA. Implementation will build a Vue 3 + TypeScript app in `src/` with tests in `tests/`.
- After implementation, run `npm install` then `npm run dev` to start the app.

## Smoke Test Scenario

1. Open the app and authenticate (if applicable).
2. Select a playlist with ~50+ items.
3. Perform a drag-and-drop move; verify preview updates and Apply is enabled.
4. Use keyboard: select an item and press Ctrl+Up/Down; verify movement.
5. Use direct position: move item to position N; verify placement.
6. Apply changes; verify success message and list reflects new order.
7. Try a multi-sort (e.g., channel asc, title asc) and verify deterministic ordering.
