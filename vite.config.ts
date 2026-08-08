import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function excludeSourceFilesFromDeploy() {
  let outDir = 'dist'
  return {
    name: 'exclude-source-files-from-deploy',
    configResolved(config: { root: string; build: { outDir: string } }) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const assetsDir = path.join(outDir, 'assets')
      if (!fs.existsSync(assetsDir)) return
      for (const entry of fs.readdirSync(assetsDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue
        fs.rmSync(path.join(assetsDir, entry.name, 'source_files'), { recursive: true, force: true })
      }
    },
  }
}

export default defineConfig({ plugins: [react(), excludeSourceFilesFromDeploy()] })
