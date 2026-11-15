import React, { useMemo } from 'react'
import katex from 'katex'

/**
 * Parses a string containing LaTeX ($...$ and $$...$$) and plain text,
 * rendering LaTeX segments with KaTeX safely.
 */
export default function MathText({ text, className = '' }) {
  const renderedContent = useMemo(() => {
    if (!text || typeof text !== 'string') return ''

    // Regular expression to match $$...$$ and $...$
    // $$...$$ (display mode) or $...$ (inline mode)
    const regex = /(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g
    const parts = text.split(regex)

    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const formula = part.slice(2, -2).trim()
        try {
          const html = katex.renderToString(formula, {
            displayMode: true,
            throwOnError: false,
          })
          return (
            <span
              key={index}
              className="my-2 block overflow-x-auto py-1 text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )
        } catch (e) {
          return <code key={index} className="text-red-500">{part}</code>
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const formula = part.slice(1, -1).trim()
        try {
          const html = katex.renderToString(formula, {
            displayMode: false,
            throwOnError: false,
          })
          return (
            <span
              key={index}
              className="inline-math mx-0.5 inline-block"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )
        } catch (e) {
          return <code key={index} className="text-red-500">{part}</code>
        }
      } else {
        // Plain text: preserve line breaks
        const lines = part.split('\n')
        return (
          <React.Fragment key={index}>
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {line}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </React.Fragment>
        )
      }
    })
  }, [text])

  return <span className={className}>{renderedContent}</span>
}
