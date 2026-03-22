import express from 'express'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { evaluateWritingHandler } from './api/evaluate-writing.ts'
import { sendTemaReportHandler } from './api/tema-report.ts'
import { syncPullHandler, syncPushHandler, syncResetHandler } from './api/sync.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT ?? 3000

app.use(express.json())

// API routes
app.post('/api/evaluate-writing', evaluateWritingHandler)
app.post('/api/send-tema-report', sendTemaReportHandler)
app.get('/api/sync', syncPullHandler)
app.post('/api/sync', syncPushHandler)
app.post('/api/reset', syncResetHandler)

// Serve static frontend
app.use(express.static(join(__dirname, 'dist')))

// SPA fallback — all non-API routes return index.html
app.use((_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`BenHero server running on port ${PORT}`)
})
