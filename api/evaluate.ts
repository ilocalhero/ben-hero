import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

interface EvaluateBody {
  response: string
  prompt: string
  rubricKeyTerms: string[]
  minimumWords: number
  keyPointsToAddress?: string[]
  playerName: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  const body = req.body as EvaluateBody
  const { response: studentResponse, prompt, rubricKeyTerms, minimumWords, keyPointsToAddress, playerName } = body

  if (!studentResponse || !prompt) {
    return res.status(400).json({ error: 'Missing required fields: response, prompt' })
  }

  const words = studentResponse.trim().split(/\s+/).filter((w: string) => w.length > 1)
  const wordCount = words.length

  const systemPrompt = `You are a supportive and encouraging Spanish history teacher evaluating a student's written response. The student's name is ${playerName}. They are learning about Spanish history and geography through a gamified educational app called "Ben Hero".

Your evaluation should be:
- Warm, encouraging, and age-appropriate (the student is a young learner)
- In Spanish (all feedback should be in Spanish)
- Focused on both content accuracy and writing quality
- Constructive — highlight what they did well and gently suggest improvements

You MUST respond with valid JSON only, no other text. Use this exact structure:
{
  "score": <number 0-100>,
  "stars": <number 1-5>,
  "strengths": ["<strength 1 in Spanish>", "<strength 2 in Spanish>"],
  "improvements": ["<improvement 1 in Spanish>", "<improvement 2 in Spanish>"],
  "encouragement": "<a motivational message in Spanish, personalized to ${playerName}>"
}`

  const userPrompt = `## Writing Mission Prompt
${prompt}

## Key Points to Address
${keyPointsToAddress?.join('\n- ') || 'None specified'}

## Required Key Terms
${rubricKeyTerms.join(', ')}

## Minimum Words Required
${minimumWords} (student wrote ${wordCount})

## Student's Response
${studentResponse}

---

Evaluate this response. Consider:
1. **Content accuracy** (35 points): Did they address the key points and use the required terms correctly?
2. **Word count** (20 points): Did they meet the minimum word count of ${minimumWords}? They wrote ${wordCount} words.
3. **Use of Spanish connectors** (20 points): Did they use connectors like "porque", "además", "sin embargo", "por lo tanto"?
4. **Writing quality** (15 points): Sentence structure, clarity, and coherence.
5. **Effort and creativity** (10 points): Did they go beyond the minimum?

Respond with JSON only.`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt,
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Extract JSON from the response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Failed to parse AI response' })
    }

    const evaluation = JSON.parse(jsonMatch[0])

    // Ensure all required fields exist with correct types
    const result = {
      score: Math.max(0, Math.min(100, Number(evaluation.score) || 0)),
      stars: Math.max(1, Math.min(5, Number(evaluation.stars) || 1)),
      strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths.slice(0, 4) : [],
      improvements: Array.isArray(evaluation.improvements) ? evaluation.improvements.slice(0, 3) : [],
      encouragement: String(evaluation.encouragement || '¡Sigue practicando!'),
      xpBonus: 0,
      wordCount,
    }

    // Calculate XP bonus based on score
    if (result.score >= 80) {
      result.xpBonus = 30
    } else if (result.score >= 55) {
      result.xpBonus = 15
    }

    return res.status(200).json(result)
  } catch (err: unknown) {
    console.error('AI evaluation error:', err)
    return res.status(500).json({ error: 'AI evaluation failed' })
  }
}
