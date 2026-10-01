import { useState } from "react"
import Modal from "../ui/Modal"
import { categoryApi } from "../../services/api"
import { AlertCircle } from "lucide-react"

const POPULAR_EMOJIS = [
  "🍕", "🍔", "☕", "🛒", "🚗", "🚕", "✈️", "🏠",
  "💡", "📱", "💻", "🎬", "🎮", "📚", "🏋️", "💊",
  "👗", "🎁", "⚡", "🛠️", "🐾", "🎓", "💸", "💼",
]

const PALETTE = [
  { name: "Emerald", hex: "#10b981" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Rose", hex: "#ef4444" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Purple", hex: "#8b5cf6" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Slate", hex: "#64748b" },
]

export default function AddCategoryModal({ isOpen, onClose, onCategoryCreated }) {
  const [name, setName] = useState("")
  const [icon, setIcon] = useState("🍕")
  const [color, setColor] = useState("#f59e0b")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Please provide a category name.")
      return
    }

    setLoading(true)
    try {
      const res = await categoryApi.createCategory({
        name: name.trim(),
        icon: icon || "🏷️",
        color: color || "#6366f1",
      })
      if (res && res.data) {
        onCategoryCreated(res.data)
        setName("")
        setIcon("🍕")
        setColor("#f59e0b")
        onClose()
      }
    } catch (err) {
      setError(err.message || "Could not create category.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Category">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Live Preview */}
      <div className="mb-5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400">Badge Preview:</span>
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
          style={{
            borderColor: `${color}40`,
            backgroundColor: `${color}15`,
            color: color,
          }}
        >
          <span>{icon}</span>
          <span>{name.trim() || "Category Name"}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Category Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Dining Out, Utilities, Flights"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Emoji Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Icon / Emoji
          </label>
          <div className="grid grid-cols-8 gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-lg max-h-32 overflow-y-auto">
            {POPULAR_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={`w-8 h-8 flex items-center justify-center text-lg rounded-md transition-transform cursor-pointer ${
                  icon === emoji
                    ? "bg-white dark:bg-slate-700 ring-2 ring-emerald-500 scale-110 shadow-xs"
                    : "hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Badge Accent Color
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {PALETTE.map((p) => (
              <button
                key={p.hex}
                type="button"
                onClick={() => setColor(p.hex)}
                style={{ backgroundColor: p.hex }}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center text-white ${
                  color === p.hex ? "ring-2 ring-offset-2 ring-emerald-500 scale-110" : "hover:scale-105"
                }`}
                title={p.name}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-700 cursor-pointer overflow-hidden p-0"
              title="Custom Color"
            />
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
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium text-xs rounded-lg shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Creating..." : "Save Category"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
