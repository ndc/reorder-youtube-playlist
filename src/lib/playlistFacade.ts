export type Playlist = { id: string; title: string; privacyStatus: 'public' | 'private'; itemCount: number }
export type VideoItem = { id: string; title: string; channel: string; duration: number | null; dateAdded: string; dateUploaded: string | null; originalIndex: number }

function notImplemented(): never {
  throw new Error('Not implemented')
}

export const playlistFacade = {
  async loadPlaylist(_playlistId: string): Promise<{ playlist: Playlist; items: VideoItem[] }> {
    notImplemented()
  },
  async applyReorder(_playlistId: string, _newOrder: string[]): Promise<{ success: boolean; message?: string }> {
    notImplemented()
  },
}
