import { useState } from "react"
import { Tag, Plus, Check } from "lucide-react"
import AddCategoryModal from "./AddCategoryModal"

export default function CategoryManager({ categories = [], expenses = [], loading = false, onCategoryCreated }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Calculate expense count per category
  const expenseCountMap = {}
  expenses.forEach((e) => {
    const catId = e.category?._id || e.category
    if (catId) {
      expenseCountMap[catId] = (expenseCountMap[catId] || 0) + 1
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Expense Categories
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize personal and split spendings with custom tags, icons, and colors.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse space-y-2"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Tag className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            No categories available yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Create categories like Food, Travel, Rent, and Entertainment to organize your ledger.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {categories.map((cat) => {
            const count = expenseCountMap[cat._id] || 0
            const color = cat.color || "#6366f1"

            return (
              <div
                key={cat._id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border shadow-xs"
                    style={{
                      backgroundColor: `${color}15`,
                      borderColor: `${color}35`,
                    }}
                  >
                    {cat.icon || "🏷️"}
                  </div>

                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-800 shadow-xs"
                    style={{ backgroundColor: color }}
                    title={`Color: ${color}`}
                  />
                </div>

                <div className="mt-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                    {count} expense{count !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AddCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCategoryCreated={onCategoryCreated}
      />
    </div>
  )
}
