<template>
  <main>
    <h1>Reorder YouTube Playlist</h1>
    <section class="controls">
      <button @click="load()" :disabled="loading">Load Fixture</button>
      <button @click="moveUp" :disabled="!canMoveUp">Move Up</button>
      <button @click="moveDown" :disabled="!canMoveDown">Move Down</button>
      <button @click="moveTop" :disabled="!hasSelection">Move To Top</button>
      <button @click="moveToPosition" :disabled="!hasSelection">Move To Position…</button>
      <button class="primary" @click="apply" :disabled="!dirty || applying">Apply Changes</button>
    </section>

    <p v-if="message" :class="{ ok: messageType==='ok', err: messageType==='err' }">{{ message }}</p>

    <ol class="list" v-if="items.length">
      <li
        v-for="(it, i) in items"
        :key="it.id"
        :class="{ selected: selectionIndex===i }"
        @click="select(i)"
        tabindex="0"
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
import { ref, computed, onMounted } from 'vue'
import { playlistFacade } from './lib/playlistFacade'
import { initialState, setSelection, applyMoveDelta, applyMoveTo } from './services/stateService'
import type { AppState } from './models/types'

const state = ref<AppState>(initialState())
const loading = ref(false)
const applying = ref(false)
const message = ref('')
const messageType = ref<'ok' | 'err' | ''>('')

const items = computed(() => state.value.items)
const selectionIndex = computed(() => state.value.selectionIndex)
const dirty = computed(() => state.value.dirty)

const hasSelection = computed(() => selectionIndex.value != null)
const canMoveUp = computed(() => hasSelection.value && (selectionIndex.value as number) > 0)
const canMoveDown = computed(() => hasSelection.value && (selectionIndex.value as number) < items.value.length - 1)

function select(i: number) {
  state.value = setSelection(state.value, i)
}

async function load() {
  clearMessage()
  loading.value = true
  try {
    const { items: loaded } = await playlistFacade.loadPlaylist('TEST')
    state.value = { ...state.value, selectedPlaylistId: 'TEST', items: loaded, selectionIndex: 0, dirty: false }
  } catch (e: any) {
    showError(`Failed to load: ${e?.message ?? e}`)
  } finally {
    loading.value = false
  }
}

function moveUp() {
  state.value = applyMoveDelta(state.value, -1)
}
function moveDown() {
  state.value = applyMoveDelta(state.value, 1)
}
function moveTop() {
  if (selectionIndex.value == null) return
  state.value = applyMoveTo(state.value, 0)
}
function moveToPosition() {
  if (selectionIndex.value == null) return
  const toStr = window.prompt('Move to position (1-based):', String((selectionIndex.value as number) + 1))
  if (!toStr) return
  const to = Number.parseInt(toStr, 10)
  if (Number.isNaN(to) || to < 1 || to > items.value.length) {
    showError('Invalid position')
    return
  }
  state.value = applyMoveTo(state.value, to - 1)
}

async function apply() {
  clearMessage()
  if (!dirty.value || !state.value.selectedPlaylistId) return
  applying.value = true
  try {
    const order = state.value.items.map(i => i.id)
    const res = await playlistFacade.applyReorder(state.value.selectedPlaylistId, order)
    if (res.success) {
      showOk('Applied successfully')
      // reload to reflect committed order and reset dirty
      const { items: reloaded } = await playlistFacade.loadPlaylist(state.value.selectedPlaylistId)
      state.value = { ...state.value, items: reloaded, dirty: false, lastAppliedAt: new Date().toISOString() }
    } else {
      showError(res.message ?? 'Apply failed')
    }
  } catch (e: any) {
    showError(`Apply failed: ${e?.message ?? e}`)
  } finally {
    applying.value = false
  }
}

function showOk(msg: string) {
  message.value = msg
  messageType.value = 'ok'
}
function showError(msg: string) {
  message.value = msg
  messageType.value = 'err'
}
function clearMessage() {
  message.value = ''
  messageType.value = ''
}

onMounted(() => {
  // Autoload fixture for convenience
  load()
})
</script>
<style scoped>
main { font-family: system-ui, sans-serif; padding: 1rem; }
.controls { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0.75rem 0; }
button.primary { background: #2563eb; color: white; border: none; padding: 0.4rem 0.7rem; border-radius: 4px; }
button:disabled { opacity: 0.6; }
.list { list-style: none; padding: 0; margin: 0.5rem 0; max-width: 720px; }
.list li { display: grid; grid-template-columns: 3ch 1fr auto; gap: 0.5rem; padding: 0.4rem 0.5rem; border-bottom: 1px solid #eee; cursor: pointer; }
.list li.selected { background: #f0f9ff; }
.index { color: #999; }
.title { font-weight: 600; }
.meta { color: #666; font-size: 0.9rem; }
p.ok { color: #166534; }
p.err { color: #991b1b; }
</style>
