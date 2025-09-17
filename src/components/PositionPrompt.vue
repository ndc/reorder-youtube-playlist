<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="pos-title">
      <header>
        <h3 id="pos-title">Move To Position</h3>
        <button class="ghost" @click="$emit('close')">Close</button>
      </header>
      <form @submit.prevent="submit">
        <label>Position (1 - {{ max }}):
          <input ref="inputEl" type="number" :min="1" :max="max" v-model.number="val" />
        </label>
        <div class="actions">
          <button type="submit" class="primary">Move</button>
          <button type="button" class="ghost" @click="$emit('close')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{ max: number; initial?: number }>()
const emit = defineEmits<{ submit: [number]; close: [] }>()
const val = ref<number>(props.initial ?? 1)
const inputEl = ref<HTMLInputElement | null>(null)
onMounted(() => { inputEl.value?.focus(); inputEl.value?.select() })

function submit() {
  if (!Number.isFinite(val.value)) return
  if (val.value < 1 || val.value > props.max) return
  emit('submit', val.value)
}
</script>
<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: grid; place-items: center; }
.modal { background: white; padding: 1rem; border-radius: 8px; max-width: 420px; width: 92vw; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
.ghost { background: transparent; border: 1px solid #e5e7eb; padding: 0.3rem 0.6rem; border-radius: 4px; }
.primary { background: #2563eb; color: white; border: none; padding: 0.4rem 0.7rem; border-radius: 4px; }
</style>