import { BarChart3, Clock, CheckCheck, ListTodo } from "lucide-react"

export default function TodoStats({ totalCount, activeCount, doneCount }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
        <span>Overview</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {/* Total */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 transition-colors">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Total</span>
            <ListTodo className="w-3.5 h-3.5" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{totalCount}</p>
        </div>

        {/* Pending */}
        <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/40 transition-colors">
          <div className="flex items-center justify-between text-amber-500 dark:text-amber-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-300">Pending</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{activeCount}</p>
        </div>

        {/* Completed */}
        <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 transition-colors">
          <div className="flex items-center justify-between text-emerald-500 dark:text-emerald-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Done</span>
            <CheckCheck className="w-3.5 h-3.5" />
          </div>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{doneCount}</p>
        </div>
      </div>
    </div>
  )
}
