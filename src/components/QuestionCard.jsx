import React, { useState, useEffect } from 'react'
import { Bookmark, CheckCircle2, XCircle, HelpCircle, RotateCcw, Eye, ArrowRight } from 'lucide-react'
import MathText from './MathText'

export default function QuestionCard({
  question,
  isBookmarked = false,
  onToggleBookmark,
  onAnswerSubmit,
  onNext,
  showNextButton = true
}) {
  // State for MCQ
  const [selectedOption, setSelectedOption] = useState(null)
  
  // State for TF4: { a: null, b: null, c: null, d: null }
  const [tfAnswers, setTfAnswers] = useState({ a: null, b: null, c: null, d: null })
  
  // State for checked / revealed
  const [isChecked, setIsChecked] = useState(false)
  const [showEssaySolution, setShowEssaySolution] = useState(false)

  // Reset local state whenever question changes
  useEffect(() => {
    setSelectedOption(null)
    setTfAnswers({ a: null, b: null, c: null, d: null })
    setIsChecked(false)
    setShowEssaySolution(false)
  }, [question?.id])

  if (!question) return null

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return

      if (question.type === 'Trắc nghiệm' && !isChecked) {
        const key = e.key.toUpperCase()
        if (['A', 'B', 'C', 'D'].includes(key) && question.options?.[key]) {
          setSelectedOption(key)
        } else if (['1', '2', '3', '4'].includes(e.key)) {
          const map = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' }
          const k = map[e.key]
          if (question.options?.[k]) setSelectedOption(k)
        }
      }

      if (e.key === ' ' || e.key === 'Enter') {
        if (!isChecked) {
          if (question.type === 'Trắc nghiệm' && selectedOption) {
            e.preventDefault()
            handleCheck()
          } else if (question.type === 'Đúng / Sai' && Object.values(tfAnswers).every(v => v !== null)) {
            e.preventDefault()
            handleCheck()
          } else if (question.type === 'Tự luận' && !showEssaySolution) {
            e.preventDefault()
            setShowEssaySolution(true)
          }
        } else if (showNextButton && onNext) {
          e.preventDefault()
          onNext()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [question, isChecked, selectedOption, tfAnswers, showEssaySolution, showNextButton, onNext])

  // Parse TF4 prompt and answer
  const parsedTf = React.useMemo(() => {
    if (question.type !== 'Đúng / Sai') return null

    // Parse answer: "a) Đúng  ;  b) Sai  ;  c) Đúng  ;  d) Sai"
    const ansMap = {}
    const ansParts = question.answer.split(';')
    ansParts.forEach(part => {
      const match = part.match(/([a-d])\)\s*(Đúng|Sai)/i)
      if (match) {
        ansMap[match[1].toLowerCase()] = match[2].trim().toLowerCase() === 'đúng'
      }
    })

    // Parse prompt: split into context + sub statements
    const tfRegex = /^(.*?)(?:\s*a\s*\)\s*)(.*?)(?:\s*b\s*\)\s*)(.*?)(?:\s*c\s*\)\s*)(.*?)(?:\s*d\s*\)\s*)(.*)$/
    const match = question.prompt.match(tfRegex)

    if (match) {
      return {
        context: match[1].trim(),
        statements: [
          { key: 'a', text: match[2].trim(), isCorrectTrue: ansMap['a'] },
          { key: 'b', text: match[3].trim(), isCorrectTrue: ansMap['b'] },
          { key: 'c', text: match[4].trim(), isCorrectTrue: ansMap['c'] },
          { key: 'd', text: match[5].trim(), isCorrectTrue: ansMap['d'] },
        ]
      }
    }

    return {
      context: question.prompt,
      statements: [
        { key: 'a', text: 'Mệnh đề a', isCorrectTrue: ansMap['a'] },
        { key: 'b', text: 'Mệnh đề b', isCorrectTrue: ansMap['b'] },
        { key: 'c', text: 'Mệnh đề c', isCorrectTrue: ansMap['c'] },
        { key: 'd', text: 'Mệnh đề d', isCorrectTrue: ansMap['d'] },
      ]
    }
  }, [question])

  // Check answers
  const handleCheck = () => {
    setIsChecked(true)

    if (question.type === 'Trắc nghiệm') {
      const isCorrect = selectedOption === question.answer
      if (onAnswerSubmit) {
        onAnswerSubmit(question.id, isCorrect ? 'correct' : 'wrong', { selected: selectedOption })
      }
    } else if (question.type === 'Đúng / Sai' && parsedTf) {
      const allCorrect = parsedTf.statements.every(st => tfAnswers[st.key] === st.isCorrectTrue)
      if (onAnswerSubmit) {
        onAnswerSubmit(question.id, allCorrect ? 'correct' : 'wrong', { answers: tfAnswers })
      }
    }
  }

  const handleReset = () => {
    setSelectedOption(null)
    setTfAnswers({ a: null, b: null, c: null, d: null })
    setIsChecked(false)
    setShowEssaySolution(false)
  }

  // Type badge color
  const typeBadgeColor = {
    'Trắc nghiệm': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'Đúng / Sai': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    'Tự luận': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  }[question.type] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'

  return (
    <div className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900 sm:p-7">
      {/* Header: Meta tags & Bookmark */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
            #{question.id.replace('MAT1052-', '')}
          </span>
          <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${typeBadgeColor}`}>
            {question.type}
          </span>
          {question.week && (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Tuần {question.week}
            </span>
          )}
          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            {question.topic}
          </span>
          <span className="hidden rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400 sm:inline-block">
            {question.difficulty}
          </span>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={() => onToggleBookmark && onToggleBookmark(question.id)}
          className={`group flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
            isBookmarked
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
          }`}
          title={isBookmarked ? 'Bỏ lưu khỏi sổ sai' : 'Lưu vào sổ sai lầm'}
        >
          <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
          <span className="hidden sm:inline">
            {isBookmarked ? 'Đã lưu sổ sai' : 'Lưu câu này'}
          </span>
        </button>
      </div>

      {/* Question Prompt */}
      <div className="mb-6 text-base font-medium leading-relaxed text-slate-900 dark:text-slate-100 sm:text-lg">
        {question.type === 'Đúng / Sai' && parsedTf ? (
          <MathText text={parsedTf.context} />
        ) : (
          <MathText text={question.prompt} />
        )}
      </div>

      {/* Question Body: Type-specific rendering */}

      {/* 1. Trắc nghiệm MCQ */}
      {question.type === 'Trắc nghiệm' && question.options && (
        <div className="mb-6 grid gap-2.5 sm:gap-3">
          {Object.entries(question.options).map(([key, value]) => {
            if (!value) return null
            const isSelected = selectedOption === key
            const isCorrect = key === question.answer

            let btnStyle = 'border-slate-200 bg-white text-slate-800 hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700/80 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-blue-950/30'

            if (isChecked) {
              if (isCorrect) {
                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-200'
              } else if (isSelected && !isCorrect) {
                btnStyle = 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/30 dark:border-rose-500 dark:bg-rose-950/50 dark:text-rose-200'
              } else {
                btnStyle = 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500'
              }
            } else if (isSelected) {
              btnStyle = 'border-blue-600 bg-blue-50/80 text-blue-950 ring-2 ring-blue-500/30 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-100'
            }

            return (
              <button
                key={key}
                type="button"
                disabled={isChecked}
                onClick={() => setSelectedOption(key)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm font-normal transition-all sm:text-base ${btnStyle}`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                  isChecked && isCorrect
                    ? 'bg-emerald-500 text-white'
                    : isChecked && isSelected && !isCorrect
                    ? 'bg-rose-500 text-white'
                    : isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  {key}
                </span>
                <span className="flex-1 pt-0.5 leading-relaxed">
                  <MathText text={value} />
                </span>
                {isChecked && isCorrect && (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                )}
                {isChecked && isSelected && !isCorrect && (
                  <XCircle className="h-5 w-5 shrink-0 text-rose-500" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* 2. Đúng / Sai TF4 */}
      {question.type === 'Đúng / Sai' && parsedTf && (
        <div className="mb-6 space-y-3">
          {parsedTf.statements.map((st) => {
            const userChoice = tfAnswers[st.key]
            const isAnswered = userChoice !== null
            const isCorrect = userChoice === st.isCorrectTrue

            return (
              <div
                key={st.key}
                className={`flex flex-col gap-2 rounded-xl border p-3.5 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                  isChecked
                    ? isCorrect
                      ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30'
                      : 'border-rose-300 bg-rose-50/60 dark:border-rose-900 dark:bg-rose-950/30'
                    : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-200 font-mono text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                    {st.key}
                  </span>
                  <div className="text-sm font-normal leading-relaxed text-slate-800 dark:text-slate-200 sm:text-base">
                    <MathText text={st.text} />
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    disabled={isChecked}
                    onClick={() => setTfAnswers(prev => ({ ...prev, [st.key]: true }))}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      userChoice === true
                        ? isChecked
                          ? st.isCorrectTrue
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                          : 'bg-blue-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Đúng
                  </button>
                  <button
                    type="button"
                    disabled={isChecked}
                    onClick={() => setTfAnswers(prev => ({ ...prev, [st.key]: false }))}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      userChoice === false
                        ? isChecked
                          ? !st.isCorrectTrue
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                          : 'bg-blue-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Sai
                  </button>

                  {isChecked && (
                    <span className="ml-1 text-xs font-semibold">
                      {isCorrect ? (
                        <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400">
                          (Đáp án: {st.isCorrectTrue ? 'Đúng' : 'Sai'})
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 3. Tự luận Essay */}
      {question.type === 'Tự luận' && (
        <div className="mb-6 space-y-3">
          {!showEssaySolution ? (
            <div className="flex items-center justify-between rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
              <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
                <HelpCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Hãy tự giải ra giấy hoặc nháp trước khi xem lời giải mẫu.</span>
              </div>
              <button
                type="button"
                onClick={() => setShowEssaySolution(true)}
                className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-amber-700 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>Xem đáp án</span>
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
              <div className="mb-2 flex items-center justify-between border-b border-emerald-200/80 pb-2 dark:border-emerald-800/80">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Đáp án & Lời giải tham khảo
                </span>
                <button
                  type="button"
                  onClick={() => setShowEssaySolution(false)}
                  className="text-xs text-emerald-700 hover:underline dark:text-emerald-400"
                >
                  Thu gọn
                </button>
              </div>
              <div className="text-sm font-normal leading-relaxed text-emerald-950 dark:text-emerald-100 sm:text-base">
                <MathText text={question.answer} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feedback Banner (MCQ / TF4 after check) */}
      {isChecked && question.type === 'Trắc nghiệm' && (
        <div className={`mb-5 flex items-center gap-3 rounded-xl p-3.5 text-sm font-medium ${
          selectedOption === question.answer
            ? 'bg-emerald-100/80 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
            : 'bg-rose-100/80 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200'
        }`}>
          {selectedOption === question.answer ? (
            <>
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Chính xác! Đáp án đúng là <strong>{question.answer}</strong>. 🎉</span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>Chưa chính xác! Bạn chọn <strong>{selectedOption || 'chưa chọn'}</strong>, đáp án đúng là <strong>{question.answer}</strong>.</span>
            </>
          )}
        </div>
      )}

      {/* Footer Actions: Check button, Reset, Next */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {!isChecked && question.type !== 'Tự luận' ? (
            <button
              type="button"
              onClick={handleCheck}
              disabled={
                (question.type === 'Trắc nghiệm' && !selectedOption) ||
                (question.type === 'Đúng / Sai' && !Object.values(tfAnswers).every(v => v !== null))
              }
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 transition-all"
            >
              <span>Kiểm tra đáp án</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Làm lại</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showNextButton && onNext && (
            <button
              type="button"
              onClick={onNext}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-all"
            >
              <span>Câu tiếp theo</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="mt-3 hidden items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 sm:flex">
        <span>Phím tắt: A/B/C/D để chọn</span>
        <span>Phím Space hoặc Enter để Kiểm tra / Câu tiếp</span>
      </div>
    </div>
  )
}
