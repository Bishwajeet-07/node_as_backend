import { useState } from "react"
import Modal from "../ui/Modal"
import { groupApi } from "../../services/api"
import { UserPlus, AlertCircle, CheckCircle2 } from "lucide-react"

export default function AddMemberModal({ isOpen, onClose, group, onMemberAdded }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email.trim()) {
      setError("Please provide your friend's registered email address.")
      return
    }

    setLoading(true)
    try {
      const res = await groupApi.addMember(group._id, email.trim())
      if (res && res.success) {
        setSuccess(res.message || "Member added successfully!")
        setEmail("")
        onMemberAdded(res.data)
        setTimeout(() => {
          setSuccess("")
          onClose()
        }, 1200)
      }
    } catch (err) {
      setError(err.message || "Could not add member. Make sure they have registered an account.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Friend to "${group?.name || 'Group'}"`}>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Friend's Registered Email *
          </label>
          <input
            type="email"
            placeholder="e.g. friend@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          The friend must have registered with this email on Kharcha. Once added, any group expense will automatically split with them.
        </p>

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
            <UserPlus className="w-3.5 h-3.5" />
            <span>{loading ? "Adding..." : "Add Member"}</span>
          </button>
        </div>
      </form>
    </Modal>
  )
}
