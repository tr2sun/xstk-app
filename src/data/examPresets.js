import { questions } from './questions'

export const EXAM_PRESETS = [
  {
    id: 'standard',
    title: 'Đề thi Chuẩn UET MAT1052',
    subtitle: 'Mô phỏng 100% cấu trúc đề thi chính thức VNU',
    durationMinutes: 90,
    totalQuestions: 28,
    composition: {
      mcq: 18,
      tf: 4,
      essay: 6
    },
    badge: 'Chuẩn thi thật',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    description: '18 câu Trắc nghiệm (4.5đ) + 4 câu Đúng/Sai 16 ý (4.0đ) + 6 câu Tự luận/Điền số (1.5đ). Barem thang điểm 10 chuẩn thi kết thúc học phần.'
  },
  {
    id: 'speed',
    title: 'Đề Tốc độ Phản xạ',
    subtitle: 'Rèn luyện bấm máy tính và lý thuyết nhanh',
    durationMinutes: 25,
    totalQuestions: 20,
    composition: {
      mcq: 20,
      tf: 0,
      essay: 0
    },
    badge: 'Luyện tốc độ',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    description: '20 câu trắc nghiệm ngẫu nhiên trải đều 7 tuần. Áp lực thời gian ~1.2 phút/câu để tăng phản xạ nhận biết dạng bài.'
  },
  {
    id: 'true_false',
    title: 'Chuyên đề Đúng / Sai',
    subtitle: 'Chinh phục dạng bài 4.0 điểm nhiều bẫy nhất',
    durationMinutes: 40,
    totalQuestions: 8,
    composition: {
      mcq: 0,
      tf: 8,
      essay: 0
    },
    badge: 'Chống mất điểm',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    description: '8 câu Đúng/Sai (tổng 32 mệnh đề a, b, c, d). Đánh trúng các bẫy logic về OLS, kiểm định và tính chất biến ngẫu nhiên.'
  },
  {
    id: 'hardcore',
    title: 'Boss Mode: Săn điểm A+',
    subtitle: 'Tuyển tập câu hỏi Vận dụng & Vận dụng cao',
    durationMinutes: 60,
    totalQuestions: 15,
    composition: {
      hardcore: 15
    },
    badge: 'Săn điểm A',
    badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    description: '15 câu hỏi khó nhất ngân hàng (FPC Freedman, cập nhật OLS khi xóa điểm, Bayes hợp) dành cho mục tiêu A và A+.'
  },
  {
    id: 'custom',
    title: 'Đề Tự cấu hình (Custom)',
    subtitle: 'Tự chọn số câu, thời gian và phạm vi tuần học',
    durationMinutes: 45,
    totalQuestions: 30,
    badge: 'Tùy biến',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    description: 'Linh hoạt cấu hình thời gian (15-120 phút), số câu hỏi (10-50 câu) và chọn lọc các tuần kiến thức bạn cần củng cố.'
  }
]

// Helper to shuffle array
function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Generate randomized questions for a given exam preset
 */
export function generateExam(presetId, customConfig = {}) {
  const mcqPool = questions.filter(q => q.type === 'Trắc nghiệm')
  const tfPool = questions.filter(q => q.type === 'Đúng / Sai')
  const essayPool = questions.filter(q => q.type === 'Tự luận')
  const hardcorePool = questions.filter(q => q.difficulty === 'Vận dụng cao' || q.difficulty === 'Vận dụng')

  let selected = []

  if (presetId === 'standard') {
    // 18 MCQ + 4 TF + 6 Essay
    const selectedMcq = shuffle(mcqPool).slice(0, 18)
    const selectedTf = shuffle(tfPool).slice(0, 4)
    const selectedEssay = shuffle(essayPool).slice(0, 6)
    selected = [...selectedMcq, ...selectedTf, ...selectedEssay]
  } else if (presetId === 'speed') {
    // 20 MCQ
    selected = shuffle(mcqPool).slice(0, 20)
  } else if (presetId === 'true_false') {
    // 8 TF
    selected = shuffle(tfPool).slice(0, 8)
  } else if (presetId === 'hardcore') {
    // 15 Hardcore
    selected = shuffle(hardcorePool).slice(0, 15)
  } else if (presetId === 'custom') {
    const count = customConfig.questionCount || 25
    const weeks = customConfig.weeks && customConfig.weeks.length > 0 ? customConfig.weeks : [1, 2, 3, 4, 5, 6, 7]
    const filteredPool = questions.filter(q => weeks.includes(q.week))
    selected = shuffle(filteredPool).slice(0, count)
  }

  // Tag questions with exam sequence number
  return selected.map((q, index) => ({
    ...q,
    examIndex: index + 1
  }))
}

/**
 * Calculate exam score on standard 10-point scale
 */
export function gradeExam(presetId, examQuestions, userAnswers) {
  let totalScore = 0
  let maxScore = 10
  let correctCount = 0
  let wrongCount = 0

  const breakdown = {
    mcq: { correct: 0, total: 0, points: 0 },
    tf: { correctStatements: 0, totalStatements: 0, points: 0 },
    essay: { reviewed: 0, total: 0, points: 0 }
  }

  if (presetId === 'standard') {
    // Standard UET scale:
    // 18 MCQ: 0.25 pt each = 4.5 pts
    // 4 TF: graded per sub-item a,b,c,d: 1=0.1, 2=0.25, 3=0.5, 4=1.0 pt
    // 6 Essay: 0.25 pt each = 1.5 pts

    examQuestions.forEach(q => {
      const ans = userAnswers[q.id]

      if (q.type === 'Trắc nghiệm') {
        breakdown.mcq.total++
        if (ans?.selected === q.answer) {
          breakdown.mcq.correct++
          breakdown.mcq.points += 0.25
          correctCount++
        } else {
          wrongCount++
        }
      } else if (q.type === 'Đúng / Sai') {
        breakdown.tf.totalStatements += 4
        // Parse answer string
        const ansMap = {}
        q.answer.split(';').forEach(p => {
          const m = p.match(/([a-d])\)\s*(Đúng|Sai)/i)
          if (m) ansMap[m[1].toLowerCase()] = m[2].trim().toLowerCase() === 'đúng'
        })

        let correctSubs = 0
        const subAnswers = ans?.answers || {}
        ;['a', 'b', 'c', 'd'].forEach(subKey => {
          if (subAnswers[subKey] === ansMap[subKey]) {
            correctSubs++
            breakdown.tf.correctStatements++
          }
        })

        // VNU standard grading ladder: 1->0.1, 2->0.25, 3->0.5, 4->1.0
        const ladder = { 0: 0, 1: 0.1, 2: 0.25, 3: 0.5, 4: 1.0 }
        const pts = ladder[correctSubs] || 0
        breakdown.tf.points += pts

        if (correctSubs === 4) {
          correctCount++
        } else {
          wrongCount++
        }
      } else if (q.type === 'Tự luận') {
        breakdown.essay.total++
        // For essay, if user marked as self-correct
        if (ans?.selfGraded === 'correct') {
          breakdown.essay.reviewed++
          breakdown.essay.points += 0.25
          correctCount++
        } else {
          wrongCount++
        }
      }
    })

    totalScore = breakdown.mcq.points + breakdown.tf.points + breakdown.essay.points
  } else {
    // Proportional scale for other modes
    const pointPerQ = 10 / examQuestions.length
    examQuestions.forEach(q => {
      const ans = userAnswers[q.id]
      if (q.type === 'Trắc nghiệm') {
        if (ans?.selected === q.answer) {
          totalScore += pointPerQ
          correctCount++
        } else {
          wrongCount++
        }
      } else if (q.type === 'Đúng / Sai') {
        const ansMap = {}
        q.answer.split(';').forEach(p => {
          const m = p.match(/([a-d])\)\s*(Đúng|Sai)/i)
          if (m) ansMap[m[1].toLowerCase()] = m[2].trim().toLowerCase() === 'đúng'
        })
        const subAnswers = ans?.answers || {}
        let matchAll = true
        ;['a', 'b', 'c', 'd'].forEach(subKey => {
          if (subAnswers[subKey] !== ansMap[subKey]) matchAll = false
        })
        if (matchAll) {
          totalScore += pointPerQ
          correctCount++
        } else {
          wrongCount++
        }
      } else {
        if (ans?.selfGraded === 'correct') {
          totalScore += pointPerQ
          correctCount++
        } else {
          wrongCount++
        }
      }
    })
  }

  return {
    score: Math.min(10, Math.round(totalScore * 10) / 10),
    maxScore,
    correctCount,
    wrongCount,
    breakdown
  }
}
