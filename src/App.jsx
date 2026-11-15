import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import PracticePage from './pages/PracticePage'
import SearchPage from './pages/SearchPage'
import MistakesPage from './pages/MistakesPage'
import StatsPage from './pages/StatsPage'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
          <Navbar />
          <main className="flex-1 pb-16">
            <Routes>
              <Route path="/" element={<PracticePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/mistakes" element={<MistakesPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <div className="mx-auto max-w-7xl px-4 space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                MAT1052 — Xác suất & Thống kê | UET - ĐHQGHN
              </p>
              <p>
                Dữ liệu ôn tập từ Ngân hàng 1.000 câu hỏi học phần MAT1052. Lưu trữ trên máy người dùng (Client-Side).
              </p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}
