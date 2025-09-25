# Data Model: Reorder Playlists

## Entities

### Playlist

- id: string
- title: string
- privacyStatus: enum [public, private]
- itemCount: number (<= 500)

### VideoItem

- id: string
- title: string
- channel: string
- duration: number | null (seconds)
- dateAdded: ISO 8601 datetime
- dateUploaded: ISO 8601 datetime | null
- originalIndex: number (0-based)

### SortRule

- field: enum [channel, duration, dateAdded, dateUploaded, title]
- direction: enum [asc, desc]
- precedence: number (1 = primary)

### ReorderPlan

- previewOrder: array<VideoItem.id>
- operations: array<{ id: string, from: number, to: number }>
- canUndo: boolean

### AppState

- selectedPlaylistId: string | null
- items: array<VideoItem>
- selectionIndex: number | null
- sortRules: array<SortRule>
- dirty: boolean (preview differs from original)
- lastAppliedAt: ISO 8601 datetime | null

## Validation & Rules

- Playlists over 500 items are out of scope.
- Sorting unknown values: unknowns order after known values; stable sort; tie-break on originalIndex.
- Keyboard reordering must maintain a single focused selection.
- Apply must only commit when preview differs from original.
- Undo: single-level for manual reorder operations; not required for mass sort.
