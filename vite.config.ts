import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, readdirSync, statSync, cpSync, rmSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'move-to-datasweb',
      closeBundle() {
        // הזזת כל הקבצים מ-dist ל-Datasweb (חוץ מ-index.html)
        const distPath = resolve(__dirname, 'dist')
        const dataswebPath = resolve(__dirname, 'dist', 'Datasweb')
        
        // יצירת תיקיית Datasweb אם לא קיימת
        if (!statSync(dataswebPath, { throwIfNoEntry: false })) {
          mkdirSync(dataswebPath, { recursive: true })
        }
        
        // העתקת כל הקבצים והתיקיות (חוץ מ-index.html)
        const files = readdirSync(distPath)
        files.forEach(file => {
          if (file !== 'index.html' && file !== 'Datasweb') {
            const sourcePath = join(distPath, file)
            const destPath = join(dataswebPath, file)
            const stat = statSync(sourcePath)
            
            if (stat.isDirectory()) {
              cpSync(sourcePath, destPath, { recursive: true })
              rmSync(sourcePath, { recursive: true, force: true })
            } else {
              copyFileSync(sourcePath, destPath)
              rmSync(sourcePath, { force: true })
            }
          }
        })
      }
    }
  ],
  base: process.env.VERCEL ? '/Datasweb/' : '/WEBkobi/Datasweb/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  server: {
    port: 4000,
    host: 'localhost',
    open: true,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    assetsDir: 'assets',
    copyPublicDir: true
  }
})

