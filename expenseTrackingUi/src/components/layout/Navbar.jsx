import { useAuth } from "../../context/AuthContext"
import {
  Wallet,
  Sun,
  Moon,
  Plus,
  LayoutDashboard,
  Receipt,
  Users,
  UserCheck,
  Tags,
  User,
} from "lucide-react"

const MOBILE_NAV_ITEMS = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "groups", label: "Groups", icon: Users },
  { id: "friends", label: "Friends", icon: UserCheck },
  { id: "categories", label: "Categories", icon: Tags },
  { id: "profile", label: "Profile", icon: User },
]

export default function Navbar({
  currentTab,
  onNavigate,
  onOpenAddExpense,
  onOpenCreateGroup,
}) {
  const { user, dark, toggleTheme } = useAuth()

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800/90 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Kharcha
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenAddExpense}
            className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs cursor-pointer"
            title="Add Expense"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Toggle Theme"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800/90 px-2 py-1.5 flex items-center justify-around">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = currentTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
