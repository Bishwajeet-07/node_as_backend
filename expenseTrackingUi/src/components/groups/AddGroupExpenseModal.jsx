import { useState } from "react"
import Modal from "../ui/Modal"
import { groupExpenseApi } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import { Users, AlertCircle, Sparkles } from "lucide-react"

export default function AddGroupExpenseModal({ isOpen, onClose, group, categories = [], onExpenseAdded }) {
  const { user, currencySymbol } = useAuth()
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const membersCount = group?.members?.length || 1
  const numAmount = parseFloat(amount) || 0
  const perPersonShare = membersCount > 0 ? (numAmount / membersCount).toFixed(2) : "0.00"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Please provide an expense title.")
      return
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0.")
      return
    }

    setLoading(true)
    try {
      const payload = {
        title: title.trim(),
        amount: numAmount,
        groupId: group._id,
        ...(categoryId ? { categoryId } : {}),
      }

      const res = await groupExpenseApi.addGroupExpense(payload)
      if (res && res.success) {
        onExpenseAdded(res.data)
        setTitle("")
        setAmount("")
        setCategoryId("")
        onClose()
      }
    } catch (err) {
      setError(err.message || "Failed to split group expense.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Split Bill in "${group?.name || 'Group'}"`}>
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
            What was this for? *
          </label>
          <input
            type="text"
            placeholder="e.g. Dinner at BBQ Nation, Groceries, Airbnb booking"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Total Amount */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Total Amount Paid ({currencySymbol}) *
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

        {/* Optional Category */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Category (Optional)
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          >
            <option value="">No specific category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.icon || "🏷️"} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Live Equal Split Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Equal Split Among {membersCount} Member{membersCount > 1 ? "s" : ""}</span>
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              {currencySymbol}{perPersonShare} / person
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            You (<span className="font-medium text-slate-700 dark:text-slate-200">{user?.name || "You"}</span>) are paying the full{" "}
            <span className="font-mono font-medium text-slate-800 dark:text-slate-100">{currencySymbol}{numAmount || "0"}</span>.
            {membersCount > 1 ? (
              <span> Each other member will owe you <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{currencySymbol}{perPersonShare}</span>.</span>
            ) : (
              <span> Add more friends to this group to split bills together!</span>
            )}
          </div>
        </div>

        {/* Actions */}
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
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? "Splitting..." : "Add & Split Bill"}</span>
          </button>
        </div>
      </form>
    </Modal>
  )
}
