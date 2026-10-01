import { useState } from "react"
import Modal from "../ui/Modal"
import { expenseApi } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import { CreditCard, Banknote, Smartphone, Building, AlertCircle } from "lucide-react"

const PAYMENT_METHODS = [
  { id: "UPI", label: "UPI / QR", icon: Smartphone },
  { id: "Cash", label: "Cash", icon: Banknote },
  { id: "Card", label: "Card", icon: CreditCard },
  { id: "Net Banking", label: "Net Banking", icon: Building },
]

export default function AddExpenseModal({ isOpen, onClose, categories = [], onExpenseAdded, onOpenCategoryModal }) {
  const { currencySymbol } = useAuth()
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("UPI")
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    const numAmount = parseFloat(amount)
    if (!title.trim()) {
      setError("Please provide an expense title.")
      return
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0.")
      return
    }
    if (!category) {
      setError("Please choose a category.")
      return
    }

    setLoading(true)
    try {
      const res = await expenseApi.createExpense({
        title: title.trim(),
        amount: numAmount,
        category,
        paymentMethod,
        date: date || new Date().toISOString(),
        notes: notes.trim(),
      })
      if (res && res.success) {
        onExpenseAdded(res.data)
        // Reset form
        setTitle("")
        setAmount("")
        setNotes("")
        setDate(new Date().toISOString().split("T")[0])
        onClose()
      }
    } catch (err) {
      setError(err.message || "Failed to record expense. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Personal Expense">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Expense Title *
          </label>
          <input
            type="text"
            placeholder="e.g. Grocery store, Uber ride, Dinner"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Amount & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Amount ({currencySymbol}) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-8 pr-3.5 py-2 text-sm font-mono font-medium bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Category *
            </label>
            <button
              type="button"
              onClick={onOpenCategoryModal}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              + New Category
            </button>
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.icon || "🏷️"} {cat.name}
              </option>
            ))}
          </select>
          {categories.length === 0 && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
              No categories found. Click "+ New Category" to create one.
            </p>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Payment Method
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PAYMENT_METHODS.map((pm) => {
              const Icon = pm.icon
              const isSelected = paymentMethod === pm.id
              return (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{pm.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Notes / Remarks (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Add context or notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium text-xs rounded-lg shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Recording..." : "Record Expense"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
