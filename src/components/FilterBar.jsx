import React, { useState } from 'react'
import { Filter, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { WEEKS, TYPES, TOPICS, DIFFICULTIES } from '../data/questions'

export default function FilterBar({
  selectedWeeks = [],
  setSelectedWeeks,
  selectedTypes = [],
  setSelectedTypes,
  selectedTopics = [],
  setSelectedTopics,
  selectedDifficulties = [],
  setSelectedDifficulties,
  totalFiltered = 0,
  onReset
}) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleItem = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item))
    } else {
      setList([...list, item])
    }
  }

  const activeFiltersCount =
    selectedWeeks.length +
    selectedTypes.length +
    selectedTopics.length +
    selectedDifficulties.length

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100"
        >
          <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Bộ lọc câu hỏi</span>
          {activeFiltersCount > 0 && (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
              {activeFiltersCount}
            </span>
          )}
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <span className="font-medium text-slate-500 dark:text-slate-400">
            Có <strong className="text-blue-600 dark:text-blue-400">{totalFiltered}</strong> câu phù hợp
          </span>
          {activeFiltersCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 font-semibold text-rose-500 hover:text-rose-600 hover:underline"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded filters panel */}
      {isOpen && (
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          {/* 1. Chọn Tuần */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Theo Tuần học
            </label>
            <div className="flex flex-wrap gap-1.5">
              {WEEKS.map(w => {
                const active = selectedWeeks.includes(w.id)
                return (
                  <button
                    key={w.id}
                    onClick={() => toggleItem(selectedWeeks, setSelectedWeeks, w.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Tuần {w.id}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Loại câu hỏi */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Loại câu hỏi
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map(t => {
                const active = selectedTypes.includes(t)
                return (
                  <button
                    key={t}
                    onClick={() => toggleItem(selectedTypes, setSelectedTypes, t)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. Chủ đề kiến thức */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Chủ đề kiến thức
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TOPICS.map(top => {
                const active = selectedTopics.includes(top)
                return (
                  <button
                    key={top}
                    onClick={() => toggleItem(selectedTopics, setSelectedTopics, top)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {top}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 4. Mức độ */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Mức độ khó
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DIFFICULTIES.map(d => {
                const active = selectedDifficulties.includes(d)
                return (
                  <button
                    key={d}
                    onClick={() => toggleItem(selectedDifficulties, setSelectedDifficulties, d)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
