import express from 'express'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { evaluateWritingHandler } from './api/evaluate-writing.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT ?? 3000

app.use(express.json())

// API routes
app.post('/api/evaluate-writing', evaluateWritingHandler)

// Serve static frontend
app.use(express.static(join(__dirname, 'dist')))

// SPA fallback — all non-API routes return index.html
app.use((_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`BenHero server running on port ${PORT}`)
})
