# Tasks: Reorder Playlists (SPA)

**Input**: Design documents from `/specs/001-build-a-small/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory → Loaded
2. Load optional design documents → data-model.md, contracts/, research.md, quickstart.md
3. Generate tasks by category → Setup, Tests, Core, Integration, Polish
4. Apply task rules → Tests before implementation; different files marked [P]
5. Number tasks sequentially; add dependency notes
6. Provide parallel execution examples
7. Validate completeness and return SUCCESS
```

## Path Conventions

- Single project SPA at repo root: `src/`, `tests/`

## Phase 3.1: Setup

- [ ] T001 Create project structure `src/` and `tests/` at repo root; add `.vscode/` settings for TypeScript.
- [ ] T002 Initialize npm project; add Vue 3 (Composition API) + Vite + TypeScript; create `index.html` and `src/main.ts`.
- [ ] T003 [P] Configure ESLint + Prettier for TypeScript/Vue; add scripts `lint`, `format`.
- [ ] T004 [P] Configure Vitest for unit/midlayer tests; add `tests/unit/` and `tests/integration/` scaffolds.
- [ ] T005 [P] Configure Playwright for smoke/E2E; add script `test:e2e` and example test.

## Phase 3.2: Tests First (TDD)

- [ ] T006 [P] Contract test: UI interactions (drag, keyboard, position entry) in `tests/contract/ui-contracts.spec.ts` based on `specs/001-build-a-small/contracts/ui-contracts.md`.
- [ ] T007 [P] Contract test: Service contracts (load/apply) in `tests/contract/service-contracts.spec.ts` based on `specs/001-build-a-small/contracts/service-contracts.md`.
- [ ] T008 [P] Integration test: Primary user story (load 50+, reorder by drag, keyboard, position, apply) in `tests/integration/primary-user-story.spec.ts` aligned with `quickstart.md`.
- [ ] T009 [P] Integration test: Multi-sort scenario (channel asc, title asc) in `tests/integration/multisort.spec.ts`.

## Phase 3.3: Core Implementation

- [ ] T010 [P] Models: Define TypeScript types for `Playlist`, `VideoItem`, `SortRule`, `ReorderPlan`, `AppState` in `src/models/types.ts` (from data-model.md).
- [ ] T011 [P] Service: Sorting utilities with stable multi-key sort and unknown handling in `src/services/sortService.ts`.
- [ ] T012 [P] Service: Reorder operations (move by delta, move to position, apply preview) in `src/services/reorderService.ts`.
- [ ] T013 [P] Service: App state management (selection, dirty state, undo) in `src/services/stateService.ts`.
- [ ] T014 API Facade: Abstract interface for loading playlist and applying order in `src/lib/playlistFacade.ts` (no backend; stub/fixture based for now).
- [ ] T015 UI: Base SPA shell with list view, selection, and Apply/Undo controls in `src/components/App.vue`.
- [ ] T016 UI: Keyboard handler implementing shortcuts per research in `src/components/KeyboardHandler.ts` and wiring in `App.vue`.
- [ ] T017 UI: Multi-sort configuration panel in `src/components/MultiSortPanel.vue`.
- [ ] T018 UI: Direct position entry control in `src/components/PositionPrompt.vue`.

## Phase 3.4: Integration & Observability

- [ ] T019 Wire services to UI: connect sort/reorder/state services and facade in `App.vue`.
- [ ] T020 Add accessibility: focus outlines, ARIA labels/roles, and keyboard focus management across list and controls.
- [ ] T021 Add error handling & messages for permission, quota, and transient errors; surface status/progress for large lists.
- [ ] T022 Add unsaved-changes confirmation on navigation away.

## Phase 3.5: Polish

- [ ] T023 [P] Unit tests for sortService and reorderService in `tests/unit/sortService.spec.ts` and `tests/unit/reorderService.spec.ts`.
- [ ] T024 [P] Performance test: ensure sorting 500 items and preview updates complete within targets using synthetic data in `tests/perf/500items.spec.ts`.
- [ ] T025 [P] Update `README.md` Quickstart to reference `specs/001-build-a-small/quickstart.md` and add run/test commands.
- [ ] T026 Clean up TODOs, ensure ESLint/Prettier pass, and finalize scripts.

## Dependencies

- T001 → T002
- T002 → T003, T004, T005 (parallel)
- Tests-first: T006–T009 before implementation: T010–T018
- Models (T010) before services T011–T013
- Services before UI wiring: T015–T019
- API Facade (T014) before integration tests that rely on loading/applying
- Integration & Observability (T019–T022) after core UI/Services
- Polish (T023–T026) last

## Parallel Execution Examples

```
# After T002, run setup in parallel
Task: "Configure ESLint/Prettier" (T003)
Task: "Configure Vitest" (T004)
Task: "Configure Playwright" (T005)

# Tests-first parallel
Task: "UI contract tests" (T006)
Task: "Service contract tests" (T007)
Task: "Integration test: primary story" (T008)
Task: "Integration test: multi-sort" (T009)
```

## Validation Checklist

- [ ] All contracts have corresponding tests (T006, T007)
- [ ] All entities have model tasks (T010)
- [ ] All tests come before implementation (T006–T009 before T010+)
- [ ] Parallel tasks use different files
- [ ] Each task includes exact file paths
- [ ] No [P] tasks modify the same file
