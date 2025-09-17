import type { Playlist, VideoItem } from '../models/types'

type Store = {
  playlists: Record<
    string,
    {
      meta: Playlist
      order: string[]
      items: Record<string, VideoItem>
      version: number
    }
  >
}

const store: Store = {
  playlists: {
    TEST: (() => {
      const items: VideoItem[] = [
        { id: 'a', title: 'Alpha', channel: 'Chan A', duration: 120, dateAdded: '2025-01-01', dateUploaded: '2024-12-01', originalIndex: 0 },
        { id: 'b', title: 'Beta', channel: 'Chan B', duration: 240, dateAdded: '2025-01-02', dateUploaded: '2024-12-02', originalIndex: 1 },
        { id: 'c', title: 'Gamma', channel: 'Chan C', duration: null, dateAdded: '2025-01-03', dateUploaded: null, originalIndex: 2 },
      ]
      const order = items.map(i => i.id)
      const index: Record<string, VideoItem> = Object.fromEntries(items.map(i => [i.id, i]))
      return {
        meta: { id: 'TEST', title: 'Fixture Playlist', privacyStatus: 'private', itemCount: items.length },
        order,
        items: index,
        version: 1,
      }
    })(),
  },
}

function getPlaylistOrThrow(playlistId: string) {
  const p = store.playlists[playlistId]
  if (!p) {
    throw new Error('permission-denied')
  }
  return p
}

const fixtureFacade = {
  async loadPlaylist(playlistId: string): Promise<{ playlist: Playlist; items: VideoItem[] }> {
    const p = getPlaylistOrThrow(playlistId)
    // Simulate data fetch delay lightly
    await Promise.resolve()
    const items = p.order.map((id, idx) => ({ ...p.items[id], originalIndex: idx }))
    return { playlist: { ...p.meta, itemCount: items.length }, items }
  },
  async applyReorder(playlistId: string, newOrder: string[]): Promise<{ success: boolean; message?: string }> {
    const p = getPlaylistOrThrow(playlistId)
    // Validate that newOrder is a permutation of current ids
    const currentIds = new Set(p.order)
    if (newOrder.length !== p.order.length || newOrder.some(id => !currentIds.has(id))) {
      throw new Error('precondition-failed')
    }
    // Apply new order
    p.order = [...newOrder]
    p.version += 1
    return { success: true, message: 'Applied' }
  },
}

let selected: typeof fixtureFacade | undefined
try {
  // dynamic import only if live mode is requested
  if (import.meta.env.VITE_YT_MODE === 'live') {
    const mod = await import('./playlistFacade.live')
    selected = mod.livePlaylistFacade
  }
} catch {
  // fallback to fixture on any error
  selected = undefined
}

export const playlistFacade = selected ?? fixtureFacade
