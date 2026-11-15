import { questions } from './questions'

export const EXAM_CATEGORIES = [
  {
    id: 'standard',
    title: 'Đề Thi Tiêu Chuẩn',
    shortName: 'Tiêu chuẩn',
    durationMinutes: 90,
    questionCount: 28,
    examCount: 35,
    description: '18 câu Trắc nghiệm + 4 câu Đúng/Sai + 6 câu Tự luận. Bao phủ 100% ngân hàng 1.000 câu theo thang điểm 10.',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
  },
  {
    id: 'speed',
    title: 'Đề Tốc Độ MCQ',
    shortName: 'Tốc độ',
    durationMinutes: 25,
    questionCount: 20,
    examCount: 32,
    description: '20 câu trắc nghiệm ngẫu nhiên trải đều các tuần. Luyện phản xạ và kỹ năng bấm máy tính nhanh (~1.2 phút/câu).',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
  },
  {
    id: 'true_false',
    title: 'Chuyên Đề Đúng / Sai',
    shortName: 'Đúng / Sai',
    durationMinutes: 40,
    questionCount: 10,
    examCount: 15,
    description: '10 bài tập Đúng/Sai (tổng 40 mệnh đề a, b, c, d). Luyện chống mất điểm ở dạng bài 4.0 điểm nhiều bẫy nhất.',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
  },
  {
    id: 'hardcore',
    title: 'Boss Mode: Săn Điểm A+',
    shortName: 'Boss Mode',
    durationMinutes: 60,
    questionCount: 15,
    examCount: 12,
    description: '15 câu hỏi Vận dụng & Vận dụng cao khó nhất ngân hàng (FPC Freedman, OLS khi xóa điểm, Bayes hợp).',
    badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
  }
]

// Separate pools by question type
const mcqPool = questions.filter(q => q.type === 'Trắc nghiệm')
const tfPool = questions.filter(q => q.type === 'Đúng / Sai')
const essayPool = questions.filter(q => q.type === 'Tự luận')
const hardcorePool = questions.filter(q => q.difficulty === 'Vận dụng cao' || q.difficulty === 'Vận dụng')

// Build all fixed exams deterministically once
const allFixedExams = {}

// 1. Generate 35 Standard Exams (DE-01 to DE-35)
// Each exam: 18 MCQ, 4 TF, 6 Essay
for (let i = 0; i < 35; i++) {
  const examId = `DE-${String(i + 1).padStart(2, '0')}`

  // Deterministic slice for MCQ (wraps around if needed)
  const mcqSlice = []
  for (let j = 0; j < 18; j++) {
    const idx = (i * 18 + j) % mcqPool.length
    mcqSlice.push(mcqPool[idx])
  }

  // Deterministic slice for TF
  const tfSlice = []
  for (let j = 0; j < 4; j++) {
    const idx = (i * 4 + j) % tfPool.length
    tfSlice.push(tfPool[idx])
  }

  // Deterministic slice for Essay
  const essaySlice = []
  for (let j = 0; j < 6; j++) {
    const idx = (i * 6 + j) % essayPool.length
    essaySlice.push(essayPool[idx])
  }

  const combined = [...mcqSlice, ...tfSlice, ...essaySlice].map((q, idx) => ({
    ...q,
    examIndex: idx + 1
  }))

  allFixedExams[examId] = {
    id: examId,
    code: examId,
    title: `Mã đề ${examId}`,
    category: 'standard',
    categoryName: 'Đề Thi Tiêu Chuẩn',
    durationMinutes: 90,
    totalQuestions: 28,
    questions: combined
  }
}

// 2. Generate 32 Speed MCQ Exams (SPEED-01 to SPEED-32)
// Each exam: 20 MCQ
for (let i = 0; i < 32; i++) {
  const examId = `SPEED-${String(i + 1).padStart(2, '0')}`
  const slice = []
  for (let j = 0; j < 20; j++) {
    const idx = (i * 20 + j) % mcqPool.length
    slice.push(mcqPool[idx])
  }

  allFixedExams[examId] = {
    id: examId,
    code: examId,
    title: `Mã đề ${examId}`,
    category: 'speed',
    categoryName: 'Đề Tốc độ MCQ',
    durationMinutes: 25,
    totalQuestions: 20,
    questions: slice.map((q, idx) => ({ ...q, examIndex: idx + 1 }))
  }
}

// 3. Generate 15 True/False Exams (TF-01 to TF-15)
// Each exam: 10 TF
for (let i = 0; i < 15; i++) {
  const examId = `TF-${String(i + 1).padStart(2, '0')}`
  const slice = []
  for (let j = 0; j < 10; j++) {
    const idx = (i * 10 + j) % tfPool.length
    slice.push(tfPool[idx])
  }

  allFixedExams[examId] = {
    id: examId,
    code: examId,
    title: `Mã đề ${examId}`,
    category: 'true_false',
    categoryName: 'Chuyên đề Đúng / Sai',
    durationMinutes: 40,
    totalQuestions: 10,
    questions: slice.map((q, idx) => ({ ...q, examIndex: idx + 1 }))
  }
}

// 4. Generate 12 Boss Mode Exams (BOSS-01 to BOSS-12)
// Each exam: 15 Hardcore questions
for (let i = 0; i < 12; i++) {
  const examId = `BOSS-${String(i + 1).padStart(2, '0')}`
  const slice = []
  for (let j = 0; j < 15; j++) {
    const idx = (i * 15 + j) % hardcorePool.length
    slice.push(hardcorePool[idx])
  }

  allFixedExams[examId] = {
    id: examId,
    code: examId,
    title: `Mã đề ${examId}`,
    category: 'hardcore',
    categoryName: 'Boss Mode Săn Điểm A+',
    durationMinutes: 60,
    totalQuestions: 15,
    questions: slice.map((q, idx) => ({ ...q, examIndex: idx + 1 }))
  }
}

export function getExamsByCategory(category) {
  return Object.values(allFixedExams).filter(e => e.category === category)
}

export function getExamById(examId) {
  return allFixedExams[examId] || null
}
