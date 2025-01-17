import path from 'node:path'
import { defineConfig } from 'vitest/config'
import Macros from 'unplugin-macros/vite'

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '#macros': path.resolve(__dirname, 'macros/index.ts'),
      },
      conditions: ['dev'],
    },
    test: {
      experimentalVmThreads: true,
    },
    plugins: [Macros()],
  }
})
