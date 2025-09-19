<template>
    <div class="panel">
        <header>
            <h2>Multi-Sort</h2>
            <button class="ghost" @click="$emit('close')">Close</button>
        </header>

        <div v-if="localRules.length === 0" class="empty">No rules yet. Add one below.</div>
        <ul class="rules">
            <li v-for="(r, idx) in localRules" :key="idx">
                <select v-model="r.field">
                    <option v-for="f in fields" :key="f" :value="f">{{ f }}</option>
                </select>
                <select v-model="r.direction">
                    <option value="asc">asc</option>
                    <option value="desc">desc</option>
                </select>
                <span class="prec">#{{ idx + 1 }}</span>
                <button class="ghost" @click="move(idx, -1)" :disabled="idx === 0">↑</button>
                <button
                    class="ghost"
                    @click="move(idx, 1)"
                    :disabled="idx === localRules.length - 1"
                >
                    ↓
                </button>
                <button class="ghost" @click="remove(idx)">Remove</button>
            </li>
        </ul>

        <div class="actions">
            <select v-model="newField">
                <option disabled value="">Add field…</option>
                <option v-for="f in fields" :key="f" :value="f">{{ f }}</option>
            </select>
            <select v-model="newDirection">
                <option value="asc">asc</option>
                <option value="desc">desc</option>
            </select>
            <button @click="add">Add</button>
            <button class="primary" @click="applySort" :disabled="localRules.length === 0">
                Apply Sort
            </button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SortRule, SortField, SortDirection } from '../models/types'

const props = defineProps<{ rules: SortRule[] }>()
const emit = defineEmits<{ 'update:rules': [SortRule[]]; 'apply-sort': []; close: [] }>()

const fields: SortField[] = ['channel', 'title', 'duration', 'dateAdded', 'dateUploaded']
const localRules = ref<SortRule[]>(
    props.rules?.map(({ field, direction }, i) => ({ field, direction, precedence: i + 1 })) ?? []
)
watch(
    () => props.rules,
    (val) => {
        localRules.value = (val ?? []).map(({ field, direction }, i) => ({
            field,
            direction,
            precedence: i + 1,
        }))
    }
)

function emitRules() {
    const out = localRules.value.map((r, i) => ({
        field: r.field,
        direction: r.direction,
        precedence: i + 1,
    }))
    emit('update:rules', out)
}

const newField = ref<SortField | ''>('')
const newDirection = ref<SortDirection>('asc')

function add() {
    if (!newField.value) return
    localRules.value = [
        ...localRules.value,
        {
            field: newField.value,
            direction: newDirection.value,
            precedence: localRules.value.length + 1,
        },
    ]
    emitRules()
    newField.value = ''
    newDirection.value = 'asc'
}
function remove(idx: number) {
    localRules.value = localRules.value.filter((_, i) => i !== idx)
    emitRules()
}
function move(idx: number, delta: number) {
    const to = idx + delta
    if (to < 0 || to >= localRules.value.length) return
    const next = [...localRules.value]
    const [r] = next.splice(idx, 1)
    next.splice(to, 0, r)
    localRules.value = next
    emitRules()
}

function applySort() {
    emit('apply-sort')
}
</script>
<style scoped>
.panel {
    border: 1px solid #e5e7eb;
    padding: 0.75rem;
    border-radius: 6px;
    max-width: 760px;
}
header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}
.rules {
    list-style: none;
    padding: 0;
    margin: 0 0 0.5rem;
    display: grid;
    gap: 0.35rem;
}
.rules li {
    display: grid;
    grid-template-columns: 1fr 1fr auto auto auto auto;
    gap: 0.35rem;
    align-items: center;
}
.actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}
.ghost {
    background: transparent;
    border: 1px solid #e5e7eb;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
}
.primary {
    background: #2563eb;
    color: white;
    border: none;
    padding: 0.4rem 0.7rem;
    border-radius: 4px;
}
.prec {
    color: #777;
}
.empty {
    color: #666;
    margin: 0.5rem 0;
}
</style>
