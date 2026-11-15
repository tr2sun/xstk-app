import React, { useState, useEffect, useRef } from 'react'
import {
  Trophy,
  Clock,
  Zap,
  CheckSquare,
  Flame,
  Sliders,
  Flag,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  Bookmark,
  CheckCircle,
  XCircle,
  Play,
  ArrowRight,
  Award
} from 'lucide-react'
import { EXAM_PRESETS, generateExam, gradeExam } from '../data/examPresets'
import MathText from '../components/MathText'
import { useMistakes } from '../hooks/useMistakes'

export default function ExamPage() {
  // Page phase: 'lobby' | 'exam' | 'result'
  const [phase, setPhase] = useState('lobby')
  const [selectedPreset, setSelectedPreset] = useState(EXAM_PRESETS[0])

  // Custom configuration
  const [customQuestions, setCustomQuestions] = useState(25)
  const [customMinutes, setCustomMinutes] = useState(45)
  const [customWeeks, setCustomWeeks] = useState([1, 2, 3, 4, 5, 6, 7])

  // Active exam state
  const [examQuestions, setExamQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({}) // { [qId]: { selected, answers, selfGraded } }
  const [flaggedIds, setFlaggedIds] = useState(new Set())
  const [timeLeft, setTimeLeft] = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)

  // Result state
  const [examResult, setExamResult] = useState(null)
  const [bulkSavedMistakes, setBulkSavedMistakes] = useState(false)

  const { toggleMistake, isMistake } = useMistakes()
  const timerRef = useRef(null)

  // Countdown timer effect during exam
  useEffect(() => {
    if (phase === 'exam' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            handleFinishExam()
            return 0
          }
          return prev - 1
        })
        setTimeSpent(prev => prev + 1)
      }, 1000)

      return () => clearInterval(timerRef.current)
    }
  }, [phase, timeLeft])

  // Start exam handler
  const handleStartExam = (preset) => {
    setSelectedPreset(preset)
    const questionsList = generateExam(preset.id, {
      questionCount: customQuestions,
      weeks: customWeeks
    })

    setExamQuestions(questionsList)
    setCurrentIndex(0)
    setUserAnswers({})
    setFlaggedIds(new Set())
    setBulkSavedMistakes(false)

    const totalSeconds = (preset.id === 'custom' ? customMinutes : preset.durationMinutes) * 60
    setTimeLeft(totalSeconds)
    setTimeSpent(0)
    setPhase('exam')
  }

  // Answer handler for current question
  const handleSelectOption = (qId, optionKey) => {
    setUserAnswers(prev => ({
      ...prev,
      [qId]: { ...prev[qId], selected: optionKey }
    }))
  }

  const handleSelectTf = (qId, subKey, boolVal) => {
    setUserAnswers(prev => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        answers: {
          ...(prev[qId]?.answers || {}),
          [subKey]: boolVal
        }
      }
    }))
  }

  const toggleFlag = (qId) => {
    setFlaggedIds(prev => {
      const next = new Set(prev)
      if (next.has(qId)) next.delete(qId)
      else next.add(qId)
      return next
    })
  }

  // Submit and grade exam
  const handleFinishExam = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setShowConfirmSubmit(false)

    const result = gradeExam(selectedPreset.id, examQuestions, userAnswers)
    setExamResult(result)
    setPhase('result')
  }

  // Bulk save wrong questions to mistakes notebook
  const handleSaveAllMistakes = () => {
    if (!examQuestions || !examResult) return
    examQuestions.forEach(q => {
      const ans = userAnswers[q.id]
      let isCorrect = false
      if (q.type === 'Trắc nghiệm') {
        isCorrect = ans?.selected === q.answer
      } else if (q.type === 'Đúng / Sai') {
        const ansMap = {}
        q.answer.split(';').forEach(p => {
          const m = p.match(/([a-d])\)\s*(Đúng|Sai)/i)
          if (m) ansMap[m[1].toLowerCase()] = m[2].trim().toLowerCase() === 'đúng'
        })
        isCorrect = ['a', 'b', 'c', 'd'].every(k => ans?.answers?.[k] === ansMap[k])
      }

      if (!isCorrect && !isMistake(q.id)) {
        toggleMistake(q.id)
      }
    })
    setBulkSavedMistakes(true)
  }

  // Formatting time MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Helper icons
  const presetIcons = {
    standard: Trophy,
    speed: Zap,
    true_false: CheckSquare,
    hardcore: Flame,
    custom: Sliders
  }

  // Current question data
  const currentQ = examQuestions[currentIndex] || null

  // Count answered questions
  const answeredCount = examQuestions.filter(q => {
    const ans = userAnswers[q.id]
    if (!ans) return false
    if (q.type === 'Trắc nghiệm') return !!ans.selected
    if (q.type === 'Đúng / Sai') {
      return ans.answers && Object.keys(ans.answers).length === 4
    }
    return !!ans.selfGraded
  }).length

  // ==========================================
  // VIEW 1: LOBBY (Sảnh chọn đề thi)
  // ==========================================
  if (phase === 'lobby') {
    return (
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <Trophy className="h-3.5 w-3.5" />
            <span>Phòng Thi Thử Chuẩn MAT1052</span>
          </div>
          <h1 className="mt-3 text-2xl font-black text-slate-900 dark:text-white sm:text-4xl">
            Trung Tâm Luyện Đề Thi Thử
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
            Mô phỏng 100% cấu trúc đề thi chính thức của UET. Có đếm ngược thời gian, chấm điểm chuẩn barem và xem lại đáp án chi tiết.
          </p>
        </div>

        {/* Preset Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXAM_PRESETS.map(preset => {
            const Icon = presetIcons[preset.id] || Trophy
            return (
              <div
                key={preset.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${preset.badgeColor}`}>
                      {preset.badge}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-blue-500" />
                      <span>{preset.durationMinutes} phút</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {preset.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {preset.totalQuestions} câu hỏi
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button
                    onClick={() => handleStartExam(preset)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>Bắt đầu thi thử</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ==========================================
  // VIEW 2: EXAM ROOM (Phòng thi đang làm bài)
  // ==========================================
  if (phase === 'exam' && currentQ) {
    const isFlagged = flaggedIds.has(currentQ.id)
    const isTimeUrgent = timeLeft < 300 // < 5 mins

    // Sub-items parser for TF4
    let parsedTf = null
    if (currentQ.type === 'Đúng / Sai') {
      const match = currentQ.prompt.match(/^(.*?)(?:\s*a\s*\)\s*)(.*?)(?:\s*b\s*\)\s*)(.*?)(?:\s*c\s*\)\s*)(.*?)(?:\s*d\s*\)\s*)(.*)$/)
      if (match) {
        parsedTf = {
          context: match[1].trim(),
          statements: [
            { key: 'a', text: match[2].trim() },
            { key: 'b', text: match[3].trim() },
            { key: 'c', text: match[4].trim() },
            { key: 'd', text: match[5].trim() }
          ]
        }
      }
    }

    return (
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        {/* Sticky Header: Timer & Actions */}
        <div className="sticky top-16 z-30 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 dark:text-white">
              {selectedPreset.title}
            </span>
            <span className="hidden rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300 sm:inline-block">
              Đã làm: {answeredCount}/{examQuestions.length} câu
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown Timer */}
            <div className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 font-mono text-sm font-bold shadow-xs transition-colors ${
              isTimeUrgent
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
            }`}>
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Submit button */}
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
            >
              Nộp bài
            </button>
          </div>
        </div>

        {/* Main Exam Grid: Left Question Pane, Right Navigation Grid */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Left Pane (3 cols): Question Content */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
              {/* Question Meta & Flag */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white">
                    Câu {currentIndex + 1}
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    #{currentQ.id}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {currentQ.type}
                  </span>
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                    {currentQ.topic}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFlag(currentQ.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    isFlagged
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800'
                  }`}
                >
                  <Flag className={`h-3.5 w-3.5 ${isFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span>{isFlagged ? 'Đã cắm cờ' : 'Cắm cờ xem lại'}</span>
                </button>
              </div>

              {/* Question Prompt */}
              <div className="mb-6 text-base font-medium leading-relaxed text-slate-900 dark:text-slate-100 sm:text-lg">
                {currentQ.type === 'Đúng / Sai' && parsedTf ? (
                  <MathText text={parsedTf.context} />
                ) : (
                  <MathText text={currentQ.prompt} />
                )}
              </div>

              {/* Answers Input Area */}
              {/* 1. MCQ */}
              {currentQ.type === 'Trắc nghiệm' && currentQ.options && (
                <div className="mb-6 grid gap-2.5 sm:gap-3">
                  {Object.entries(currentQ.options).map(([k, val]) => {
                    const isSelected = userAnswers[currentQ.id]?.selected === k
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleSelectOption(currentQ.id, k)}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition-all sm:text-base ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-500/30 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-100'
                            : 'border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-800/40 dark:text-slate-200'
                        }`}
                      >
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {k}
                        </span>
                        <span className="flex-1 pt-0.5 leading-relaxed">
                          <MathText text={val} />
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* 2. Đúng / Sai */}
              {currentQ.type === 'Đúng / Sai' && parsedTf && (
                <div className="mb-6 space-y-3">
                  {parsedTf.statements.map(st => {
                    const userVal = userAnswers[currentQ.id]?.answers?.[st.key]
                    return (
                      <div
                        key={st.key}
                        className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-800/30"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-200 font-mono text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                            {st.key}
                          </span>
                          <div className="text-sm text-slate-800 dark:text-slate-200 sm:text-base">
                            <MathText text={st.text} />
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => handleSelectTf(currentQ.id, st.key, true)}
                            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
                              userVal === true
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            Đúng
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectTf(currentQ.id, st.key, false)}
                            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
                              userVal === false
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            Sai
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* 3. Tự luận */}
              {currentQ.type === 'Tự luận' && (
                <div className="mb-6 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300">
                  <p className="font-semibold">Dạng Tự luận / Trả lời ngắn:</p>
                  <p className="mt-1 text-xs">
                    Hãy giải chi tiết ra giấy nháp. Sau khi nộp bài thi, hệ thống sẽ mở lời giải chi tiết và đáp án số để bạn đối chiếu.
                  </p>
                </div>
              )}

              {/* Prev / Next buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Câu trước</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentIndex(prev => Math.min(examQuestions.length - 1, prev + 1))}
                  disabled={currentIndex === examQuestions.length - 1}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  <span>Câu tiếp theo</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Pane (1 col): Question Palette Grid */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Danh sách câu hỏi
              </h3>

              <div className="grid grid-cols-5 gap-1.5 max-h-[50vh] overflow-y-auto p-1">
                {examQuestions.map((q, idx) => {
                  const isCurrent = idx === currentIndex
                  const ans = userAnswers[q.id]
                  const hasAnswer = ans && (
                    (q.type === 'Trắc nghiệm' && ans.selected) ||
                    (q.type === 'Đúng / Sai' && ans.answers && Object.keys(ans.answers).length === 4) ||
                    (q.type === 'Tự luận' && ans.selfGraded)
                  )
                  const isFlag = flaggedIds.has(q.id)

                  let bgClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  if (hasAnswer) {
                    bgClass = 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                  if (isCurrent) {
                    bgClass += ' ring-2 ring-indigo-500 ring-offset-2'
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative flex h-8 w-full items-center justify-center rounded-lg text-xs font-bold transition-all ${bgClass}`}
                    >
                      <span>{idx + 1}</span>
                      {isFlag && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400 ring-1 ring-white" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Palette Legend */}
              <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  <span>Đã trả lời ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <span>Chưa làm ({examQuestions.length - answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span>Cắm cờ xem lại ({flaggedIds.size})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Submit Modal */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
              <div className="flex items-center gap-3 text-amber-600">
                <AlertTriangle className="h-6 w-6" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Xác nhận nộp bài?
                </h3>
              </div>

              <div className="mt-3 text-sm text-slate-600 dark:text-slate-300 space-y-2">
                <p>
                  Bạn đã hoàn thành <strong>{answeredCount} / {examQuestions.length}</strong> câu hỏi.
                </p>
                {answeredCount < examQuestions.length && (
                  <p className="text-rose-600 dark:text-rose-400 font-medium">
                    ⚠️ Còn <strong>{examQuestions.length - answeredCount}</strong> câu bạn chưa trả lời!
                  </p>
                )}
                <p>Thời gian còn lại: <strong>{formatTime(timeLeft)}</strong>.</p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmSubmit(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Làm tiếp
                </button>
                <button
                  type="button"
                  onClick={handleFinishExam}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
                >
                  Xác nhận nộp bài
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ==========================================
  // VIEW 3: RESULT REPORT (Báo cáo kết quả & Lời giải)
  // ==========================================
  if (phase === 'result' && examResult) {
    const scoreRank =
      examResult.score >= 9.0 ? { text: 'Xuất sắc (A+)', color: 'text-emerald-600' } :
      examResult.score >= 8.0 ? { text: 'Giỏi (A)', color: 'text-blue-600' } :
      examResult.score >= 6.5 ? { text: 'Khá (B)', color: 'text-indigo-600' } :
      examResult.score >= 5.0 ? { text: 'Đạt (C)', color: 'text-amber-600' } :
      { text: 'Cần nỗ lực thêm', color: 'text-rose-600' }

    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        {/* Score Summary Banner */}
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 text-center shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
            <Award className="h-8 w-8" />
          </div>

          <h2 className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Kết quả thi thử: {selectedPreset.title}
          </h2>

          <div className="mt-2 text-5xl font-black text-slate-900 dark:text-white sm:text-6xl">
            {examResult.score} <span className="text-xl font-medium text-slate-400">/ 10</span>
          </div>

          <div className={`mt-2 text-sm font-bold sm:text-base ${scoreRank.color}`}>
            Đánh giá: {scoreRank.text}
          </div>

          {/* Stats pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Thời gian làm bài: <strong>{formatTime(timeSpent)}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              <span>Đúng hoàn toàn: <strong>{examResult.correctCount}</strong> câu</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-600">
              <XCircle className="h-4 w-4" />
              <span>Cần xem lại: <strong>{examResult.wrongCount}</strong> câu</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleSaveAllMistakes}
              disabled={bulkSavedMistakes}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 disabled:opacity-50 transition-all"
            >
              <Bookmark className="h-4 w-4 fill-white" />
              <span>{bulkSavedMistakes ? 'Đã lưu tất cả câu sai vào sổ' : 'Lưu toàn bộ câu sai vào Sổ tay'}</span>
            </button>

            <button
              onClick={() => setPhase('lobby')}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Thi đề khác</span>
            </button>
          </div>
        </div>

        {/* Detailed Review Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Xem lại chi tiết từng câu hỏi & Lời giải
          </h3>

          {examQuestions.map((q, idx) => {
            const ans = userAnswers[q.id]
            let isCorrect = false
            if (q.type === 'Trắc nghiệm') {
              isCorrect = ans?.selected === q.answer
            } else if (q.type === 'Đúng / Sai') {
              const ansMap = {}
              q.answer.split(';').forEach(p => {
                const m = p.match(/([a-d])\)\s*(Đúng|Sai)/i)
                if (m) ansMap[m[1].toLowerCase()] = m[2].trim().toLowerCase() === 'đúng'
              })
              isCorrect = ['a', 'b', 'c', 'd'].every(k => ans?.answers?.[k] === ansMap[k])
            }

            return (
              <div
                key={q.id}
                className={`rounded-2xl border p-5 shadow-xs transition-colors ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20 dark:border-emerald-950 dark:bg-emerald-950/10'
                    : 'border-rose-200 bg-rose-50/20 dark:border-rose-950 dark:bg-rose-950/10'
                }`}
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Câu {idx + 1}
                    </span>
                    <span className="text-xs text-slate-400">#{q.id}</span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {q.type}
                    </span>
                  </div>
                </div>

                {/* Prompt */}
                <div className="text-sm font-medium leading-relaxed text-slate-900 dark:text-slate-100 sm:text-base">
                  <MathText text={q.prompt} />
                </div>

                {/* Answer comparison */}
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3.5 text-xs sm:text-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      {q.type === 'Trắc nghiệm' && (
                        <span>
                          Bạn đã chọn: <strong>{ans?.selected || 'Chưa chọn'}</strong> | Đáp án đúng:{' '}
                          <strong className="text-emerald-600">{q.answer}</strong>
                        </span>
                      )}
                      {q.type !== 'Trắc nghiệm' && (
                        <div>
                          <span className="font-semibold text-emerald-600">Đáp án tham khảo:</span>{' '}
                          <MathText text={q.answer} />
                        </div>
                      )}
                    </div>

                    <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                      isCorrect ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {isCorrect ? 'Chính xác' : 'Chưa đúng'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return null
}
