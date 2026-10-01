import { useState, useRef, useEffect } from "react"
import { Plus } from "lucide-react"

export default function TodoInput({ onAddTodo, adding }) {
  const [title, setTitle] = useState("")
  const textareaRef = useRef(null)

  // Auto resize height as user types long text
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`
    }
  }, [title])

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!title.trim() || adding) return
    try {
      await onAddTodo(title)
      setTitle("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    } catch {
      // Error handled by hook
    }
  }

  const handleKeyDown = (e) => {
    // Pressing Enter without Shift submits the form
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        <Plus className="w-3.5 h-3.5 text-indigo-500" />
        <span>Add New Task</span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <textarea
          ref={textareaRef}
          rows={1}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done? (Press Enter to add)"
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all resize-none max-h-36 overflow-y-auto leading-relaxed [scrollbar-width:none] [-ms-overflow-style:none]"
        />
        <button
          type="submit"
          disabled={adding || !title.trim()}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium text-sm rounded-lg shadow-xs hover:shadow-md transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {adding ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Adding Task...
            </span>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

