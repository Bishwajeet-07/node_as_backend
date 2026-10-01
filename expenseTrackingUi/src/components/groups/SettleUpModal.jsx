import { useState, useEffect } from "react"
import Modal from "../ui/Modal"
import { groupExpenseApi } from "../../services/api"
import { useAuth, formatCurrency } from "../../context/AuthContext"
import {
  HandCoins,
  AlertCircle,
  CheckCircle2,
  Smartphone,
  Banknote,
  CreditCard,
  Building,
  ArrowRight,
} from "lucide-react"

const PAYMENT_METHODS = [
  { id: "UPI", label: "UPI", icon: Smartphone },
  { id: "Cash", label: "Cash", icon: Banknote },
  { id: "Card", label: "Card", icon: CreditCard },
  { id: "Net Banking", label: "Net Banking", icon: Building },
]

export default function SettleUpModal({
  isOpen,
  onClose,
  group,
  settlementTarget = null, // { receiverId, receiverName, amount }
  membersSummary = [],
  onSettlementRecorded,
}) {
  const { user, currency } = useAuth()

  const [receiverId, setReceiverId] = useState("")
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("UPI")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Eligible receivers (group members except current logged-in user)
  const eligibleReceivers = (group?.members || []).filter(
    (m) => (m._id || m) !== user?._id
  )

  // Populate fields when modal opens or target changes
  useEffect(() => {
    if (isOpen) {
      setError("")
      setSuccess("")
      setNotes("")
      setPaymentMethod("UPI")

      if (settlementTarget?.receiverId) {
        setReceiverId(settlementTarget.receiverId)
        setAmount(
          settlementTarget.amount ? String(settlementTarget.amount) : ""
        )
      } else if (eligibleReceivers.length > 0) {
        setReceiverId(eligibleReceivers[0]._id || eligibleReceivers[0])
        setAmount("")
      }
    }
  }, [isOpen, settlementTarget])

  const selectedReceiver = eligibleReceivers.find(
    (m) => (m._id || m) === receiverId
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const numAmount = Number(amount)
    if (!receiverId) {
      setError("Please choose who you paid.")
      return
    }

    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid payment amount greater than 0.")
      return
    }

    setLoading(true)
    try {
      const payload = {
        receiverId,
        amount: numAmount,
        paymentMethod,
        notes: notes.trim() || `Settled via ${paymentMethod}`,
      }

      const res = await groupExpenseApi.settlePayment(group._id, payload)
      if (res && res.success) {
        setSuccess(
          res.message ||
            `Payment of ${formatCurrency(numAmount, currency)} recorded successfully! 🤝`
        )
        if (onSettlementRecorded) {
          onSettlementRecorded(res.data)
        }
        setTimeout(() => {
          setSuccess("")
          onClose()
        }, 1200)
      }
    } catch (err) {
      setError(err.message || "Failed to record settlement payment.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment / Settle Up"
      maxWidth="max-w-md"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Visual From -> To Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3">
          {/* Payer (You) */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {user?.name || "You"}
              </span>
              <span className="block text-[10px] text-slate-400">Payer (You)</span>
            </div>
          </div>

          <div className="flex items-center justify-center px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 shrink-0">
            <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>

          {/* Receiver */}
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-end text-right">
            <div className="min-w-0">
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {selectedReceiver?.name || "Recipient"}
              </span>
              <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                Recipient
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
              {selectedReceiver?.name
                ? selectedReceiver.name.charAt(0).toUpperCase()
                : "R"}
            </div>
          </div>
        </div>

        {/* Receiver Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Who did you pay? *
          </label>
          <select
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            required
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
          >
            {eligibleReceivers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.email})
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Amount Paid ({currency}) *
            </label>
            {settlementTarget?.amount && (
              <button
                type="button"
                onClick={() => setAmount(String(settlementTarget.amount))}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-medium"
              >
                Exact Pending: {formatCurrency(settlementTarget.amount, currency)}
              </button>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm font-semibold">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
              className="w-full pl-8 pr-4 py-2.5 text-base font-mono font-bold bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
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
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold shadow-2xs"
                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px]">{pm.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Notes (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Paid via Google Pay / UPI ref #1234"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Information box */}
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
          💡 Recording this payment will update both your and the recipient's balances in this group, reducing the remaining debt.
        </p>

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
            <HandCoins className="w-3.5 h-3.5" />
            <span>
              {loading
                ? "Recording..."
                : `Record Payment (${formatCurrency(Number(amount) || 0, currency)})`}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  )
}
