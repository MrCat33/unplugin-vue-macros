import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'tsup'
import { type Plugin } from 'esbuild'
import Macros from 'unplugin-macros/esbuild'

const dirname = path.resolve(fileURLToPath(import.meta.url), '..')

const rawRE = /[&?]raw(?:&|$)/
const EsbuildRawPlugin: Plugin = {
  name: 'raw-plugin',
  setup(build) {
    build.onLoad({ filter: /.*/ }, async ({ path, suffix }) => {
      if (!rawRE.test(suffix)) return

      let contents = await readFile(path, 'utf-8')
      const isTS = path.endsWith('.ts')
      if (isTS)
        contents = (
          await build.esbuild.transform(contents, {
            loader: isTS ? 'ts' : 'js',
            minifyWhitespace: true,
          })
        ).code

      return {
        contents: `export default ${JSON.stringify(contents)}`,
      }
    })
  },
}

export default defineConfig({
  entry: ['./src/*.ts'],
  format: ['cjs', 'esm'],
  target: 'node16.14',
  splitting: true,
  cjsInterop: true,
  watch: !!process.env.DEV,
  dts: process.env.DEV
    ? false
    : {
        compilerOptions: {
          composite: false,
          customConditions: [],
        },
      },
  tsconfig: '../../tsconfig.lib.json',
  clean: true,
  define: {
    'import.meta.DEV': JSON.stringify(!!process.env.DEV),
  },
  esbuildPlugins: [
    EsbuildRawPlugin,
    Macros({
      viteConfig: {
        resolve: {
          alias: {
            '#macros': path.resolve(dirname, 'macros/index.ts'),
          },
        },
      },
    }),
  ],
})
