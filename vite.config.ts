import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    // Use relative base so built index.html references ./assets/... instead of /assets/...
    base: './',
})
