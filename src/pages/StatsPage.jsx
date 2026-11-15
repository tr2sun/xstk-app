import React from 'react'
import { BarChart2, Award, CheckCircle, XCircle, Bookmark, RefreshCw } from 'lucide-react'
import { questions, WEEKS, TYPES } from '../data/questions'
import { useProgress } from '../hooks/useProgress'
import { useMistakes } from '../hooks/useMistakes'

export default function StatsPage() {
  const { stats, progress, resetProgress } = useProgress()
  const { mistakeCount, clearAllMistakes } = useMistakes()

  const totalQuestions = questions.length // 1000

  // Calculate stats by week
  const weekStats = WEEKS.map(w => {
    const weekQs = questions.filter(q => q.week === w.id)
    const answeredCount = weekQs.filter(q => progress[q.id]).length
    const correctCount = weekQs.filter(q => progress[q.id]?.status === 'correct').length
    const percent = weekQs.length > 0 ? Math.round((answeredCount / weekQs.length) * 100) : 0
    return {
      ...w,
      total: weekQs.length,
      answered: answeredCount,
      correct: correctCount,
      percent
    }
  })

  // Calculate stats by type
  const typeStats = TYPES.map(t => {
    const typeQs = questions.filter(q => q.type === t)
    const answeredCount = typeQs.filter(q => progress[q.id]).length
    const correctCount = typeQs.filter(q => progress[q.id]?.status === 'correct').length
    const percent = typeQs.length > 0 ? Math.round((answeredCount / typeQs.length) * 100) : 0
    return {
      name: t,
      total: typeQs.length,
      answered: answeredCount,
      correct: correctCount,
      percent
    }
  })

  const overallPercent = Math.round((stats.totalAnswered / totalQuestions) * 100)

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
          Thống kê tiến độ ôn luyện
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Theo dõi số câu đã hoàn thành, tỉ lệ trả lời đúng và các phần cần cải thiện.
        </p>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Total completed */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Award className="h-4 w-4 text-blue-500" />
            <span>Tiến độ tổng</span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalAnswered} <span className="text-xs font-normal text-slate-400">/ {totalQuestions}</span>
          </div>
          <div className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
            Đã hoàn thành {overallPercent}%
          </div>
        </div>

        {/* Correct */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span>Đúng</span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.correctCount}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Tỉ lệ đúng: {stats.accuracy}%
          </div>
        </div>

        {/* Wrong */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <XCircle className="h-4 w-4 text-rose-500" />
            <span>Chưa đúng</span>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
            {stats.wrongCount}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Cần ôn lại
          </div>
        </div>

        {/* Bookmarked / Mistakes */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Bookmark className="h-4 w-4 text-amber-500" />
            <span>Sổ sai lầm</span>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            {mistakeCount}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Câu cần lưu ý
          </div>
        </div>
      </div>

      {/* Progress by Week */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Tiến độ chi tiết theo từng Tuần
        </h2>
        <div className="space-y-4">
          {weekStats.map(w => (
            <div key={w.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {w.name}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {w.answered}/{w.total} câu ({w.percent}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${w.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress by Question Type */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Tiến độ theo định dạng câu hỏi
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {typeStats.map(t => (
            <div
              key={t.name}
              className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40"
            >
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {t.name}
              </div>
              <div className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                {t.answered} <span className="text-xs font-normal text-slate-400">/ {t.total} câu</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all"
                  style={{ width: `${t.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset data danger zone */}
      <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/60 dark:bg-rose-950/20">
        <div>
          <div className="text-xs font-bold text-rose-800 dark:text-rose-300">
            Đặt lại dữ liệu học tập
          </div>
          <div className="text-xs text-rose-600/80 dark:text-rose-400/80">
            Xóa toàn bộ lịch sử trả lời và các câu trong sổ sai lầm trên trình duyệt này.
          </div>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử ôn thi và bắt đầu lại từ đầu?')) {
              resetProgress()
              clearAllMistakes()
            }
          }}
          className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-950/50 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Xóa dữ liệu</span>
        </button>
      </div>
    </div>
  )
}
