import { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface MathRendererProps {
  /** Text that may contain inline $...$ or display $$...$$ math delimiters */
  content: string
  className?: string
}

/**
 * Renders text with embedded LaTeX math expressions using KaTeX.
 * - $$...$$ → display (block) math
 * - $...$ → inline math
 * - Plain text passes through as-is
 */
export function MathRenderer({ content, className }: MathRendererProps) {
  const html = useMemo(() => renderMathToHTML(content), [content])

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/** Also supports markdown-style **bold** in text segments */
function renderMathToHTML(text: string): string {
  // Split on display math ($$...$$) first, then inline ($...$)
  const parts: string[] = []
  let remaining = text

  while (remaining.length > 0) {
    // Look for display math $$...$$
    const displayStart = remaining.indexOf('$$')
    if (displayStart !== -1) {
      const displayEnd = remaining.indexOf('$$', displayStart + 2)
      if (displayEnd !== -1) {
        // Text before display math
        if (displayStart > 0) {
          parts.push(processInlineMath(remaining.slice(0, displayStart)))
        }
        // Display math
        const latex = remaining.slice(displayStart + 2, displayEnd)
        try {
          parts.push(katex.renderToString(latex, { displayMode: true, throwOnError: false }))
        } catch {
          parts.push(`<span class="text-red-400">[Math Error]</span>`)
        }
        remaining = remaining.slice(displayEnd + 2)
        continue
      }
    }

    // No more display math — process remaining for inline math
    parts.push(processInlineMath(remaining))
    break
  }

  return parts.join('')
}

function processInlineMath(text: string): string {
  const parts: string[] = []
  let remaining = text

  while (remaining.length > 0) {
    const start = remaining.indexOf('$')
    if (start === -1) {
      parts.push(escapeAndFormat(remaining))
      break
    }

    const end = remaining.indexOf('$', start + 1)
    if (end === -1) {
      parts.push(escapeAndFormat(remaining))
      break
    }

    // Text before inline math
    if (start > 0) {
      parts.push(escapeAndFormat(remaining.slice(0, start)))
    }

    // Inline math
    const latex = remaining.slice(start + 1, end)
    try {
      parts.push(katex.renderToString(latex, { displayMode: false, throwOnError: false }))
    } catch {
      parts.push(`<span class="text-red-400">[Math]</span>`)
    }

    remaining = remaining.slice(end + 1)
  }

  return parts.join('')
}

function escapeAndFormat(text: string): string {
  // Escape HTML entities
  let safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Markdown bold **text**
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // Newlines to <br>
  safe = safe.replace(/\n/g, '<br/>')

  return safe
}
