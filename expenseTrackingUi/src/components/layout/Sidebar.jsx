import { useAuth } from "../../context/AuthContext"
import {
  LayoutDashboard,
  Receipt,
  Users,
  UserCheck,
  Tags,
  User,
  LogOut,
  Wallet,
  Sun,
  Moon,
} from "lucide-react"

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "expenses", label: "Personal Expenses", icon: Receipt },
  { id: "groups", label: "Split Groups", icon: Users },
  { id: "friends", label: "Friends", icon: UserCheck },
  { id: "categories", label: "Categories", icon: Tags },
  { id: "profile", label: "Account", icon: User },
]

export default function Sidebar({ currentTab, onNavigate }) {
  const { user, dark, toggleTheme, logout } = useAuth()

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800/90 h-screen select-none shrink-0 transition-colors">
      {/* App Branding */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Kharcha
            </span>
            <span className="block text-[11px] text-slate-400">
              Expense & Split Tracker
            </span>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Toggle Theme"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = currentTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                }`}
              />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
          <div
            onClick={() => onNavigate("profile")}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user?.name || "User"}
              </span>
              <span className="block text-[10px] text-slate-400 truncate">
                {user?.email}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
