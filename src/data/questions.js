import rawQuestions from './questions.json'

// Standardize each question
export const questions = rawQuestions.map(q => {
  let week = null
  if (q.meta && q.meta.includes('Tuần')) {
    const match = q.meta.match(/Tuần\s*(\d+)/i)
    if (match) week = parseInt(match[1], 10)
  }

  let topic = 'Khác'
  let difficulty = 'Thông hiểu'
  if (q.meta && q.meta.includes('·')) {
    const afterDot = q.meta.split('·')[1].trim()
    const diffKeywords = ['Vận dụng cao', 'Vận dụng', 'Thông hiểu', 'Nhận biết']
    let foundDiff = false
    for (const d of diffKeywords) {
      if (afterDot.endsWith(d)) {
        difficulty = d
        topic = afterDot.slice(0, -d.length).trim()
        foundDiff = true
        break
      }
    }
    if (!foundDiff) {
      topic = afterDot
    }
  }

  return {
    ...q,
    week,
    topic,
    difficulty
  }
})

export const WEEKS = [
  { id: 1, name: 'Tuần 1: Câu hỏi và dữ liệu' },
  { id: 2, name: 'Tuần 2: Thống kê mô tả' },
  { id: 3, name: 'Tuần 3: Ngữ pháp đồ họa' },
  { id: 4, name: 'Tuần 4: Tương quan & hồi quy' },
  { id: 5, name: 'Tuần 5: Biến ngẫu nhiên rời rạc' },
  { id: 6, name: 'Tuần 6: Xác suất' },
  { id: 7, name: 'Tuần 7: Kỳ vọng & phương sai' },
]

export const TOPICS = [
  'Câu hỏi và dữ liệu',
  'Thống kê mô tả',
  'Ngữ pháp đồ họa',
  'Tương quan và hồi quy',
  'Biến ngẫu nhiên rời rạc',
  'Xác suất',
  'Kỳ vọng và phương sai',
]

export const TYPES = ['Trắc nghiệm', 'Đúng / Sai', 'Tự luận']

export const DIFFICULTIES = ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao']

export function filterQuestions({
  weeks = [],
  topics = [],
  types = [],
  difficulties = [],
  search = '',
  mistakeIds = null
} = {}) {
  return questions.filter(q => {
    if (mistakeIds && !mistakeIds.includes(q.id)) return false
    if (weeks.length > 0 && !weeks.includes(q.week)) return false
    if (topics.length > 0 && !topics.includes(q.topic)) return false
    if (types.length > 0 && !types.includes(q.type)) return false
    if (difficulties.length > 0 && !difficulties.includes(q.difficulty)) return false
    if (search.trim()) {
      const s = search.toLowerCase()
      const matchPrompt = q.prompt.toLowerCase().includes(s)
      const matchId = q.id.toLowerCase().includes(s)
      const matchMeta = q.meta.toLowerCase().includes(s)
      if (!matchPrompt && !matchId && !matchMeta) return false
    }
    return true
  })
}
