import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { filterQuestions, questions as allQuestions } from '../data/questions'
import QuestionCard from '../components/QuestionCard'
import FilterBar from '../components/FilterBar'
import ProgressBar from '../components/ProgressBar'
import { useMistakes } from '../hooks/useMistakes'
import { useProgress } from '../hooks/useProgress'
import { Shuffle, Grid, HelpCircle, CheckCircle2 } from 'lucide-react'

export default function PracticePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Filter states
  const [selectedWeeks, setSelectedWeeks] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedTopics, setSelectedTopics] = useState([])
  const [selectedDifficulties, setSelectedDifficulties] = useState([])

  // Mistake hook & progress hook
  const { isMistake, toggleMistake, mistakeIds } = useMistakes()
  const { recordAnswer, progress } = useProgress()

  // Mode check: if query has ?mode=mistakes
  const isMistakeMode = searchParams.get('mode') === 'mistakes'

  // Filter questions list
  const filteredQuestions = useMemo(() => {
    return filterQuestions({
      weeks: selectedWeeks,
      types: selectedTypes,
      topics: selectedTopics,
      difficulties: selectedDifficulties,
      mistakeIds: isMistakeMode ? mistakeIds : null,
    })
  }, [selectedWeeks, selectedTypes, selectedTopics, selectedDifficulties, isMistakeMode, mistakeIds])

  // Current question index in the filtered list
  const [currentIndex, setCurrentIndex] = useState(0)

  // Track session answers for local session stats
  const [sessionResults, setSessionResults] = useState({})
  const [showGridModal, setShowGridModal] = useState(false)

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0)
    setSessionResults({})
  }, [selectedWeeks, selectedTypes, selectedTopics, selectedDifficulties, isMistakeMode])

  const currentQuestion = filteredQuestions[currentIndex] || null

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleShuffle = () => {
    // Pick random index
    if (filteredQuestions.length > 1) {
      const randomIndex = Math.floor(Math.random() * filteredQuestions.length)
      setCurrentIndex(randomIndex)
    }
  }

  const handleAnswerSubmit = (qId, status, details) => {
    recordAnswer(qId, status, details)
    setSessionResults(prev => ({ ...prev, [qId]: status }))
    
    // Auto add to mistakes if wrong
    if (status === 'wrong' && !isMistake(qId)) {
      toggleMistake(qId)
    }
  }

  const handleResetFilters = () => {
    setSelectedWeeks([])
    setSelectedTypes([])
    setSelectedTopics([])
    setSelectedDifficulties([])
  }

  // Session score
  const sessionCorrect = Object.values(sessionResults).filter(v => v === 'correct').length
  const sessionWrong = Object.values(sessionResults).filter(v => v === 'wrong').length

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">
      {/* Mode Banner if in mistakes mode */}
      {isMistakeMode && (
        <div className="flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          <div>
            <strong>Đang ở chế độ: Luyện tập Sổ sai lầm</strong> ({filteredQuestions.length} câu)
          </div>
          <button
            onClick={() => setSearchParams({})}
            className="text-xs font-semibold text-amber-700 underline dark:text-amber-300"
          >
            Thoát chế độ này
          </button>
        </div>
      )}

      {/* Filter Component */}
      <FilterBar
        selectedWeeks={selectedWeeks}
        setSelectedWeeks={setSelectedWeeks}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
        selectedTopics={selectedTopics}
        setSelectedTopics={setSelectedTopics}
        selectedDifficulties={selectedDifficulties}
        setSelectedDifficulties={setSelectedDifficulties}
        totalFiltered={filteredQuestions.length}
        onReset={handleResetFilters}
      />

      {filteredQuestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <HelpCircle className="mb-3 h-12 w-12 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Không tìm thấy câu hỏi nào
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Thử bỏ bớt điều kiện lọc để xem thêm câu hỏi.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <>
          {/* Progress & Navigation Bar */}
          <ProgressBar
            currentIndex={currentIndex}
            total={filteredQuestions.length}
            correctCount={sessionCorrect}
            wrongCount={sessionWrong}
            onPrev={handlePrev}
            onNext={handleNext}
          />

          {/* Action Row: Random jump & Grid jump */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={handleShuffle}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
            >
              <Shuffle className="h-3.5 w-3.5" />
              <span>Câu ngẫu nhiên</span>
            </button>

            <button
              onClick={() => setShowGridModal(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Bảng số câu ({filteredQuestions.length})</span>
            </button>
          </div>

          {/* Active Question Card */}
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              isBookmarked={isMistake(currentQuestion.id)}
              onToggleBookmark={toggleMistake}
              onAnswerSubmit={handleAnswerSubmit}
              onNext={handleNext}
              showNextButton={currentIndex < filteredQuestions.length - 1}
            />
          )}

          {/* Grid jump modal */}
          {showGridModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
              <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">
                    Chọn câu hỏi (Đang có {filteredQuestions.length} câu)
                  </h3>
                  <button
                    onClick={() => setShowGridModal(false)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                  >
                    ✕
                  </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-4">
                  <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
                    {filteredQuestions.map((q, idx) => {
                      const isCurrent = idx === currentIndex
                      const answered = sessionResults[q.id]
                      const inMistakes = isMistake(q.id)

                      let bgClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      if (answered === 'correct') {
                        bgClass = 'bg-emerald-500 text-white'
                      } else if (answered === 'wrong') {
                        bgClass = 'bg-rose-500 text-white'
                      } else if (isCurrent) {
                        bgClass = 'ring-2 ring-blue-600 bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200'
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            setCurrentIndex(idx)
                            setShowGridModal(false)
                          }}
                          className={`relative flex h-10 w-full items-center justify-center rounded-lg text-xs font-bold transition-all ${bgClass}`}
                        >
                          <span>{idx + 1}</span>
                          {inMistakes && (
                            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 p-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Đúng
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-rose-500" /> Sai
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-400" /> Sổ sai
                    </span>
                  </div>
                  <button
                    onClick={() => setShowGridModal(false)}
                    className="rounded-lg bg-slate-200 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
