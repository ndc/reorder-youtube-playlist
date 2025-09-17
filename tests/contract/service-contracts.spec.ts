import { describe, it, expect } from 'vitest'
import { playlistFacade } from '../../src/lib/playlistFacade'

describe('Service Contracts', () => {
  it('loads a playlist with items (contract)', async () => {
    await expect(async () => {
      // this should throw until implemented
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _ = await playlistFacade.loadPlaylist('TEST')
    }).rejects.toThrow()
  })

  it('applies a new order (contract)', async () => {
    await expect(async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _ = await playlistFacade.applyReorder('TEST', ['a', 'b'])
    }).rejects.toThrow()
  })
})
