import React, { useState, useMemo } from 'react'
import { Search as SearchIcon, X, Bookmark, Eye, EyeOff, HelpCircle } from 'lucide-react'
import { questions } from '../data/questions'
import MathText from '../components/MathText'
import { useMistakes } from '../hooks/useMistakes'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState('ALL')
  const [selectedWeek, setSelectedWeek] = useState('ALL')
  const [revealedIds, setRevealedIds] = useState(new Set())

  const { isMistake, toggleMistake } = useMistakes()

  const toggleReveal = (id) => {
    setRevealedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return questions.filter(item => {
      if (selectedType !== 'ALL' && item.type !== selectedType) return false
      if (selectedWeek !== 'ALL' && item.week !== parseInt(selectedWeek, 10)) return false

      if (!q) return true
      return (
        item.prompt.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.meta.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
      )
    })
  }, [query, selectedType, selectedWeek])

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
          Tra cứu Ngân hàng 1.000 Câu hỏi
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Tìm kiếm nhanh theo từ khóa, mã câu hỏi hoặc công thức toán học.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
          <SearchIcon className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nhập từ khóa tìm kiếm (ví dụ: xác suất, hồi quy, kỳ vọng, #0150...)"
          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pr-10 pl-11 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white sm:text-base transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-500 dark:text-slate-400">Loại câu:</span>
        {['ALL', 'Trắc nghiệm', 'Đúng / Sai', 'Tự luận'].map(t => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
              selectedType === t
                ? 'bg-blue-600 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            {t === 'ALL' ? 'Tất cả' : t}
          </button>
        ))}

        <span className="ml-2 font-semibold text-slate-500 dark:text-slate-400">Tuần:</span>
        {['ALL', '1', '2', '3', '4', '5', '6', '7'].map(w => (
          <button
            key={w}
            onClick={() => setSelectedWeek(w)}
            className={`rounded-lg px-2 py-1 font-medium transition-colors ${
              selectedWeek === w
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            {w === 'ALL' ? 'Tất cả' : `T${w}`}
          </button>
        ))}
      </div>

      {/* Result count */}
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Tìm thấy <strong className="text-blue-600 dark:text-blue-400">{filtered.length}</strong> kết quả
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {filtered.slice(0, 100).map((item) => {
          const isRevealed = revealedIds.has(item.id)
          const inMistakes = isMistake(item.id)

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

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleMistake(item.id)}
                    className={`rounded-lg p-1.5 transition-colors ${
                      inMistakes
                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800'
                    }`}
                    title={inMistakes ? 'Bỏ lưu sổ sai' : 'Lưu vào sổ sai lầm'}
                  >
                    <Bookmark className={`h-4 w-4 ${inMistakes ? 'fill-amber-500' : ''}`} />
                  </button>

                  <button
                    onClick={() => toggleReveal(item.id)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
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
                </div>
              </div>

              {/* Prompt */}
              <div className="text-sm font-medium leading-relaxed text-slate-900 dark:text-slate-100 sm:text-base">
                <MathText text={item.prompt} />
              </div>

              {/* Revealed Answer Box */}
              {isRevealed && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-sm dark:border-emerald-900/60 dark:bg-emerald-950/40">
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Đáp án chính xác
                  </div>
                  {item.type === 'Trắc nghiệm' && (
                    <div className="text-emerald-950 dark:text-emerald-100">
                      <strong>Đáp án {item.answer}:</strong>{' '}
                      <MathText text={item.options?.[item.answer] || ''} />
                    </div>
                  )}
                  {item.type !== 'Trắc nghiệm' && (
                    <div className="text-emerald-950 dark:text-emerald-100">
                      <MathText text={item.answer} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {filtered.length > 100 && (
          <div className="p-4 text-center text-xs text-slate-400">
            Hiển thị 100 kết quả đầu tiên. Hãy nhập từ khóa chi tiết hơn để thu hẹp kết quả.
          </div>
        )}
      </div>
    </div>
  )
}
