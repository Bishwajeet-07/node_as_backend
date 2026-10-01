import { useState } from "react"
import Modal from "../ui/Modal"
import { friendApi } from "../../services/api"
import { UserPlus, AlertCircle, CheckCircle2 } from "lucide-react"

export default function AddFriendModal({ isOpen, onClose, onFriendAdded }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const cleanEmail = email.trim()
    if (!cleanEmail) {
      setError("Please enter your friend's registered email address.")
      return
    }

    setLoading(true)
    try {
      const res = await friendApi.addFriend(cleanEmail)
      if (res && res.success) {
        setSuccess(res.message || "Friend added successfully! 🤝")
        if (onFriendAdded) {
          onFriendAdded(res.data)
        }
        setEmail("")
        setTimeout(() => {
          setSuccess("")
          onClose()
        }, 1200)
      }
    } catch (err) {
      setError(
        err.message ||
          "Could not add friend. Make sure they have already registered an account with this email."
      )
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError("")
    setSuccess("")
    setEmail("")
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Friend">
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
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Friend's Email Address *
          </label>
          <input
            type="email"
            placeholder="e.g. rahul@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          🤝 <strong>Mutual Friendship:</strong> Once added, you both will appear in each other's friends list and can be included in split groups with a single click.
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{loading ? "Adding..." : "Add to Friends"}</span>
          </button>
        </div>
      </form>
    </Modal>
  )
}
