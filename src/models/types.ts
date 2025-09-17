export type Playlist = { id: string; title: string; privacyStatus: 'public' | 'private'; itemCount: number }
export type VideoItem = {
  id: string
  title: string
  channel: string
  duration: number | null
  dateAdded: string
  dateUploaded: string | null
  originalIndex: number
}
export type SortField = 'channel' | 'duration' | 'dateAdded' | 'dateUploaded' | 'title'
export type SortDirection = 'asc' | 'desc'
export type SortRule = { field: SortField; direction: SortDirection; precedence: number }
export type ReorderPlan = { previewOrder: string[]; operations: { id: string; from: number; to: number }[]; canUndo: boolean }
export type AppState = {
  selectedPlaylistId: string | null
  items: VideoItem[]
  selectionIndex: number | null
  sortRules: SortRule[]
  dirty: boolean
  lastAppliedAt: string | null
}
