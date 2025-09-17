export function moveByDelta(order: string[], index: number, delta: number): { order: string[]; to: number } {
  const to = Math.max(0, Math.min(order.length - 1, index + delta))
  if (to === index) return { order: order.slice(), to }
  const copy = order.slice()
  const [id] = copy.splice(index, 1)
  copy.splice(to, 0, id)
  return { order: copy, to }
}

export function moveToPosition(order: string[], from: number, to: number): string[] {
  const bounded = Math.max(0, Math.min(order.length - 1, to))
  if (bounded === from) return order.slice()
  const copy = order.slice()
  const [id] = copy.splice(from, 1)
  copy.splice(bounded, 0, id)
  return copy
}
