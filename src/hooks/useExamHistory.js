import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'xstk_exam_history'

export function useExamHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    } catch (e) {
      console.error('Failed to save exam history', e)
    }
  }, [history])

  const recordExamResult = useCallback((examId, resultData) => {
    setHistory(prev => ({
      ...prev,
      [examId]: {
        ...resultData,
        completedAt: Date.now()
      }
    }))
  }, [])

  const getExamRecord = useCallback((examId) => {
    return history[examId] || null
  }, [history])

  const getCategoryStats = useCallback((categoryExamIds) => {
    if (!categoryExamIds || categoryExamIds.length === 0) {
      return { completedCount: 0, totalCount: 0, percent: 0, avgScore: 0 }
    }

    const completed = categoryExamIds.filter(id => !!history[id])
    const completedCount = completed.length
    const totalCount = categoryExamIds.length
    const percent = Math.round((completedCount / totalCount) * 100)

    let totalScore = 0
    completed.forEach(id => {
      totalScore += history[id].score || 0
    })
    const avgScore = completedCount > 0 ? (Math.round((totalScore / completedCount) * 10) / 10).toFixed(1) : 0

    return {
      completedCount,
      totalCount,
      percent,
      avgScore
    }
  }, [history])

  const clearExamHistory = useCallback(() => {
    setHistory({})
  }, [])

  return {
    history,
    recordExamResult,
    getExamRecord,
    getCategoryStats,
    clearExamHistory
  }
}
