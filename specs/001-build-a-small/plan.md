# Implementation Plan: Reorder YouTube Playlists

**Branch**: `001-build-a-small` | **Date**: 2025-09-17 | **Spec**: C:\Spikes\SpecKit\reorder-youtube-playlist\specs\001-build-a-small\spec.md
**Input**: Feature specification from `/specs/001-build-a-small/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → Loaded successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Project Type detected: web (frontend-only SPA)
   → Structure Decision: Option 1 (single project: src/ + tests/)
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → No blockers; note an exception for external API tests in CI
   → Progress Tracking updated: Initial Constitution Check
5. Execute Phase 0 → research.md
   → All prior NEEDS CLARIFICATION resolved with documented choices
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific file
   → Generated artifacts in /specs/001-build-a-small
7. Re-evaluate Constitution Check section
   → PASS with one documented exception
8. Plan Phase 2 → Describe task generation approach (see Phase 2)
9. STOP - Ready for /tasks command
```

## Summary
Enable playlist owners to reorder up to 500 videos using drag-and-drop, keyboard controls, direct position entry, and multi-field sorting (channel, duration, date added, date uploaded, title). Deliver as a small, client-only web app to streamline playlist organization while remaining accessible and keyboard-friendly.

## Technical Context
**Language/Version**: TypeScript (ES2022 targets)  
**Primary Dependencies**: Vue 3 (Composition API)  
**Storage**: N/A (no backend; in-memory state)  
**Testing**: Vitest (unit/mid-layer), Playwright (smoke/E2E)  
**Target Platform**: Modern desktop/mobile browsers  
**Project Type**: single/web (frontend-only SPA; no backend server)  
**Performance Goals**: Load and render 500 items with responsive UI (<200ms per sort, initial usable <2s on typical broadband)  
**Constraints**: Keyboard operable; WCAG 2.1 AA basics; respect external API quotas; no secrets persisted  
**Scale/Scope**: Single-user tool; playlists up to 500 items; limited concurrency awareness  

Technical Context inputs from user: build with Vue 3 in Composition API as a SPA without backend; use TypeScript.

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Functional Style: Service functions will be pure where practical; plan isolates mutations to state management and DOM interactions.
- Simplicity First: Single SPA, minimal deps; no backend introduced.
- Web-App Focus: Clear separation between UI components, domain logic, and API facade.
- Midlayer Testing: Plan includes midlayer tests targeting the playlist/domain services. For external API calls, use a thin facade; CI uses recorded fixtures to avoid quota issues. Live tests can be run manually with developer tokens.
- Observability & Errors: User-facing error messaging; structured console logs without PII; lightweight diagnostics.
- Accessibility: Keyboard-first interactions; screen-reader friendly labels; focus management.

Conclusion: PASS with a limited exception to “actual APIs” in CI due to third-party quotas (documented in Complexity Tracking).

## Project Structure

### Documentation (this feature)
```
specs/001-build-a-small/
├── plan.md              # This file (/plan output)
├── research.md          # Phase 0 output (/plan)
├── data-model.md        # Phase 1 output (/plan)
├── quickstart.md        # Phase 1 output (/plan)
├── contracts/           # Phase 1 output (/plan)
└── tasks.md             # Phase 2 output (/tasks - not created here)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── components/
└── lib/

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: Option 1. SPA only; no backend project created.

## Phase 0: Outline & Research
See `research.md` for resolved unknowns and decisions:
- Ownership scope: only playlists owned by the authenticated user.
- Keyboard shortcuts: Up/Down to navigate selection; Ctrl+Up/Down to move item; Enter opens “Move to position”; Home/End jump to start/end; PageUp/Down scroll page; `?` opens help.
- Unknown metadata in sort: treat as greater than known values (i.e., appear last) with stable original order; ties break by original index.
- Accessibility target: keyboard operable; ARIA patterns; meets essential WCAG 2.1 AA.
- Data retention: no server; tokens kept only in browser memory/session; no PII persisted.
- Collation/case: locale-aware, case-insensitive compare with numeric option; default to user agent locale.
- Undo: single-level undo before Apply (optional; aim to include).

## Phase 1: Design & Contracts
Artifacts generated:
- `data-model.md`: Entities (Playlist, VideoItem, SortRule, ReorderPlan, AppState) and validation rules.
- `contracts/ui-contracts.md`: UI interaction contracts (drag, keyboard, direct position entry) and observable behaviors.
- `contracts/service-contracts.md`: Facade contracts for playlist load and apply operations.
- `quickstart.md`: Dev setup and smoke test guidance (to be used post-implementation).
- Agent context updated via `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`.

## Phase 2: Task Planning Approach
The /tasks command will:
- Generate tasks from data-model and contracts.
- Create contract test tasks (UI/service contracts) [P].
- Create model/service implementation tasks [P].
- Create integration test tasks based on user story and quickstart.
- Order by TDD: tests then implementation; models → services → UI.

## Complexity Tracking
| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| CI uses recorded fixtures for external API | Third-party quotas/consent | Live API in CI is flaky and requires secrets/quotas |

## Progress Tracking
**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v1.0.0 - See `/.specify/memory/constitution.md`*
