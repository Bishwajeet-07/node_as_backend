import { useEffect } from "react"
import { CheckCircle2, X } from "lucide-react"

export default function Toast({ message, onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  if (!message) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl shadow-2xl border border-slate-700/50 dark:border-slate-200 animate-in slide-in-from-bottom-5 duration-200 text-xs font-medium">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 text-slate-400 hover:text-white dark:hover:text-slate-900 rounded-md cursor-pointer transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

