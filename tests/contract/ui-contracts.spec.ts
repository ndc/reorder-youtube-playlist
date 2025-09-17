import { describe, it, expect } from 'vitest'
import { moveToPosition } from '../../src/services/reorderService'
import { stableMultiSort } from '../../src/services/sortService'
import { initialState, setSelection, applyMoveDelta, applyMoveTo } from '../../src/services/stateService'
import type { VideoItem, SortRule } from '../../src/models/types'

// UI Contracts validated via mid-layer services per Constitution (Midlayer Testing)

describe('UI Contracts', () => {
  it('drag-and-drop updates preview order (contract via reorder service)', () => {
    const ids = ['a', 'b', 'c']
    const out = moveToPosition(ids, 2, 0) // drag c to top
    expect(out).toEqual(['c', 'a', 'b'])
  })

  it('keyboard shortcuts move selected item and support move-to-position (contract via state service)', () => {
    const items: VideoItem[] = [
      { id: 'a', title: 'A', channel: 'X', duration: 10, dateAdded: '2025-01-01', dateUploaded: '2024-01-01', originalIndex: 0 },
      { id: 'b', title: 'B', channel: 'X', duration: 20, dateAdded: '2025-01-02', dateUploaded: '2024-01-02', originalIndex: 1 },
      { id: 'c', title: 'C', channel: 'Y', duration: 30, dateAdded: '2025-01-03', dateUploaded: '2024-01-03', originalIndex: 2 },
    ]
    let state = initialState()
    state = { ...state, items }
    state = setSelection(state, 1) // select 'b'
    state = applyMoveDelta(state, 1) // Ctrl+Down equivalent
    expect(state.items.map(i => i.id)).toEqual(['a', 'c', 'b'])
    state = applyMoveTo(state, 0) // Move to position 0
    expect(state.items.map(i => i.id)).toEqual(['b', 'a', 'c'])
  })

  it('multi-sort applies deterministic ordering with stable ties (contract via sort service)', () => {
    const items: VideoItem[] = [
      { id: '1', title: 'B', channel: 'Z', duration: 10, dateAdded: '2025-01-01', dateUploaded: '2024-01-01', originalIndex: 0 },
      { id: '2', title: 'A', channel: 'Z', duration: 10, dateAdded: '2025-01-01', dateUploaded: '2024-01-01', originalIndex: 1 },
      { id: '3', title: 'C', channel: 'A', duration: null, dateAdded: '2025-01-01', dateUploaded: null, originalIndex: 2 },
    ]
    const rules: SortRule[] = [
      { field: 'channel', direction: 'asc', precedence: 1 },
      { field: 'title', direction: 'asc', precedence: 2 },
    ]
    const out = stableMultiSort(items, rules)
    expect(out.map(i => i.id)).toEqual(['3', '2', '1'])
  })

  it.skip('apply commits preview and shows success/failure (contract)', () => {
    // TODO: Wire a fake facade implementation and assert apply behavior end-to-end
  })
})
