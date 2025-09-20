import { describe, it, expect } from 'vitest'
import { playlistFacade } from '../../src/lib/playlistFacade'

describe('Service Contracts', () => {
  it('loads a playlist with items (contract)', async () => {
    const { playlist, items } = await playlistFacade.loadPlaylist('TEST')
    expect(playlist.id).toBe('TEST')
    expect(items.length).toBeGreaterThan(0)
    expect(items.map(i => i.id)).toEqual(['a', 'b', 'c'])
  })

  it('applies a new order (contract)', async () => {
    const order = ['c', 'a', 'b']
    const result = await playlistFacade.applyReorder('TEST', order)
    expect(result.success).toBe(true)
    const { items } = await playlistFacade.loadPlaylist('TEST')
    expect(items.map(i => i.id)).toEqual(order)
  })
})
