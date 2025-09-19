import type { Playlist, VideoItem } from '../models/types'
import { getAccessToken, clearAccessToken } from './youtubeAuth'
type FetchOptions = { retry401?: boolean; retries?: number; signal?: AbortSignal }
async function ytFetch(path: string, init: RequestInit = {}, options: FetchOptions = {}) {
    const { retry401 = true, retries = 2, signal } = options
    let attempts = 0
    let lastErr: any
    while (attempts <= retries) {
        attempts++
        const token = await getAccessToken(['https://www.googleapis.com/auth/youtube'])
        const resp = await fetch(`https://www.googleapis.com/youtube/v3${path}`, {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                ...(init.headers || {}),
            },
            signal,
        })
        if (resp.ok) {
            return resp.json()
        }
        const status = resp.status
        let reason = ''
        try {
            const text = await resp.text()
            const err = JSON.parse(text)
            reason = err?.error?.errors?.[0]?.reason ?? ''
        } catch {}
        if (status === 401) {
            if (retry401) {
                clearAccessToken()
                continue
            }
            throw new Error('permission-denied')
        }
        if (status === 403 && /quota/i.test(reason)) throw new Error('quota-exceeded')
        if (status === 404 || status === 409 || status === 412)
            throw new Error('precondition-failed')
        if (status === 429 || (status >= 500 && status < 600)) {
            lastErr = new Error('transient-error')
            // simple exponential backoff
            const delay = Math.min(1000 * attempts, 3000)
            await new Promise((r) => setTimeout(r, delay))
            continue
        }
        throw new Error('transient-error')
    }
    throw lastErr ?? new Error('transient-error')
}

async function fetchPlaylistMeta(playlistId: string): Promise<Playlist> {
    const data = await ytFetch(
        `/playlists?part=snippet,status,contentDetails&id=${encodeURIComponent(playlistId)}`
    )
    const item = data.items?.[0]
    if (!item) throw new Error('permission-denied')
    return {
        id: item.id,
        title: item.snippet?.title ?? 'Playlist',
        privacyStatus: item.status?.privacyStatus ?? 'private',
        itemCount: item.contentDetails?.itemCount ?? 0,
    }
}

type PlaylistItemLite = {
    id: string
    etag: string | null
    videoId: string
    title: string
    channel: string
    dateAdded: string
}

async function fetchAllPlaylistItems(playlistId: string): Promise<PlaylistItemLite[]> {
    let pageToken = ''
    const items: PlaylistItemLite[] = []
    do {
        const q = new URLSearchParams({
            part: 'snippet,contentDetails',
            maxResults: '50',
            playlistId,
        })
        if (pageToken) q.set('pageToken', pageToken)
        const data = await ytFetch(`/playlistItems?${q.toString()}`)
        for (const it of data.items ?? []) {
            const id = it.id as string
            const etag = (it.etag as string) || null
            const videoId = it.contentDetails?.videoId as string
            const title = it.snippet?.title as string
            const channel = (it.snippet?.videoOwnerChannelTitle as string) || ''
            const dateAdded = it.snippet?.publishedAt as string
            items.push({ id, etag, videoId, title, channel, dateAdded })
        }
        pageToken = data.nextPageToken ?? ''
    } while (pageToken)
    return items
}

export const livePlaylistFacade = {
    async loadPlaylist(playlistId: string): Promise<{ playlist: Playlist; items: VideoItem[] }> {
        const [meta, pItems] = await Promise.all([
            fetchPlaylistMeta(playlistId),
            fetchAllPlaylistItems(playlistId),
        ])
        const items: VideoItem[] = pItems.map((p, i) => ({
            id: p.id, // playlistItemId for reordering
            title: p.title,
            channel: p.channel,
            duration: null, // optional enhancement via videos.list
            dateAdded: p.dateAdded,
            dateUploaded: null,
            originalIndex: i,
        }))
        return { playlist: { ...meta, itemCount: items.length }, items }
    },
    async applyReorder(
        playlistId: string,
        newOrder: string[]
    ): Promise<{ success: boolean; message?: string }> {
        // Need mapping from playlistItem.id -> videoId to satisfy update payload
        const current = await fetchAllPlaylistItems(playlistId)
        const byId = new Map(current.map((ci) => [ci.id, ci]))
        if (newOrder.length !== current.length || newOrder.some((id) => !byId.has(id))) {
            throw new Error('precondition-failed')
        }
        // Apply updates sequentially to set snippet.position
        for (let i = 0; i < newOrder.length; i++) {
            const itemId = newOrder[i]
            const ci = byId.get(itemId)!
            const body = {
                id: ci.id,
                snippet: {
                    playlistId,
                    position: i,
                    resourceId: { kind: 'youtube#video', videoId: ci.videoId },
                },
            }
            await ytFetch(`/playlistItems?part=snippet`, {
                method: 'PUT',
                body: JSON.stringify(body),
                headers: ci.etag ? { 'If-Match': ci.etag } : undefined,
            })
        }
        return { success: true, message: 'Applied' }
    },
}
