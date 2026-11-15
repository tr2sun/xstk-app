import React, { useState, useEffect, useRef } from 'react'
import {
  Trophy,
  Clock,
  Zap,
  CheckSquare,
  Flame,
  Flag,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  Bookmark,
  CheckCircle,
  XCircle,
  Play,
  Award,
  ArrowRight,
  Filter,
  Eye,
  ArrowLeft
} from 'lucide-react'
import { EXAM_CATEGORIES, getExamsByCategory, getExamById } from '../data/fixedExamBank'
import { gradeExam } from '../data/examPresets'
import MathText from '../components/MathText'
import { useMistakes } from '../hooks/useMistakes'
import { useExamHistory } from '../hooks/useExamHistory'

export default function ExamPage() {
  // Phase: 'lobby' | 'exam' | 'result'
  const [phase, setPhase] = useState('lobby')
  // Lobby step: 'categories' (Chọn kiểu form đề) | 'codes' (Chọn mã đề cụ thể)
  const [lobbyStep, setLobbyStep] = useState('categories')
  const [activeCategory, setActiveCategory] = useState('standard')
  const [filterStatus, setFilterStatus] = useState('all') // 'all' | 'completed' | 'uncompleted'

  // Exam runtime state
  const [activeExam, setActiveExam] = useState(null)
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
  const { history, recordExamResult } = useExamHistory()
  const timerRef = useRef(null)

  // Timer countdown
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

  // Select category -> go to codes selection
  const handleSelectCategory = (catId) => {
    setActiveCategory(catId)
    setFilterStatus('all')
    setLobbyStep('codes')
  }

  // Start exam from a specific fixed exam
  const handleStartExam = (exam) => {
    setActiveExam(exam)
    setCurrentIndex(0)
    setUserAnswers({})
    setFlaggedIds(new Set())
    setBulkSavedMistakes(false)

    const totalSeconds = exam.durationMinutes * 60
    setTimeLeft(totalSeconds)
    setTimeSpent(0)
    setPhase('exam')
  }

  // Review a previously completed exam
  const handleReviewOldExam = (exam) => {
    const record = history[exam.id]
    if (!record) return
    setActiveExam(exam)
    setUserAnswers(record.userAnswers || {})
    setExamResult({
      score: record.score,
      maxScore: record.maxScore || 10,
      correctCount: record.correctCount || 0,
      wrongCount: record.wrongCount || 0
    })
    setTimeSpent(record.timeSpent || 0)
    setPhase('result')
  }

  // Answer handlers
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

  // Finish exam and grade
  const handleFinishExam = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setShowConfirmSubmit(false)

    const result = gradeExam(activeExam.category, activeExam.questions, userAnswers)
    setExamResult(result)

    // Save record to exam history
    recordExamResult(activeExam.id, {
      score: result.score,
      maxScore: result.maxScore,
      correctCount: result.correctCount,
      wrongCount: result.wrongCount,
      totalQuestions: activeExam.totalQuestions,
      timeSpent: timeSpent,
      userAnswers: userAnswers
    })

    setPhase('result')
  }

  // Save all mistakes to notebook
  const handleSaveAllMistakes = () => {
    if (!activeExam || !examResult) return
    activeExam.questions.forEach(q => {
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const categoryIcons = {
    standard: Trophy,
    speed: Zap,
    true_false: CheckSquare,
    hardcore: Flame
  }

  // Current list of exams for active category tab
  const categoryExams = getExamsByCategory(activeCategory)
  const categoryInfo = EXAM_CATEGORIES.find(c => c.id === activeCategory) || EXAM_CATEGORIES[0]

  // Category stats
  const completedInExams = categoryExams.filter(e => !!history[e.id])
  const completedPercent = categoryExams.length > 0 ? Math.round((completedInExams.length / categoryExams.length) * 100) : 0
  const avgCategoryScore = completedInExams.length > 0
    ? (completedInExams.reduce((sum, e) => sum + (history[e.id]?.score || 0), 0) / completedInExams.length).toFixed(1)
    : '0.0'

  // Filtered exams by completion status
  const displayedExams = categoryExams.filter(exam => {
    const isDone = !!history[exam.id]
    if (filterStatus === 'completed') return isDone
    if (filterStatus === 'uncompleted') return !isDone
    return true
  })

  // ==========================================
  // VIEW 1: LOBBY
  // ==========================================
  if (phase === 'lobby') {
    // ------------------------------------------
    // STEP 1A: CHỌN KIỂU FORM ĐỀ BAN ĐẦU
    // ------------------------------------------
    if (lobbyStep === 'categories') {
      return (
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Trophy className="h-3.5 w-3.5" />
              <span>Phòng Thi Thử Chuẩn MAT1052</span>
            </div>
            <h1 className="mt-3 text-2xl font-black text-slate-900 dark:text-white sm:text-4xl">
              Chọn Hình Thức Luyện Đề
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
              Chọn kiểu form đề bạn muốn ôn tập để mở danh sách các mã đề thi tương ứng.
            </p>
          </div>

          {/* Form Selection Cards Grid */}
          <div className="grid gap-5 sm:grid-cols-2">
            {EXAM_CATEGORIES.map(cat => {
              const Icon = categoryIcons[cat.id] || Trophy
              const catExams = getExamsByCategory(cat.id)
              const completedCount = catExams.filter(e => !!history[e.id]).length
              const percent = Math.round((completedCount / cat.examCount) * 100)

              return (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className="group relative flex cursor-pointer flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-blue-500 hover:shadow-lg transition-all dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${cat.badgeColor}`}>
                        {cat.examCount} mã đề cố định
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <Clock className="h-3.5 w-3.5 text-blue-500" />
                        <span>{cat.durationMinutes} phút</span>
                        <span>•</span>
                        <span>{cat.questionCount} câu</span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all dark:bg-blue-950/60 dark:text-blue-400">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {cat.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {cat.durationMinutes} phút · {cat.questionCount} câu/đề · Thang điểm 10
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {cat.description}
                    </p>
                  </div>

                  {/* Progress & Select Button */}
                  <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <div className="mb-3 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span>Đã hoàn thành: <strong>{completedCount} / {cat.examCount}</strong> đề</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{percent}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <button
                      type="button"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white group-hover:bg-blue-600 shadow-md group-hover:shadow-blue-500/20 transition-all dark:bg-slate-800 dark:group-hover:bg-blue-600"
                    >
                      <span>Chọn xem các mã đề</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // ------------------------------------------
    // STEP 1B: CHỌN MÃ ĐỀ CỦA FORM ĐÃ CHỌN
    // ------------------------------------------
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        {/* Back to Categories selection */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setLobbyStep('categories')}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Đổi kiểu form đề khác</span>
          </button>

          {/* Quick tab switcher */}
          <div className="hidden sm:flex items-center gap-1.5">
            {EXAM_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {cat.shortName}
              </button>
            ))}
          </div>
        </div>

        {/* Progress & Category Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white sm:text-xl">
                  {categoryInfo.title}
                </h2>
                <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${categoryInfo.badgeColor}`}>
                  {categoryInfo.durationMinutes} phút · {categoryInfo.questionCount} câu/đề
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {categoryInfo.description}
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex shrink-0 items-center gap-4 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0 dark:border-slate-800">
              <div className="text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tiến độ cày đề</div>
                <div className="text-lg font-black text-blue-600 dark:text-blue-400">
                  {completedInExams.length} <span className="text-xs font-normal text-slate-400">/ {categoryExams.length} đề</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Điểm trung bình</div>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {avgCategoryScore} <span className="text-xs font-normal text-slate-400">/ 10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>Đã hoàn thành {completedPercent}% số đề</span>
              <span>{completedInExams.length}/{categoryExams.length} đề</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300"
                style={{ width: `${completedPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter bar for exams (Tất cả / Chưa làm / Đã làm) */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-semibold text-slate-500 dark:text-slate-400">Lọc mã đề:</span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'uncompleted', label: 'Chưa làm' },
              { id: 'completed', label: 'Đã hoàn thành' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                  filterStatus === f.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-slate-400">
            Hiển thị <strong>{displayedExams.length}</strong> mã đề
          </span>
        </div>

        {/* Fixed Exam Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayedExams.map(exam => {
            const record = history[exam.id]
            const isCompleted = !!record

            let scoreBadgeColor = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            if (isCompleted) {
              if (record.score >= 8.5) {
                scoreBadgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              } else if (record.score >= 6.5) {
                scoreBadgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
              } else {
                scoreBadgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }
            }

            return (
              <div
                key={exam.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black tracking-tight text-slate-900 dark:text-white">
                      {exam.code}
                    </span>
                    <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${scoreBadgeColor}`}>
                      {isCompleted ? `${record.score} / 10đ` : 'Chưa làm'}
                    </span>
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                    {exam.title}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-blue-500" />
                      <span>{exam.durationMinutes}p</span>
                    </span>
                    <span>•</span>
                    <span>{exam.totalQuestions} câu hỏi</span>
                  </div>

                  {isCompleted && (
                    <div className="mt-2 text-[11px] text-slate-400">
                      Đúng {record.correctCount}/{exam.totalQuestions} câu · {formatTime(record.timeSpent || 0)}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <button
                    onClick={() => handleStartExam(exam)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all"
                  >
                    <Play className="h-3 w-3 fill-white" />
                    <span>{isCompleted ? 'Thi lại' : 'Vào thi'}</span>
                  </button>

                  {isCompleted && (
                    <button
                      onClick={() => handleReviewOldExam(exam)}
                      className="flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      title="Xem lại kết quả bài cũ"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ==========================================
  // VIEW 2: EXAM ROOM (Đang làm bài)
  // ==========================================
  const currentQ = activeExam?.questions?.[currentIndex] || null
  const answeredCount = activeExam?.questions?.filter(q => {
    const ans = userAnswers[q.id]
    if (!ans) return false
    if (q.type === 'Trắc nghiệm') return !!ans.selected
    if (q.type === 'Đúng / Sai') return ans.answers && Object.keys(ans.answers).length === 4
    return !!ans.selfGraded
  }).length || 0

  if (phase === 'exam' && currentQ) {
    const isFlagged = flaggedIds.has(currentQ.id)
    const isTimeUrgent = timeLeft < 300

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
        {/* Sticky Header */}
        <div className="sticky top-16 z-30 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 dark:text-white">
              {activeExam.title}
            </span>
            <span className="hidden rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300 sm:inline-block">
              Đã làm: {answeredCount}/{activeExam.totalQuestions} câu
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 font-mono text-sm font-bold shadow-xs transition-colors ${
              isTimeUrgent
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
            }`}>
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
            >
              Nộp bài
            </button>
          </div>
        </div>

        {/* Exam Split Panes */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Question Pane */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
              {/* Question Header */}
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

              {/* Prompt */}
              <div className="mb-6 text-base font-medium leading-relaxed text-slate-900 dark:text-slate-100 sm:text-lg">
                {currentQ.type === 'Đúng / Sai' && parsedTf ? (
                  <MathText text={parsedTf.context} />
                ) : (
                  <MathText text={currentQ.prompt} />
                )}
              </div>

              {/* Answers */}
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
                  onClick={() => setCurrentIndex(prev => Math.min(activeExam.questions.length - 1, prev + 1))}
                  disabled={currentIndex === activeExam.questions.length - 1}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  <span>Câu tiếp theo</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Question Palette Grid */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Danh sách câu hỏi
              </h3>

              <div className="grid grid-cols-5 gap-1.5 max-h-[50vh] overflow-y-auto p-1">
                {activeExam.questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex
                  const ans = userAnswers[q.id]
                  const hasAnswer = ans && (
                    (q.type === 'Trắc nghiệm' && ans.selected) ||
                    (q.type === 'Đúng / Sai' && ans.answers && Object.keys(ans.answers).length === 4) ||
                    (q.type === 'Tự luận' && ans.selfGraded)
                  )
                  const isFlag = flaggedIds.has(q.id)

                  let bgClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  if (hasAnswer) bgClass = 'bg-blue-600 text-white hover:bg-blue-700'
                  if (isCurrent) bgClass += ' ring-2 ring-indigo-500 ring-offset-2'

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

              {/* Legend */}
              <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  <span>Đã trả lời ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <span>Chưa làm ({activeExam.totalQuestions - answeredCount})</span>
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
                  Bạn đã làm <strong>{answeredCount} / {activeExam.totalQuestions}</strong> câu hỏi.
                </p>
                {answeredCount < activeExam.totalQuestions && (
                  <p className="text-rose-600 dark:text-rose-400 font-medium">
                    ⚠️ Còn <strong>{activeExam.totalQuestions - answeredCount}</strong> câu bạn chưa trả lời!
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
  // VIEW 3: RESULT REPORT (Báo cáo kết quả)
  // ==========================================
  if (phase === 'result' && examResult && activeExam) {
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
            Kết quả: {activeExam.title} ({activeExam.categoryName})
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
              <span>Đúng: <strong>{examResult.correctCount}</strong> câu</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-600">
              <XCircle className="h-4 w-4" />
              <span>Cần xem lại: <strong>{examResult.wrongCount}</strong> câu</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setPhase('lobby')
                setLobbyStep('codes')
              }}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
            >
              <ArrowRight className="h-4 w-4" />
              <span>Trở về danh sách đề</span>
            </button>

            <button
              onClick={handleSaveAllMistakes}
              disabled={bulkSavedMistakes}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 disabled:opacity-50 transition-all"
            >
              <Bookmark className="h-4 w-4 fill-white" />
              <span>{bulkSavedMistakes ? 'Đã lưu tất cả câu sai vào sổ' : 'Lưu toàn bộ câu sai vào Sổ tay'}</span>
            </button>

            <button
              onClick={() => handleStartExam(activeExam)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Thi lại đề này</span>
            </button>
          </div>
        </div>

        {/* Detailed Review Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Xem lại chi tiết từng câu hỏi & Lời giải
          </h3>

          {activeExam.questions.map((q, idx) => {
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

                  <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                    isCorrect ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {isCorrect ? 'Chính xác' : 'Chưa đúng'}
                  </span>
                </div>

                <div className="text-sm font-medium leading-relaxed text-slate-900 dark:text-slate-100 sm:text-base">
                  <MathText text={q.prompt} />
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3.5 text-xs sm:text-sm dark:border-slate-800 dark:bg-slate-900">
                  {q.type === 'Trắc nghiệm' && (
                    <div>
                      Bạn đã chọn: <strong>{ans?.selected || 'Chưa chọn'}</strong> | Đáp án đúng:{' '}
                      <strong className="text-emerald-600">{q.answer}</strong>
                    </div>
                  )}
                  {q.type !== 'Trắc nghiệm' && (
                    <div>
                      <span className="font-semibold text-emerald-600">Đáp án tham khảo:</span>{' '}
                      <MathText text={q.answer} />
                    </div>
                  )}
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
