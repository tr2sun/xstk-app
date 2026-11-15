import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Play, Trash2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { questions } from '../data/questions'
import { useMistakes } from '../hooks/useMistakes'
import MathText from '../components/MathText'

export default function MistakesPage() {
  const { mistakes, mistakeIds, removeMistake, clearAllMistakes } = useMistakes()
  const [revealedIds, setRevealedIds] = useState(new Set())

  const mistakeQuestions = questions.filter(q => mistakeIds.includes(q.id))

  const toggleReveal = (id) => {
    setRevealedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      {/* Page Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
            Sổ tay câu sai & Đã lưu
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tổng hợp các câu bạn làm sai hoặc đã chủ động đánh dấu để ôn lại.
          </p>
        </div>

        {mistakeQuestions.length > 0 && (
          <div className="flex items-center gap-2">
            <Link
              to="/?mode=mistakes"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Luyện tập sổ sai ({mistakeQuestions.length})</span>
            </Link>

            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn xóa tất cả câu trong sổ sai lầm?')) {
                  clearAllMistakes()
                }
              }}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Xóa hết</span>
            </button>
          </div>
        )}
      </div>

      {mistakeQuestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Sổ sai lầm đang trống!
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Khi bạn trả lời sai một câu trong mục Luyện tập hoặc bấm vào icon bookmark, câu đó sẽ xuất hiện ở đây.
          </p>
          <Link
            to="/"
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
          >
            Bắt đầu luyện tập ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mistakeQuestions.map((item) => {
            const isRevealed = revealedIds.has(item.id)

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                      #{item.id.replace('MAT1052-', '')}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      Tuần {item.week}
                    </span>
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                      {item.type}
                    </span>
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                      {item.topic}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleReveal(item.id)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          <span>Ẩn đáp án</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          <span>Xem đáp án</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => removeMistake(item.id)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors"
                      title="Xóa câu này khỏi sổ sai"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Prompt */}
                <div className="text-sm font-medium leading-relaxed text-slate-900 dark:text-slate-100 sm:text-base">
                  <MathText text={item.prompt} />
                </div>

                {/* Options if MCQ */}
                {item.type === 'Trắc nghiệm' && item.options && (
                  <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {Object.entries(item.options).map(([key, val]) => (
                      <div
                        key={key}
                        className={`rounded-lg border px-3 py-2 text-xs sm:text-sm ${
                          isRevealed && key === item.answer
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold dark:bg-emerald-950/50 dark:text-emerald-200'
                            : 'border-slate-100 bg-slate-50/70 text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300'
                        }`}
                      >
                        <strong className="mr-1.5">{key}.</strong>
                        <MathText text={val} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer callout */}
                {isRevealed && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-sm dark:border-emerald-900/60 dark:bg-emerald-950/40">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      Đáp án chính xác
                    </div>
                    <div className="text-emerald-950 dark:text-emerald-100">
                      <MathText text={item.answer} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
