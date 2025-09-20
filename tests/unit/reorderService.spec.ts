import { describe, it, expect } from 'vitest'
import { moveByDelta, moveToPosition } from '../../src/services/reorderService'

describe('reorderService', () => {
  it('moveByDelta moves within bounds', () => {
    const { order, to } = moveByDelta(['a', 'b', 'c'], 1, 1)
    expect(order).toEqual(['a', 'c', 'b'])
    expect(to).toBe(2)
  })

  it('moveToPosition inserts at target', () => {
    const out = moveToPosition(['a', 'b', 'c'], 0, 2)
    expect(out).toEqual(['b', 'c', 'a'])
  })
})
