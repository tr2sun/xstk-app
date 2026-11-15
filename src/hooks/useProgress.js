import { useState, useEffect, useCallback, useMemo } from 'react'

const STORAGE_KEY = 'xstk_progress'

export function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch (e) {
      console.error('Failed to save progress to localStorage', e)
    }
  }, [progress])

  const recordAnswer = useCallback((id, status, details = {}) => {
    setProgress(prev => ({
      ...prev,
      [id]: {
        status, // 'correct' | 'wrong'
        ...details,
        updatedAt: Date.now()
      }
    }))
  }, [])

  const resetProgress = useCallback(() => {
    setProgress({})
  }, [])

  const stats = useMemo(() => {
    const entries = Object.values(progress)
    const totalAnswered = entries.length
    const correctCount = entries.filter(e => e.status === 'correct').length
    const wrongCount = entries.filter(e => e.status === 'wrong').length
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0

    return {
      totalAnswered,
      correctCount,
      wrongCount,
      accuracy
    }
  }, [progress])

  return {
    progress,
    recordAnswer,
    resetProgress,
    stats
  }
}
