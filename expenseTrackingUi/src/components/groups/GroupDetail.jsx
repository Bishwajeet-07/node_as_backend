import { useState, useEffect, useMemo } from "react"
import { groupExpenseApi, groupApi } from "../../services/api"
import { useAuth, formatCurrency } from "../../context/AuthContext"
import AddGroupExpenseModal from "./AddGroupExpenseModal"
import AddMemberModal from "./AddMemberModal"
import {
  ArrowLeft,
  Plus,
  UserPlus,
  Users,
  Receipt,
  Scale,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Crown,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react"

export default function GroupDetail({ groupId, onBack, categories = [] }) {
  const { user, currency } = useAuth()
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("expenses") // 'expenses' | 'balances' | 'members'

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)

  // Fetch Group and its Expenses
  const loadGroupData = async () => {
    setLoading(true)
    setError("")
    try {
      const [groupRes, expRes] = await Promise.all([
        groupApi.getGroupById(groupId),
        groupExpenseApi.getGroupExpenses(groupId),
      ])

      if (groupRes && groupRes.success) {
        setGroup(groupRes.data)
      }
      if (expRes && expRes.success) {
        setExpenses(expRes.data || [])
      }
    } catch (err) {
      setError(err.message || "Failed to load group details.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (groupId) {
      loadGroupData()
    }
  }, [groupId])

  const handleExpenseAdded = (newExpense) => {
    setExpenses((prev) => [newExpense, ...prev])
  }

  const handleMemberAdded = (updatedGroup) => {
    setGroup(updatedGroup)
  }

  // Calculate Net Balances for each member
  const balances = useMemo(() => {
    if (!group || !group.members) return []

    const memberMap = {}
    group.members.forEach((m) => {
      memberMap[m._id] = {
        user: m,
        paid: 0,
        share: 0,
        net: 0,
      }
    })

    expenses.forEach((exp) => {
      const payerId = exp.paidBy?._id || exp.paidBy
      if (memberMap[payerId]) {
        memberMap[payerId].paid += Number(exp.amount) || 0
      }

      if (Array.isArray(exp.splits)) {
        exp.splits.forEach((s) => {
          const splitUserId = s.user?._id || s.user
          if (memberMap[splitUserId]) {
            memberMap[splitUserId].share += Number(s.amount) || 0
          }
        })
      }
    })

    return Object.values(memberMap).map((m) => ({
      ...m,
      net: Math.round((m.paid - m.share) * 100) / 100,
    }))
  }, [group, expenses])

  // Total Group Spending
  const totalGroupSpend = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  }, [expenses])

  // Current User's Net in this group
  const currentUserNet = useMemo(() => {
    const myBal = balances.find((b) => b.user?._id === user?._id)
    return myBal ? myBal.net : 0
  }, [balances, user])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs">Loading group bills & splits...</p>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Groups</span>
        </button>
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error || "Group could not be found."}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Groups</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMemberModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Friend</span>
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-medium shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Split Bill</span>
          </button>
        </div>
      </div>

      {/* Group Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {group.name}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700">
                <Users className="w-3 h-3" />
                <span>{group.members?.length || 0} members</span>
              </span>
            </div>
            {group.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                {group.description}
              </p>
            )}
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
              Created by <span className="font-medium text-slate-600 dark:text-slate-300">{group.createdBy?.name || "Admin"}</span>
            </p>
          </div>

          {/* Quick Balance Stat Card */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Total Expenses
              </span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                {formatCurrency(totalGroupSpend, currency)}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Your Status
              </span>
              {currentUserNet > 0 ? (
                <span className="text-xs font-semibold font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                  You are owed {formatCurrency(currentUserNet, currency)}
                </span>
              ) : currentUserNet < 0 ? (
                <span className="text-xs font-semibold font-mono text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                  <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
                  You owe {formatCurrency(Math.abs(currentUserNet), currency)}
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  All Settled
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={() => setActiveTab("expenses")}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "expenses"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Group Expenses ({expenses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("balances")}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "balances"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Balances & Debt Summary</span>
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "members"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Members ({group.members?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Group Expenses */}
      {activeTab === "expenses" && (
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <Receipt className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No group expenses yet
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Add your dinner, travel, or grocery bills here and they will be split equally among all members.
              </p>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-medium rounded-lg shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record First Group Bill</span>
              </button>
            </div>
          ) : (
            expenses.map((exp) => {
              const payerName = exp.paidBy?.name || "Member"
              const isPayerMe = (exp.paidBy?._id || exp.paidBy) === user?._id
              const mySplit = exp.splits?.find((s) => (s.user?._id || s.user) === user?._id)

              return (
                <div
                  key={exp._id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {exp.title}
                        </span>
                        {exp.category && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
                            {exp.category.icon || "🏷️"} {exp.category.name || "Category"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>
                          Paid by <strong className="font-semibold text-slate-700 dark:text-slate-200">{isPayerMe ? "You" : payerName}</strong>
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3" />
                          {new Date(exp.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="block text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                        {formatCurrency(exp.amount, currency)}
                      </span>
                      {mySplit && (
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          Your share: {formatCurrency(mySplit.amount, currency)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Equal Split Chips */}
                  {Array.isArray(exp.splits) && exp.splits.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 mr-1">Split:</span>
                      {exp.splits.map((s, idx) => {
                        const splitName = s.user?.name || `Member ${idx + 1}`
                        const isMe = (s.user?._id || s.user) === user?._id
                        return (
                          <span
                            key={idx}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono border ${
                              isMe
                                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-medium"
                                : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <span>{isMe ? "You" : splitName}:</span>
                            <span className="font-semibold">{formatCurrency(s.amount, currency)}</span>
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Tab 2: Balances & Who Owes Whom */}
      {activeTab === "balances" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {balances.map((b) => {
              const isMe = b.user?._id === user?._id
              return (
                <div
                  key={b.user?._id}
                  className={`p-4 rounded-xl border transition-all ${
                    isMe
                      ? "bg-slate-50/80 dark:bg-slate-800/70 border-emerald-500/40 shadow-xs"
                      : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span>{b.user?.name || "Member"}</span>
                      {isMe && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded font-medium">
                          You
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                      {b.user?.email}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Total Paid:</span>
                      <span className="font-mono">{formatCurrency(b.paid, currency)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Equal Share:</span>
                      <span className="font-mono">{formatCurrency(b.share, currency)}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400">Net Position:</span>
                    {b.net > 0 ? (
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(b.net, currency)} (Gets back)
                      </span>
                    ) : b.net < 0 ? (
                      <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                        -{formatCurrency(Math.abs(b.net), currency)} (Owes)
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500">
                        Settled (₹0)
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Clean Settlement Guidance */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>How Settlement Works</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              When a member pays for a bill, everyone in the group is assigned an equal share. Members with a negative net position owe money into the pool, while members with a positive net position get money back. Once they transfer or settle up in person or via UPI, everyone's account balances out.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Group Members */}
      {activeTab === "members" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {group.members?.length || 0} active members in this group
            </span>
            <button
              onClick={() => setIsMemberModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.members?.map((m) => {
              const isCreator = group.createdBy?._id === m._id || group.createdBy === m._id
              const isMe = m._id === user?._id
              return (
                <div
                  key={m._id}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-xs"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                    {m.name ? m.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {m.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                          You
                        </span>
                      )}
                      {isCreator && (
                        <span className="text-[10px] inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-medium">
                          <Crown className="w-2.5 h-2.5" />
                          <span>Admin</span>
                        </span>
                      )}
                    </div>
                    <span className="block text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      {m.email}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddGroupExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        group={group}
        categories={categories}
        onExpenseAdded={handleExpenseAdded}
      />

      <AddMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        group={group}
        onMemberAdded={handleMemberAdded}
      />
    </div>
  )
}
