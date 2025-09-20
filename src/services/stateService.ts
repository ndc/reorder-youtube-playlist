import type { AppState, SortRule } from '../models/types'
import { moveByDelta, moveToPosition } from './reorderService'

export function initialState(): AppState {
    return {
        selectedPlaylistId: null,
        items: [],
        selectionIndex: null,
        sortRules: [],
        dirty: false,
        lastAppliedAt: null,
    }
}

export function setSelection(state: AppState, index: number | null): AppState {
    return { ...state, selectionIndex: index }
}

export function applyMoveDelta(state: AppState, delta: number): AppState {
    if (state.selectionIndex == null) return state
    const ids = state.items.map((i) => i.id)
    const { order, to } = moveByDelta(ids, state.selectionIndex, delta)
    const reordered = order.map((id) => state.items.find((it) => it.id === id)!)
    return { ...state, items: reordered, selectionIndex: to, dirty: true }
}

export function applyMoveTo(state: AppState, to: number): AppState {
    if (state.selectionIndex == null) return state
    const ids = state.items.map((i) => i.id)
    const order = moveToPosition(ids, state.selectionIndex, to)
    const reordered = order.map((id) => state.items.find((it) => it.id === id)!)
    const newIndex = order.indexOf(ids[state.selectionIndex])
    return { ...state, items: reordered, selectionIndex: newIndex, dirty: true }
}

export function setSortRules(state: AppState, rules: SortRule[]): AppState {
    return { ...state, sortRules: rules, dirty: true }
}
