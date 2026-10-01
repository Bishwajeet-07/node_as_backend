import { Sun, Moon, CheckSquare } from "lucide-react"

export default function AuthLayout({ children, dark, toggleTheme }) {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 transition-colors duration-200">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-5 right-5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150"
        title="Toggle Theme"
        aria-label="Toggle theme"
      >
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Auth Container Card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white mb-3.5 shadow-sm">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            TaskWorkspace
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize your workday with clarity and focus
          </p>
        </div>

        {children}
      </div>

      <p className="mt-8 text-xs text-slate-400 dark:text-slate-600 text-center">
        &copy; {new Date().getFullYear()} TaskWorkspace. All rights reserved.
      </p>
    </div>
  )
}
