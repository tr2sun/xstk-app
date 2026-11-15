import React from 'react'
import { ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react'

export default function ProgressBar({
  currentIndex,
  total,
  correctCount = 0,
  wrongCount = 0,
  onPrev,
  onNext,
  onJump
}) {
  const percent = total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            Câu <strong className="text-blue-600 dark:text-blue-400">{currentIndex + 1}</strong> / {total}
          </span>
          <span className="text-xs text-slate-400">({percent}%)</span>
        </div>

        {/* Quick session score */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
            <CheckCircle className="h-4 w-4" />
            <span>{correctCount}</span>
          </div>
          <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold text-xs">
            <XCircle className="h-4 w-4" />
            <span>{wrongCount}</span>
          </div>

          {/* Prev / Next buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onPrev}
              disabled={currentIndex <= 0}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Câu trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={onNext}
              disabled={currentIndex >= total - 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Câu tiếp"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress track */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
