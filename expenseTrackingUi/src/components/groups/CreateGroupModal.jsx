import { useState } from "react"
import Modal from "../ui/Modal"
import { groupApi } from "../../services/api"
import { AlertCircle } from "lucide-react"

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Please specify a group name.")
      return
    }

    setLoading(true)
    try {
      const res = await groupApi.createGroup({
        name: name.trim(),
        description: description.trim(),
      })
      if (res && res.success) {
        onGroupCreated(res.data)
        setName("")
        setDescription("")
        onClose()
      }
    } catch (err) {
      setError(err.message || "Failed to create group.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Split Group">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Group Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Goa Trip 🏖️, Flat 402, Friday Dinners"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Description (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Add context or notes for members..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
          />
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          💡 You will be added automatically as the first member. You can add friends by email right after creating the group.
        </div>

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
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
