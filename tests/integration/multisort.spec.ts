import { describe, it, expect } from 'vitest'
import { stableMultiSort } from '../../src/services/sortService'
import type { SortRule, VideoItem } from '../../src/models/types'

// Multi-sort integration: channel asc, title asc; stable ordering with unknowns last.

describe('Multi-sort Integration', () => {
  it('applies deterministic multi-field sort', () => {
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
})
