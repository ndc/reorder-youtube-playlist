# UI Contracts: Reorder YouTube Playlists

## Interactions
- Drag-and-Drop: Drag item A above/below item B updates preview order instantly.
- Keyboard Reorder: With an item selected, Ctrl+Up/Down moves the item by 1; Enter prompts for position N to move item there.
- Multi-Sort: User sets ordered list of fields with asc/desc; applying sort updates preview order deterministically.
- Apply: Commits preview order; shows success/failure outcome.
- Undo (optional): Reverts the last manual move before Apply.

## Observable Behaviors
- Focus is always visible; keyboard users can select/move items without the mouse.
- Unknown metadata does not cause errors; items are placed after known values.
- Tie-breaking preserves original order among equals.
- Navigation away with unsaved changes triggers a confirmation prompt.