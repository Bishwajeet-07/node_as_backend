import { useState, useMemo } from "react"
import { useAuth, formatCurrency } from "../../context/AuthContext"
import AddExpenseModal from "./AddExpenseModal"
import {
  Plus,
  Search,
  Filter,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  Calendar,
  Receipt,
  Tag,
  ArrowDownLeft,
} from "lucide-react"

const PAYMENT_ICONS = {
  UPI: Smartphone,
  Cash: Banknote,
  Card: CreditCard,
  "Net Banking": Building,
}

export default function ExpenseList({
  expenses = [],
  categories = [],
  loading = false,
  onExpenseAdded,
  onOpenCategoryModal,
}) {
  const { currency } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedMethod, setSelectedMethod] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      // Search
      const matchesSearch =
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchTerm.toLowerCase())

      // Category
      const itemCatId = item.category?._id || item.category
      const matchesCat = selectedCategory === "all" || itemCatId === selectedCategory

      // Payment Method
      const matchesMethod = selectedMethod === "all" || item.paymentMethod === selectedMethod

      return matchesSearch && matchesCat && matchesMethod
    })
  }, [expenses, searchTerm, selectedCategory, selectedMethod])

  // Total amount of filtered expenses
  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  }, [filteredExpenses])

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Personal Expenses
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log, categorize, and monitor your personal daily spendings.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 transition-colors"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.icon || "🏷️"} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 transition-colors"
            >
              <option value="all">All Payment Methods</option>
              <option value="UPI">UPI / QR</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Net Banking">Net Banking</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing <strong className="font-semibold text-slate-800 dark:text-slate-200">{filteredExpenses.length}</strong> of {expenses.length} records
          </span>
          <span>
            Total: <strong className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatCurrency(filteredTotal, currency)}</strong>
          </span>
        </div>
      </div>

      {/* Expenses List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse flex items-center justify-between"
            >
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
            </div>
          ))}
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            No expenses found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedCategory !== "all" || selectedMethod !== "all"
              ? "Try resetting your search filters to find what you're looking for."
              : "Start by logging your coffee, groceries, or dinner expenses."}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredExpenses.map((expense) => {
            const cat =
              typeof expense.category === "object" && expense.category !== null
                ? expense.category
                : categories.find((c) => c._id === (expense.category?._id || expense.category))
            const catColor = cat?.color || "#6366f1"
            const PaymentIcon = PAYMENT_ICONS[expense.paymentMethod] || Smartphone
            const expenseDate = expense.date || expense.createdAt

            return (
              <div
                key={expense._id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Left side: Category icon, Title, Notes, Date */}
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border"
                    style={{
                      backgroundColor: `${catColor}15`,
                      borderColor: `${catColor}30`,
                    }}
                  >
                    {cat?.icon || "💸"}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {expense.title}
                      </span>
                      {cat && (
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
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

                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(expenseDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span>&bull;</span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                        <PaymentIcon className="w-3 h-3 text-slate-400" />
                        <span>{expense.paymentMethod || "UPI"}</span>
                      </span>
                      {expense.notes && (
                        <>
                          <span>&bull;</span>
                          <span className="text-[11px] italic truncate max-w-xs text-slate-400 dark:text-slate-500">
                            "{expense.notes}"
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Amount */}
                <div className="text-right sm:self-center self-end">
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100 flex items-center justify-end gap-0.5">
                    <span>-{formatCurrency(expense.amount, currency)}</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        onExpenseAdded={onExpenseAdded}
        onOpenCategoryModal={onOpenCategoryModal}
      />
    </div>
  )
}
