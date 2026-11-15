import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'xstk_mistakes'

export function useMistakes() {
  const [mistakes, setMistakes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes))
    } catch (e) {
      console.error('Failed to save mistakes to localStorage', e)
    }
  }, [mistakes])

  const toggleMistake = useCallback((id) => {
    setMistakes(prev => {
      const copy = { ...prev }
      if (copy[id]) {
        delete copy[id]
      } else {
        copy[id] = Date.now()
      }
      return copy
    })
  }, [])

  const removeMistake = useCallback((id) => {
    setMistakes(prev => {
      if (!prev[id]) return prev
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }, [])

  const isMistake = useCallback((id) => {
    return !!mistakes[id]
  }, [mistakes])

  const clearAllMistakes = useCallback(() => {
    setMistakes({})
  }, [])

  const mistakeIds = Object.keys(mistakes)

  return {
    mistakes,
    mistakeIds,
    mistakeCount: mistakeIds.length,
    toggleMistake,
    removeMistake,
    isMistake,
    clearAllMistakes
  }
}
