import { LayoutList, Clock, CheckCheck } from "lucide-react"

export default function TodoFilter({ filter, setFilter, allCount, activeCount, doneCount }) {
  const filters = [
    { key: "all", label: "All Tasks", icon: LayoutList, count: allCount },
    { key: "active", label: "Pending", icon: Clock, count: activeCount },
    { key: "completed", label: "Completed", icon: CheckCheck, count: doneCount },
  ]

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        <LayoutList className="w-3.5 h-3.5 text-indigo-500" />
        <span>Filter Tasks</span>
      </div>

      <div className="flex flex-col gap-1">
        {filters.map(({ key, label, icon: Icon, count }) => {
          const isActive = filter === key
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 active:scale-[0.99] ${
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 font-semibold shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`} />
                <span>{label}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                  isActive
                    ? "bg-indigo-200/70 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200"
                    : "bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

