import TodoItem from "./TodoItem"
import { CheckCheck, Inbox, Loader2 } from "lucide-react"

export default function TodoList({ todos, filter, loading, onToggle, onEdit, onDelete }) {
  const getHeaderTitle = () => {
    if (filter === "active") return "Pending Tasks"
    if (filter === "completed") return "Completed Tasks"
    return "All Tasks"
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0 mb-3.5">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {getHeaderTitle()}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Showing {todos.length} {todos.length === 1 ? "task" : "tasks"}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
          {todos.length}
        </span>
      </div>

      {/* Loading State */}
      {loading && todos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
          <p className="text-xs font-medium">Fetching tasks...</p>
        </div>
      ) : todos.length === 0 ? (
        /* Empty State */
        <div className="flex-1 my-auto p-6 bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
            {filter === "completed" ? (
              <CheckCheck className="w-6 h-6 text-slate-400" />
            ) : (
              <Inbox className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {filter === "completed"
              ? "No completed tasks yet"
              : filter === "active"
              ? "No pending tasks"
              : "No tasks found"}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
            {filter === "completed"
              ? "Mark tasks as complete from your list to see them here."
              : "Add a task using the input form on the panel."}
          </p>
        </div>
      ) : (
        /* Task List */
        <ul className="flex-1 overflow-y-auto min-h-0 space-y-2.5 pr-1.5 custom-scrollbar">
          {todos.map((todo) => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

