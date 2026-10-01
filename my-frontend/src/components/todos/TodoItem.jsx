import { useState, useRef, useEffect } from "react"
import { CheckSquare, Square, Trash2, Calendar, Pencil, Check, X } from "lucide-react"
import { formatDate } from "../../utils/date"

export default function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const editInputRef = useRef(null)

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [isEditing])

  // Cancel edit if task gets completed
  useEffect(() => {
    if (todo.completed) {
      setIsEditing(false)
    }
  }, [todo.completed])

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return
    if (editTitle.trim() !== todo.title) {
      onEdit(todo._id, editTitle.trim())
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditTitle(todo.title)
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === "Escape") {
      handleCancelEdit()
    }
  }

  const handleDelete = () => {
    if (confirmingDelete) {
      onDelete(todo._id)
    } else {
      setConfirmingDelete(true)
    }
  }

  return (
    <li
      className={`group relative flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border transition-all duration-200 ${
        todo.completed
          ? "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/50 text-slate-400 dark:text-slate-500"
          : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-200 dark:hover:border-indigo-900/50 shadow-2xs hover:shadow-xs"
      }`}
    >
      {/* Check Toggle Button */}
      <button
        onClick={() => onToggle(todo._id, todo.completed)}
        disabled={isEditing}
        className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-110 active:scale-95 cursor-pointer transition-all shrink-0 p-0.5 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label={todo.completed ? "Mark as incomplete" : "Mark as completed"}
      >
        {todo.completed ? (
          <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        ) : (
          <Square className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
        )}
      </button>

      {/* Task Content / Inline Edit Form */}
      <div className="flex-1 min-w-0 pr-2">
        {isEditing && !todo.completed ? (
          <div className="flex items-center gap-2 w-full">
            <input
              ref={editInputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-indigo-500 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              onClick={handleSaveEdit}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer transition-colors shrink-0"
              title="Save task"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer transition-colors shrink-0"
              title="Cancel editing"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <p
              className={`text-sm leading-snug break-words whitespace-pre-wrap transition-colors ${
                todo.completed
                  ? "line-through text-slate-400 dark:text-slate-500"
                  : "text-slate-800 dark:text-slate-100 font-medium"
              }`}
            >
              {todo.title}
            </p>

            {todo.createdAt && (
              <div className="flex items-center gap-1 mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(todo.createdAt)}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions (Edit & Delete Buttons) */}
      {!isEditing && (
        <div className="flex items-center gap-1 shrink-0">
          {confirmingDelete ? (
            <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-lg p-1 animate-in fade-in zoom-in-95 duration-150">
              <span className="text-[11px] font-medium text-rose-700 dark:text-rose-300 px-1 hidden sm:inline">
                Delete?
              </span>
              <button
                onClick={handleDelete}
                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md cursor-pointer transition-colors active:scale-95"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-md hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer transition-colors active:scale-95"
              >
                No
              </button>
            </div>
          ) : (
            <>
              {/* Edit Button - Disabled & Hidden when task is completed */}
              {!todo.completed && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:scale-105 active:scale-95 cursor-pointer rounded-lg transition-all opacity-80 group-hover:opacity-100"
                  title="Edit task"
                  aria-label="Edit task"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}

              {/* Delete Button */}
              <button
                onClick={handleDelete}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:scale-105 active:scale-95 cursor-pointer rounded-lg transition-all opacity-80 group-hover:opacity-100"
                title="Delete task"
                aria-label="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}
    </li>
  )
}

