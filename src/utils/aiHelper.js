// Utility to build pedagogical prompts for MAT1052 questions and open AI companion side windows

export function buildQuestionPrompt(question) {
  let prompt = `Bạn là giảng viên Xác suất Thống kê trường ĐH Công nghệ (UET - ĐHQGHN) đang giải thích bài tập cho sinh viên ôn thi môn MAT1052.\n\n`
  prompt += `【THÔNG TIN CÂU HỎI】\n`
  prompt += `- Mã câu: ${question.id} (${question.type})\n`
  prompt += `- Chủ đề: ${question.topic || 'Tổng hợp'}${question.week ? ` · Tuần ${question.week}` : ''}\n`
  prompt += `- Mức độ: ${question.difficulty || 'Thông hiểu'}\n\n`
  prompt += `【ĐỀ BÀI】\n${question.prompt}\n\n`

  if (question.type === 'Trắc nghiệm' && question.options) {
    prompt += `【CÁC LỰA CHỌN】\n`
    Object.entries(question.options).forEach(([k, v]) => {
      prompt += `${k}. ${v}\n`
    })
    prompt += `\n`
  }

  prompt += `【ĐÁP ÁN THAM KHẢO CỦA ĐỀ】\n${question.answer}\n\n`
  prompt += `【YÊU CẦU GIẢI THÍCH CHI TIẾT】\n`
  prompt += `1. Nêu rõ các định lý, công thức hoặc quy tắc xác suất/thống kê áp dụng cho bài này.\n`
  prompt += `2. Trình bày chi tiết từng bước tính toán, suy luận toán học rõ ràng, dễ hiểu.\n`
  prompt += `3. Giải thích tại sao đáp án trên lại chính xác và vì sao các phương án khác chưa đúng (nếu là trắc nghiệm).\n`
  return prompt
}

let aiWindowRef = null

export function openAICompanion(type, question) {
  const prompt = buildQuestionPrompt(question)
  const screenW = window.screen.availWidth || 1440
  const screenH = window.screen.availHeight || 900
  // Target width ~480px docked to the right edge
  const sideW = Math.min(480, Math.floor(screenW * 0.35))
  const sideLeft = Math.max(0, screenW - sideW)

  let targetUrl = ''
  if (type === 'chatgpt') {
    targetUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`
  } else {
    // Gemini: auto copy prompt to clipboard then open gemini
    try {
      navigator.clipboard.writeText(prompt)
    } catch (e) {
      console.warn('Clipboard write error:', e)
    }
    targetUrl = 'https://gemini.google.com/app'
  }

  const winFeatures = `width=${sideW},height=${screenH},left=${sideLeft},top=0,resizable=yes,scrollbars=yes,status=no`

  try {
    if (aiWindowRef && !aiWindowRef.closed) {
      aiWindowRef.location.href = targetUrl
      aiWindowRef.focus()
    } else {
      aiWindowRef = window.open(targetUrl, 'MAT1052_AI_Companion', winFeatures)
    }
  } catch (err) {
    console.error('Failed to open side window:', err)
    // Fallback to normal new tab if popup is blocked
    window.open(targetUrl, '_blank')
  }
}
