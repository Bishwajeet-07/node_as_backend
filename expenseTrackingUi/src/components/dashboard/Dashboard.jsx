import { useMemo } from "react"
import { useAuth, formatCurrency } from "../../context/AuthContext"
import {
  Wallet,
  Users,
  TrendingDown,
  Plus,
  ArrowRight,
  Receipt,
  Tag,
  CreditCard,
  Smartphone,
  Banknote,
  Building,
  Calendar,
  Sparkles,
  PieChart,
} from "lucide-react"

const PAYMENT_ICONS = {
  UPI: Smartphone,
  Cash: Banknote,
  Card: CreditCard,
  "Net Banking": Building,
}

export default function Dashboard({
  expenses = [],
  groups = [],
  categories = [],
  friends = [],
  onNavigate,
  onOpenAddExpense,
  onOpenCreateGroup,
}) {
  const { user, currency } = useAuth()

  // Total personal spend
  const totalPersonalSpend = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  }, [expenses])

  // Category spending breakdown
  const categoryBreakdown = useMemo(() => {
    if (totalPersonalSpend === 0) return []

    const map = {}
    expenses.forEach((e) => {
      const catObj =
        typeof e.category === "object" && e.category !== null
          ? e.category
          : categories.find((c) => c._id === (e.category?._id || e.category))
      const catId = catObj?._id || e.category
      const catName = catObj?.name || "Uncategorized"
      const catIcon = catObj?.icon || "🏷️"
      const catColor = catObj?.color || "#6366f1"

      if (!map[catId]) {
        map[catId] = {
          id: catId,
          name: catName,
          icon: catIcon,
          color: catColor,
          total: 0,
        }
      }
      map[catId].total += Number(e.amount) || 0
    })

    return Object.values(map)
      .map((item) => ({
        ...item,
        percentage: Math.round((item.total / totalPersonalSpend) * 100),
      }))
      .sort((a, b) => b.total - a.total)
  }, [expenses, totalPersonalSpend])

  // Top Category
  const topCategory = categoryBreakdown[0]

  // Recent 5 expenses
  const recentExpenses = useMemo(() => {
    return expenses.slice(0, 5)
  }, [expenses])

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Overview
          </span>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-0.5">
            Welcome back, {user?.name || "User"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Here is a snapshot of your recent transactions and shared split groups.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenAddExpense}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
          <button
            onClick={onOpenCreateGroup}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>New Group</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Total Spent */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Personal Spend
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {formatCurrency(totalPersonalSpend, currency)}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
              Across {expenses.length} transaction{expenses.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Active Groups & Friends */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Split Groups & Friends
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 flex items-baseline gap-2">
              <span>{groups.length}</span>
              <span className="text-xs font-sans font-normal text-slate-400">
                groups &bull; {friends.length} friends
              </span>
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <button
                onClick={() => onNavigate("groups")}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>Groups</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <button
                onClick={() => onNavigate("friends")}
                className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>Friends</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Top Category */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Top Category
            </span>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
              <span>{topCategory ? topCategory.icon : "—"}</span>
              <span className="truncate">{topCategory ? topCategory.name : "None yet"}</span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
              {topCategory
                ? `${formatCurrency(topCategory.total, currency)} (${topCategory.percentage}% of total)`
                : "No data available"}
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <PieChart className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Personal Expenses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Recent Personal Expenses</span>
            </h2>
            <button
              onClick={() => onNavigate("expenses")}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                No expenses logged yet.
              </p>
              <button
                onClick={onOpenAddExpense}
                className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
              >
                + Record your first expense
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentExpenses.map((exp) => {
                const cat =
                  typeof exp.category === "object" && exp.category !== null
                    ? exp.category
                    : categories.find((c) => c._id === (exp.category?._id || exp.category))
                const catColor = cat?.color || "#6366f1"
                const PaymentIcon = PAYMENT_ICONS[exp.paymentMethod] || Smartphone
                const expenseDate = exp.date || exp.createdAt

                return (
                  <div
                    key={exp._id}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 border"
                        style={{
                          backgroundColor: `${catColor}15`,
                          borderColor: `${catColor}30`,
                        }}
                      >
                        {cat?.icon || "💸"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {exp.title}
                          </span>
                          {cat && (
                            <span
                              className="text-[10px] font-medium px-1.5 py-0.2 rounded-full border"
                              style={{
                                borderColor: `${catColor}30`,
                                backgroundColor: `${catColor}10`,
                                color: catColor,
                              }}
                            >
                              {cat.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          <span>
                            {new Date(expenseDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                            <PaymentIcon className="w-3 h-3 text-slate-400" />
                            {exp.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                        -{formatCurrency(exp.amount, currency)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Category Distribution & Active Groups Preview */}
        <div className="space-y-6">
          {/* Category Distribution */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Spending by Category
              </h3>
              <button
                onClick={() => onNavigate("categories")}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>

            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic py-4 text-center">
                Add expenses to see category breakdown.
              </p>
            ) : (
              <div className="space-y-3">
                {categoryBreakdown.slice(0, 5).map((item) => (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </span>
                      <span className="font-mono text-slate-600 dark:text-slate-400">
                        {formatCurrency(item.total, currency)} ({item.percentage}%)
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Split Groups Preview */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Your Groups
              </h3>
              <button
                onClick={() => onNavigate("groups")}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            {groups.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                No active split groups.
              </p>
            ) : (
              <div className="space-y-2">
                {groups.slice(0, 3).map((g) => (
                  <div
                    key={g._id}
                    onClick={() => {
                      onNavigate("groups")
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 hover:border-emerald-500/40 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {g.name}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {g.members?.length || 0} members
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
