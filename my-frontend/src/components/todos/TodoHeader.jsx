import { Sun, Moon, LogOut, CheckSquare } from "lucide-react"

export default function TodoHeader({ user, onLogout, dark, toggleTheme }) {
  const initial = user?.username?.[0]?.toUpperCase() || "U"

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800/90 sticky top-0 z-30 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-xs">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-base tracking-tight block leading-none">
              TaskWorkspace
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500 mt-1 block">
              Dashboard
            </span>
          </div>
        </div>

        {/* Right Section: Theme Toggle + User Info + Logout */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-150"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* User Details */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
              {initial}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {user?.username || "User"}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight truncate max-w-[140px]">
                {user?.email || ""}
              </p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 text-xs font-medium border border-slate-200/80 hover:border-rose-200 dark:border-slate-700/60 dark:hover:border-rose-900/60 hover:scale-[1.02] active:scale-95 cursor-pointer transition-all duration-150"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  )
}

