# Service Contracts: Reorder Playlists

## Load Playlist

- Input: playlistId (string)
- Output: { playlist: Playlist, items: VideoItem[] }
- Errors: permission-denied, quota-exceeded, transient-error

## Apply Reorder

- Input: playlistId (string), newOrder: string[] (array of VideoItem.id in desired order)
- Output: { success: boolean, message?: string }
- Errors: permission-denied, precondition-failed (concurrency), quota-exceeded, transient-error
