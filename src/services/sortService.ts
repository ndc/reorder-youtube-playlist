import type { SortRule, VideoItem } from '../models/types'

function compareStrings(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: 'accent', numeric: true })
}

function compareNullableNumber(a: number | null, b: number | null): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return a - b
}

function compareISODate(a: string | null, b: string | null): number {
  if (!a && !b) return 0
  if (!a) return 1
  if (!b) return -1
  return a.localeCompare(b)
}

export function stableMultiSort(items: VideoItem[], rules: SortRule[]): VideoItem[] {
  const byIndex = new Map(items.map((it, idx) => [it.id, idx]))
  const sorted = [...items].sort((x, y) => {
    for (const rule of rules.sort((r1, r2) => r1.precedence - r2.precedence)) {
      let cmp = 0
      switch (rule.field) {
        case 'channel':
          cmp = compareStrings(x.channel, y.channel)
          break
        case 'title':
          cmp = compareStrings(x.title, y.title)
          break
        case 'duration':
          cmp = compareNullableNumber(x.duration, y.duration)
          break
        case 'dateAdded':
          cmp = compareISODate(x.dateAdded, y.dateAdded)
          break
        case 'dateUploaded':
          cmp = compareISODate(x.dateUploaded, y.dateUploaded)
          break
      }
      if (rule.direction === 'desc') cmp = -cmp
      if (cmp !== 0) return cmp
    }
    return (byIndex.get(x.id)! - byIndex.get(y.id)!)
  })
  return sorted
}
