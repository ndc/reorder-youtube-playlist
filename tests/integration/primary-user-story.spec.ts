import { describe, it, expect } from 'vitest'
import { initialState, setSelection, applyMoveDelta, applyMoveTo } from '../../src/services/stateService'
import type { VideoItem } from '../../src/models/types'

// Primary user story integration: load N items, reorder via drag/keyboard/position, then apply

describe('Primary User Story', () => {
  it('allows reordering via keyboard and position before apply', () => {
    const items: VideoItem[] = Array.from({ length: 5 }).map((_, i) => ({
      id: String(i + 1),
      title: `T${i + 1}`,
      channel: 'C',
      duration: 10 * (i + 1),
      dateAdded: `2025-01-0${i + 1}`,
      dateUploaded: `2024-01-0${i + 1}`,
      originalIndex: i,
    }))
    let state = initialState()
    state = { ...state, items }
    state = setSelection(state, 1) // select item 2
    state = applyMoveDelta(state, 1) // move down
    expect(state.items.map(i => i.id)).toEqual(['1', '3', '2', '4', '5'])
    state = applyMoveTo(state, 0) // move selected to top
    expect(state.items.map(i => i.id)).toEqual(['2', '1', '3', '4', '5'])
  })
})
