<template>
    <main>
        <h1>Reorder Playlist</h1>
        <section class="controls">
            <div class="inline">
                <label>
                    <span>Playlist</span>
                    <select v-model="selectedPlaylistId" aria-label="Select Playlist">
                        <option disabled value="">
                            {{ isLive ? 'Sign in to list playlists…' : 'Select a playlist' }}
                        </option>
                        <option v-for="pl in playlists" :key="pl.id" :value="pl.id">
                            {{ pl.title }} ({{ pl.itemCount }})
                        </option>
                    </select>
                </label>
                <button class="ghost" @click="listPlaylists" :disabled="playlistsLoading">
                    {{ playlistsLoading ? 'Loading…' : 'Refresh' }}
                </button>
            </div>
            <span class="mode" :title="isLive ? 'Live YouTube API' : 'Fixture data'"
                >Mode: {{ isLive ? 'live' : 'fixture' }}</span
            >
            <button v-if="isLive" class="ghost" @click="signOut" :disabled="signingOut">
                {{ signingOut ? 'Signing out…' : 'Sign out' }}
            </button>
            <button @click="load()" :disabled="loading || !selectedPlaylistId">Load</button>
            <button @click="moveUp" :disabled="!canMoveUp">Move Up</button>
            <button @click="moveDown" :disabled="!canMoveDown">Move Down</button>
            <button @click="moveTop" :disabled="!hasSelection">Move To Top</button>
            <button @click="openPositionPrompt" aria-haspopup="dialog" :disabled="!hasSelection">
                Move To Position…
            </button>
            <button @click="toggleSortPanel">Multi-Sort</button>
            <button @click="undo" :disabled="!canUndo">Undo</button>
            <button @click="() => openHelp()" aria-haspopup="dialog">Help</button>
            <button class="primary" @click="apply" :disabled="!dirty || applying">
                Apply Changes
            </button>
        </section>

        <p
            v-if="message"
            aria-live="polite"
            :class="{ ok: messageType === 'ok', err: messageType === 'err' }"
        >
            {{ message }}
            <button v-if="retry" class="ghost" @click="doRetry" :disabled="applying || loading">
                Retry
            </button>
        </p>

        <MultiSortPanel
            v-if="showSort"
            :rules="sortRules"
            @update:rules="updateRules"
            @apply-sort="applySorting"
            @close="showSort = false"
        />

        <div v-if="helpOpen" class="overlay" @click.self="closeHelp()">
            <div class="modal" role="dialog" aria-modal="true" aria-labelledby="kbd-title">
                <header>
                    <h3 id="kbd-title">Help & Shortcuts</h3>
                    <button class="ghost" @click="closeHelp()">Close</button>
                </header>
                <p class="help-intro">
                    Load a YouTube playlist, reorder items with keyboard (or the buttons),
                    optionally apply multi-column sorting, or jump an item directly to a target
                    position. Press “Apply Changes” to push the new order to YouTube. Undo reverts
                    only the most recent move/sort.
                </p>
                <h4>Keyboard</h4>
                <ul>
                    <li><strong>Up / Down</strong>: Move selected item by 1</li>
                    <li><strong>Ctrl+Up / Ctrl+Down</strong>: Move selected item by 5</li>
                    <li><strong>Home / End</strong>: Move to first / last position</li>
                    <li><strong>Enter</strong>: Prompt for specific position</li>
                    <li><strong>?</strong>: Toggle this help</li>
                </ul>
                <h4>Other Tips</h4>
                <ul>
                    <li>
                        Use Multi-Sort to sort by multiple fields, then fine-tune individual items.
                    </li>
                    <li>Changes are not saved until you click Apply Changes.</li>
                    <li>
                        If the playlist changed elsewhere, you'll see a precondition message—reload
                        and re-apply.
                    </li>
                </ul>
                <a href="./privacypolicy.html" target="_blank" rel="noopener noreferrer"
                    >Privacy Policy</a
                >
            </div>
        </div>

        <PositionPrompt
            v-if="showPosition"
            :max="items.length"
            :initial="(selectionIndex ?? 0) + 1"
            @submit="onPositionSubmit"
            @close="showPosition = false"
        />

        <PositionPrompt
            v-if="showPosition"
            :max="items.length"
            :initial="(selectionIndex ?? 0) + 1"
            @submit="onPositionSubmit"
            @close="showPosition = false"
        />

        <ol
            class="list"
            v-if="items.length"
            role="listbox"
            aria-label="Playlist items"
            :aria-activedescendant="activeDesc"
        >
            <li
                v-for="(it, i) in items"
                :key="it.id"
                :class="{ selected: selectionIndex === i }"
                role="option"
                :aria-selected="selectionIndex === i"
                @click="select(i)"
                :tabindex="selectionIndex === i ? 0 : -1"
                @keydown="onKey($event, i)"
                :id="'item-' + it.id"
                :ref="assignItemRef(i)"
            >
                <span class="index">{{ i + 1 }}.</span>
                <span class="title">{{ it.title }}</span>
                <span class="meta">{{ it.channel }}</span>
            </li>
        </ol>
        <p v-else>No items loaded.</p>
    </main>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { playlistFacade } from './lib/playlistFacade'
import {
    initialState,
    setSelection,
    applyMoveDelta,
    applyMoveTo,
    setSortRules,
} from './services/stateService'
import { stableMultiSort } from './services/sortService'
import type { AppState } from './models/types'
import MultiSortPanel from './components/MultiSortPanel.vue'
import PositionPrompt from './components/PositionPrompt.vue'
import type { Playlist } from './models/types'
import { revokeAccess } from './lib/youtubeAuth'

const state = ref<AppState>(initialState())
const loading = ref(false)
const applying = ref(false)
const message = ref('')
const messageType = ref<'ok' | 'err' | ''>('')
const helpOpen = ref(false)
const FIRST_VISIT_KEY = 'ryp:firstVisitShown'
// Default to live; set VITE_YT_MODE="dev" to use the local facade
const isLive = (import.meta as any).env?.VITE_YT_MODE !== 'dev'
const playlists = ref<Playlist[]>([])
const playlistsLoading = ref(false)
const selectedPlaylistId = ref<string>('')
const signingOut = ref(false)
let lastAction: null | (() => Promise<void>) = null
let lastActionKind: null | 'load' | 'apply' = null
const retry = ref<null | (() => void)>(null)

// Single-level undo snapshot
type Snapshot = { items: AppState['items']; selectionIndex: number | null; dirty: boolean }
const prevSnapshot = ref<Snapshot | null>(null)
const canUndo = computed(() => prevSnapshot.value != null)

const items = computed(() => state.value.items)
const selectionIndex = computed(() => state.value.selectionIndex)
const dirty = computed(() => state.value.dirty)
const sortRules = computed(() => state.value.sortRules)

const hasSelection = computed(() => selectionIndex.value != null)
const canMoveUp = computed(() => hasSelection.value && (selectionIndex.value as number) > 0)
const canMoveDown = computed(
    () => hasSelection.value && (selectionIndex.value as number) < items.value.length - 1
)

const showSort = ref(false)
const showPosition = ref(false)
function toggleSortPanel() {
    showSort.value = !showSort.value
}
function updateRules(rules: AppState['sortRules']) {
    state.value = setSortRules(state.value, rules)
}
function applySorting() {
    if (!state.value.sortRules.length) return
    captureSnapshot()
    const sorted = stableMultiSort(state.value.items, state.value.sortRules)
    const selectedId =
        state.value.selectionIndex != null ? state.value.items[state.value.selectionIndex].id : null
    state.value = {
        ...state.value,
        items: sorted,
        dirty: true,
        selectionIndex: selectedId ? sorted.findIndex((i) => i.id === selectedId) : null,
    }
    showSort.value = false
}

function select(i: number) {
    state.value = setSelection(state.value, i)
}

const itemRefs = ref<HTMLElement[]>([])
function setItemRef(el: unknown, index: number) {
    if (el) itemRefs.value[index] = el as HTMLElement
}
function assignItemRef(index: number) {
    return (el: any, _refs?: any) => {
        if (el) setItemRef(el as HTMLElement, index)
    }
}
const activeDesc = computed(() =>
    selectionIndex.value != null ? `item-${state.value.items[selectionIndex.value].id}` : undefined
)
watch(selectionIndex, async (i: number | null) => {
    if (i == null) return
    await nextTick()
    itemRefs.value[i]?.focus()
})

function openHelp(force = false) {
    helpOpen.value = true
    if (force) return
    try {
        localStorage.setItem(FIRST_VISIT_KEY, '1')
    } catch {}
}
function closeHelp() {
    helpOpen.value = false
}
function captureSnapshot() {
    prevSnapshot.value = {
        items: state.value.items,
        selectionIndex: state.value.selectionIndex,
        dirty: state.value.dirty,
    }
}
function undo() {
    if (!prevSnapshot.value) return
    const snap = prevSnapshot.value
    state.value = {
        ...state.value,
        items: snap.items,
        selectionIndex: snap.selectionIndex,
        dirty: snap.dirty,
    }
    prevSnapshot.value = null
    showOk('Undid last change')
}

async function load() {
    clearMessage()
    loading.value = true
    try {
        const pid = selectedPlaylistId.value || ''
        lastActionKind = 'load'
        lastAction = async () => {
            const { items: loaded } = await playlistFacade.loadPlaylist(pid)
            state.value = {
                ...state.value,
                selectedPlaylistId: pid,
                items: loaded,
                selectionIndex: 0,
                dirty: false,
            }
        }
        await lastAction()
    } catch (e: any) {
        showError(humanizeError('load', e))
    } finally {
        loading.value = false
    }
}

function moveUp() {
    captureSnapshot()
    state.value = applyMoveDelta(state.value, -1)
}
function moveDown() {
    captureSnapshot()
    state.value = applyMoveDelta(state.value, 1)
}
function moveTop() {
    if (selectionIndex.value == null) return
    captureSnapshot()
    state.value = applyMoveTo(state.value, 0)
}
function openPositionPrompt() {
    if (selectionIndex.value != null) showPosition.value = true
}
function onPositionSubmit(pos1: number) {
    captureSnapshot()
    state.value = applyMoveTo(state.value, pos1 - 1)
    showPosition.value = false
}

function onKey(e: KeyboardEvent, rowIndex: number) {
    // Keyboard shortcuts: Up/Down moves; Ctrl+Up/Down jump by 5; Home/End; Enter prompts move-to; '?' toggles help overlay
    if (selectionIndex.value !== rowIndex) {
        select(rowIndex)
    }
    if (e.key === 'ArrowUp') {
        e.preventDefault()
        state.value = applyMoveDelta(state.value, e.ctrlKey ? -5 : -1)
    } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        state.value = applyMoveDelta(state.value, e.ctrlKey ? 5 : 1)
    } else if (e.key === 'Home') {
        e.preventDefault()
        state.value = applyMoveTo(state.value, 0)
    } else if (e.key === 'End') {
        e.preventDefault()
        state.value = applyMoveTo(state.value, items.value.length - 1)
    } else if (e.key === 'Enter') {
        e.preventDefault()
        openPositionPrompt()
    } else if (e.key === '?') {
        e.preventDefault()
        helpOpen.value = true
    }
}

async function apply() {
    clearMessage()
    if (!dirty.value || !state.value.selectedPlaylistId) return
    applying.value = true
    try {
        lastActionKind = 'apply'
        lastAction = async () => {
            const order = state.value.items.map((i: { id: string }) => i.id)
            const res = await playlistFacade.applyReorder(state.value.selectedPlaylistId!, order)
            if (res.success) {
                showOk('Applied successfully')
                const { items: reloaded } = await playlistFacade.loadPlaylist(
                    state.value.selectedPlaylistId!
                )
                state.value = {
                    ...state.value,
                    items: reloaded,
                    dirty: false,
                    lastAppliedAt: new Date().toISOString(),
                }
                prevSnapshot.value = null
            } else {
                showError(res.message ?? 'Apply failed')
            }
        }
        await lastAction()
    } catch (e: any) {
        showError(humanizeError('apply', e))
    } finally {
        applying.value = false
    }
}

function showOk(msg: string) {
    message.value = msg
    messageType.value = 'ok'
    retry.value = null
}
function showError(msg: string) {
    message.value = msg
    messageType.value = 'err'
    // If transient, enable retry to re-run last action
    if (/transient|network|try again/i.test(msg) && lastAction) {
        retry.value = doRetry
    }
}
function clearMessage() {
    message.value = ''
    messageType.value = ''
    retry.value = null
}

onMounted(async () => {
    // In fixture mode, auto-list and auto-load for convenience. In live mode, defer auth/listing
    // until the user clicks Refresh to avoid popup blockers.
    if (!isLive) {
        await listPlaylists()
        if (selectedPlaylistId.value) {
            await load()
        }
    }
    // Auto open help first visit
    try {
        if (!localStorage.getItem(FIRST_VISIT_KEY)) {
            setTimeout(() => openHelp(true), 100)
            localStorage.setItem(FIRST_VISIT_KEY, '1')
        }
    } catch {}

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
        if (state.value.dirty) {
            event.preventDefault()
            event.returnValue = ''
        }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    cleanup.value = () => window.removeEventListener('beforeunload', onBeforeUnload)
})
onBeforeUnmount(() => {
    if (cleanup.value) cleanup.value()
})

const cleanup = ref<null | (() => void)>(null)

function humanizeError(context: 'load' | 'apply', e: any): string {
    const code = (e?.message ?? '').toString()
    if (code.includes('permission-denied'))
        return 'Permission denied. Check access to this playlist.'
    if (code.includes('quota-exceeded')) return 'Quota exceeded. Please wait and try again later.'
    if (code.includes('precondition-failed'))
        return 'The playlist changed externally. Refresh and try again.'
    if (code.includes('transient-error')) {
        return 'Temporary network/API error. Please try again.'
    }
    return context === 'load'
        ? `Failed to load: ${e?.message ?? e}`
        : `Apply failed: ${e?.message ?? e}`
}

async function doRetry() {
    clearMessage()
    if (!lastAction || !lastActionKind) return
    if (lastActionKind === 'load') {
        loading.value = true
        try {
            await lastAction()
        } catch (e: any) {
            showError(humanizeError('load', e))
        } finally {
            loading.value = false
        }
    } else if (lastActionKind === 'apply') {
        applying.value = true
        try {
            await lastAction()
        } catch (e: any) {
            showError(humanizeError('apply', e))
        } finally {
            applying.value = false
        }
    }
}

async function listPlaylists() {
    clearMessage()
    playlistsLoading.value = true
    try {
        const lists = await playlistFacade.listUserPlaylists()
        playlists.value = lists
        // Preserve selection if still present; otherwise select the first playlist (if any)
        if (!selectedPlaylistId.value && lists.length) {
            selectedPlaylistId.value = lists[0].id
        }
    } catch (e: any) {
        showError(humanizeError('load', e))
    } finally {
        playlistsLoading.value = false
    }
}

async function signOut() {
    signingOut.value = true
    clearMessage()
    try {
        await revokeAccess()
        // Reset UI selection/state for safety
        playlists.value = []
        selectedPlaylistId.value = ''
        state.value = {
            ...state.value,
            selectedPlaylistId: null,
            items: [],
            selectionIndex: null,
            dirty: false,
        }
    } catch {
        showError('Sign-out failed. Please try again.')
    } finally {
        signingOut.value = false
    }
}
</script>
<style scoped>
main {
    font-family: system-ui, sans-serif;
    padding: 1rem;
}
.controls {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin: 0.75rem 0;
}
.controls .inline {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
}
button.primary {
    background: #2563eb;
    color: white;
    border: none;
    padding: 0.4rem 0.7rem;
    border-radius: 4px;
}
button:disabled {
    opacity: 0.6;
}
.list {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0;
    max-width: 720px;
}
.list li {
    display: grid;
    grid-template-columns: 3ch 1fr auto;
    gap: 0.5rem;
    padding: 0.4rem 0.5rem;
    border-bottom: 1px solid #eee;
    cursor: pointer;
}
.list li.selected {
    background: #f0f9ff;
}
.index {
    color: #999;
}
.title {
    font-weight: 600;
}
.meta {
    color: #666;
    font-size: 0.9rem;
}
p.ok {
    color: #166534;
}
p.err {
    color: #991b1b;
}
.overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: grid;
    place-items: center;
}
.modal {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    max-width: 520px;
    width: 92vw;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
.modal header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}
.ghost {
    background: transparent;
    border: 1px solid #e5e7eb;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
}
.app-desc {
    max-width: 65ch;
    line-height: 1.4;
    color: #374151;
    font-size: 0.95rem;
    margin: 0.35rem 0 0.9rem;
}
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
}
.help-intro {
    font-size: 0.9rem;
    line-height: 1.4;
    color: #374151;
    margin: 0 0 0.75rem;
}
</style>
