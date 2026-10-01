import { useState, useEffect, useMemo } from "react"
import { groupExpenseApi, groupApi } from "../../services/api"
import { useAuth, formatCurrency } from "../../context/AuthContext"
import AddGroupExpenseModal from "./AddGroupExpenseModal"
import AddMemberModal from "./AddMemberModal"
import SettleUpModal from "./SettleUpModal"
import Modal from "../ui/Modal"
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
  ArrowRight,
  RefreshCw,
  Trash2,
  UserMinus,
  LogOut,
  HandCoins,
  History,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Banknote,
  CreditCard,
  Building,
} from "lucide-react"

const SETTLEMENT_PAYMENT_ICONS = {
  UPI: Smartphone,
  Cash: Banknote,
  Card: CreditCard,
  "Net Banking": Building,
}

export default function GroupDetail({
  groupId,
  onBack,
  onGroupDeleted,
  categories = [],
  friends = [],
  onFriendAdded,
}) {
  const { user, currency } = useAuth()
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [balancesData, setBalancesData] = useState(null)
  const [settlementHistory, setSettlementHistory] = useState([])
  const [totalSettledAmount, setTotalSettledAmount] = useState(0)
  const [visibleSettlementsCount, setVisibleSettlementsCount] = useState(10)
  const [refreshingBalances, setRefreshingBalances] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("expenses") // 'expenses' | 'balances' | 'members'

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false)
  const [settleTarget, setSettleTarget] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [memberToRemove, setMemberToRemove] = useState(null)
  const [isRemovingMember, setIsRemovingMember] = useState(false)
  const [removeMemberError, setRemoveMemberError] = useState("")

  // Fetch Group, its Expenses, Balances, and Settlements History
  const loadGroupData = async () => {
    setLoading(true)
    setError("")
    try {
      const [groupRes, expRes, balRes, stlRes] = await Promise.all([
        groupApi.getGroupById(groupId),
        groupExpenseApi.getGroupExpenses(groupId),
        groupExpenseApi.getGroupBalances(groupId),
        groupExpenseApi.getGroupSettlements(groupId),
      ])

      if (groupRes && groupRes.success) {
        setGroup(groupRes.data)
      }
      if (expRes && expRes.success) {
        setExpenses(expRes.data || [])
      }
      if (balRes && balRes.success) {
        setBalancesData(balRes.data)
      }
      if (stlRes && stlRes.success) {
        setSettlementHistory(stlRes.data || [])
        setTotalSettledAmount(stlRes.totalSettledAmount || 0)
      }
    } catch (err) {
      setError(err.message || "Failed to load group details.")
    } finally {
      setLoading(false)
    }
  }

  // Refresh balances & settlements history
  const refreshBalances = async () => {
    setRefreshingBalances(true)
    try {
      const [balRes, stlRes] = await Promise.all([
        groupExpenseApi.getGroupBalances(groupId),
        groupExpenseApi.getGroupSettlements(groupId),
      ])
      if (balRes && balRes.success) {
        setBalancesData(balRes.data)
      }
      if (stlRes && stlRes.success) {
        setSettlementHistory(stlRes.data || [])
        setTotalSettledAmount(stlRes.totalSettledAmount || 0)
      }
    } catch (err) {
      console.warn("Could not refresh balances:", err)
    } finally {
      setRefreshingBalances(false)
    }
  }

  useEffect(() => {
    if (groupId) {
      loadGroupData()
    }
  }, [groupId])

  const handleExpenseAdded = (newExpense) => {
    setExpenses((prev) => [newExpense, ...prev])
    refreshBalances()
  }

  const handleMemberAdded = (updatedGroup) => {
    setGroup(updatedGroup)
    refreshBalances()
  }

  const handleOpenSettleModal = (target = null) => {
    setSettleTarget(target)
    setIsSettleModalOpen(true)
  }

  const handleSettlementRecorded = () => {
    refreshBalances()
    loadGroupData()
  }

  const creatorId = group?.createdBy?._id || group?.createdBy
  const isAdmin = Boolean(creatorId && user?._id && creatorId.toString() === user._id.toString())

  const handleDeleteGroup = async () => {
    setIsDeleting(true)
    setDeleteError("")
    try {
      const res = await groupApi.deleteGroup(group._id)
      if (res && res.success) {
        setIsDeleteModalOpen(false)
        if (onGroupDeleted) {
          onGroupDeleted(group._id)
        } else {
          onBack()
        }
      }
    } catch (err) {
      setDeleteError(err.message || "Failed to delete group.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRemoveMember = async () => {
    if (!memberToRemove) return
    setIsRemovingMember(true)
    setRemoveMemberError("")
    const isSelf = memberToRemove._id === user?._id
    try {
      const res = await groupApi.removeMember(group._id, memberToRemove._id)
      if (res && res.success) {
        setMemberToRemove(null)
        if (isSelf) {
          if (onGroupDeleted) {
            onGroupDeleted(group._id)
          } else {
            onBack()
          }
        } else {
          setGroup(res.data)
        }
      }
    } catch (err) {
      setRemoveMemberError(err.message || "Failed to remove member.")
    } finally {
      setIsRemovingMember(false)
    }
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
    if (balancesData?.membersSummary && user?._id) {
      const mySummary = balancesData.membersSummary.find(
        (m) => m._id?.toString() === user._id.toString() || m.email === user.email
      )
      if (mySummary !== undefined && mySummary !== null) {
        return mySummary.netBalance
      }
    }
    const myBal = balances.find((b) => b.user?._id === user?._id)
    return myBal ? myBal.net : 0
  }, [balancesData, balances, user])

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
          {isAdmin && (
            <button
              onClick={() => {
                setDeleteError("")
                setIsDeleteModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium transition-colors cursor-pointer"
              title="Delete this group and all its expenses"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete Group</span>
            </button>
          )}
          <button
            onClick={() => setIsMemberModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Friend</span>
          </button>
          <button
            onClick={() => handleOpenSettleModal()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <HandCoins className="w-3.5 h-3.5" />
            <span>Settle Up</span>
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
            <span className="flex items-center gap-1">
              <span>Balances & Settlements</span>
              {balancesData?.settlements?.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                  {balancesData.settlements.length}
                </span>
              )}
            </span>
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
        <div className="space-y-6">
          {/* Header with refresh button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Who Owes Whom</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {balancesData?.settlements
                    ? `${balancesData.settlements.length} settlement${balancesData.settlements.length !== 1 ? "s" : ""}`
                    : "Live Calculation"}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Optimized payment plan to settle all group debts with the fewest possible transactions.
              </p>
            </div>

            <button
              onClick={refreshBalances}
              disabled={refreshingBalances}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer disabled:opacity-50 self-start sm:self-auto shrink-0"
              title="Refresh Balances"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingBalances ? "animate-spin" : ""}`} />
              <span>{refreshingBalances ? "Updating..." : "Refresh Balances"}</span>
            </button>
          </div>

          {/* Section 1: Simplified Settlements List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Pending Settlements</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Direct member-to-member transfers
              </span>
            </div>

            {balancesData?.settlements && balancesData.settlements.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  All Debts Settled! 🎉
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Nobody in this group owes any money right now. All expenses are balanced equally.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {(balancesData?.settlements || []).map((st, idx) => {
                  const fromId = st.from?._id || st.from
                  const toId = st.to?._id || st.to
                  const isFromMe = fromId === user?._id || st.from?.email === user?.email
                  const isToMe = toId === user?._id || st.to?.email === user?.email

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        isFromMe
                          ? "bg-rose-50/50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60 shadow-2xs"
                          : isToMe
                          ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-900/60 shadow-2xs"
                          : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Payer (From) */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0">
                            {st.from?.name ? st.from.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div className="min-w-0">
                            <span className="block text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {st.from?.name || "Member"}
                              {isFromMe && (
                                <span className="ml-1 text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                                  (You)
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              owes
                            </span>
                          </div>
                        </div>

                        {/* Amount & Direction Badge */}
                        <div className="flex flex-col items-center justify-center shrink-0 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-slate-100">
                            {formatCurrency(st.amount, currency)}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                            <span>pays</span>
                            <ArrowRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        </div>

                        {/* Receiver (To) */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-end text-right">
                          <div className="min-w-0">
                            <span className="block text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {st.to?.name || "Member"}
                              {isToMe && (
                                <span className="ml-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                  (You)
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block truncate">
                              receives
                            </span>
                          </div>
                          <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold text-xs text-emerald-700 dark:text-emerald-300 shrink-0">
                            {st.to?.name ? st.to.name.charAt(0).toUpperCase() : "U"}
                          </div>
                        </div>
                      </div>

                      {/* Personal Context Banner */}
                      {isFromMe && (
                        <div className="mt-3 pt-2.5 border-t border-rose-200/80 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-rose-700 dark:text-rose-300">
                          <span>
                            You need to pay <strong>{formatCurrency(st.amount, currency)}</strong> to {st.to?.name}.
                          </span>
                          <button
                            onClick={() =>
                              handleOpenSettleModal({
                                receiverId: toId,
                                receiverName: st.to?.name,
                                amount: st.amount,
                              })
                            }
                            className="inline-flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold text-xs rounded-lg shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
                          >
                            <HandCoins className="w-3.5 h-3.5" />
                            <span>Settle ₹{st.amount}</span>
                          </button>
                        </div>
                      )}
                      {isToMe && (
                        <div className="mt-3 pt-2.5 border-t border-emerald-200/80 dark:border-emerald-900/40 flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300">
                          <span>
                            {st.from?.name} will transfer <strong>{formatCurrency(st.amount, currency)}</strong> to you.
                          </span>
                          <span className="font-semibold text-[10px] uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded">
                            Receivable
                          </span>
                        </div>
                      )}
                      {!isFromMe && !isToMe && (
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                          <button
                            onClick={() =>
                              handleOpenSettleModal({
                                receiverId: toId,
                                receiverName: st.to?.name,
                                amount: st.amount,
                              })
                            }
                            className="text-[11px] text-slate-500 hover:text-emerald-600 dark:text-slate-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <HandCoins className="w-3 h-3" />
                            <span>Record Payment</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Section 2: Members Breakdown */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Member Balances Breakdown
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(balancesData?.membersSummary ||
                balances.map((b) => ({
                  _id: b.user?._id,
                  name: b.user?.name,
                  email: b.user?.email,
                  avatar: b.user?.avatar,
                  totalPaid: b.paid,
                  totalShare: b.share,
                  netBalance: b.net,
                }))
              ).map((m) => {
                const isMe = m._id === user?._id || m.email === user?.email
                return (
                  <div
                    key={m._id || m.email}
                    className={`p-4 rounded-xl border transition-all ${
                      isMe
                        ? "bg-slate-50/90 dark:bg-slate-800/70 border-emerald-500/40 shadow-2xs"
                        : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 min-w-0">
                        <span className="truncate">{m.name || "Member"}</span>
                        {isMe && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded font-medium shrink-0">
                            You
                          </span>
                        )}
                      </span>
                      <span
                        className="text-[11px] text-slate-400 truncate max-w-[110px]"
                        title={m.email}
                      >
                        {m.email}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Total Paid:</span>
                        <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                          {formatCurrency(m.totalPaid, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Equal Share:</span>
                        <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                          {formatCurrency(m.totalShare, currency)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-400">Net Standing:</span>
                      {m.netBalance > 0.01 ? (
                        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>+{formatCurrency(m.netBalance, currency)} (Gets back)</span>
                        </span>
                      ) : m.netBalance < -0.01 ? (
                        <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          <span>-{formatCurrency(Math.abs(m.netBalance), currency)} (Owes)</span>
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Settled (₹0)</span>
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section 3: Settlement History & Payment Logs */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Settlement History & Payment Logs</span>
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Recorded debt payments between group members
                </span>
              </div>

              {settlementHistory.length > 0 && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    Total Settled: {formatCurrency(totalSettledAmount, currency)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({settlementHistory.length} transaction{settlementHistory.length !== 1 ? "s" : ""})
                  </span>
                </div>
              )}
            </div>

            {settlementHistory.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-2">
                  <History className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No payment logs yet
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  When members settle their debts using the "Settle Up" button, recorded payment receipts will appear here chronologically.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 shadow-2xs overflow-hidden">
                  {settlementHistory.slice(0, visibleSettlementsCount).map((item) => {
                    const isPayerMe =
                      (item.payer?._id || item.payer) === user?._id ||
                      item.payer?.email === user?.email
                    const isReceiverMe =
                      (item.receiver?._id || item.receiver) === user?._id ||
                      item.receiver?.email === user?.email

                    const MethodIcon =
                      SETTLEMENT_PAYMENT_ICONS[item.paymentMethod] || Smartphone

                    const formattedDate = item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""

                    return (
                      <div
                        key={item._id}
                        className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                            <MethodIcon className="w-4 h-4" />
                          </div>

                          <div className="min-w-0">
                            <div className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                              <span className="font-bold text-slate-900 dark:text-slate-100">
                                {item.payer?.name || "Member"}
                                {isPayerMe && (
                                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold ml-1">
                                    (You)
                                  </span>
                                )}
                              </span>{" "}
                              <span className="text-slate-500 dark:text-slate-400">paid</span>{" "}
                              <span className="font-bold text-slate-900 dark:text-slate-100">
                                {item.receiver?.name || "Member"}
                                {isReceiverMe && (
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold ml-1">
                                    (You)
                                  </span>
                                )}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                              {formattedDate && (
                                <span className="flex items-center gap-1">
                                  <span>{formattedDate}</span>
                                </span>
                              )}
                              {item.notes && (
                                <>
                                  <span>&bull;</span>
                                  <span className="italic truncate max-w-[180px] sm:max-w-xs text-slate-500 dark:text-slate-400">
                                    "{item.notes}"
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0">
                          <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(item.amount, currency)}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 mt-0.5">
                            {item.paymentMethod || "UPI"}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* View More / Show Less Pagination Control */}
                {settlementHistory.length > 10 && (
                  <div className="pt-1">
                    {visibleSettlementsCount < settlementHistory.length ? (
                      <button
                        onClick={() => setVisibleSettlementsCount(settlementHistory.length)}
                        className="w-full py-2.5 px-4 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/70 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <span>
                          View More ({settlementHistory.length - visibleSettlementsCount} more payments)
                        </span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setVisibleSettlementsCount(10)}
                        className="w-full py-2 px-4 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Show Less (Show recent 10)</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Clean Settlement Guidance */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>How Simplified Settlements Work</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Instead of everyone paying everyone back-and-forth for individual bills, the Splitwise algorithm cancels out cross-debts and produces the minimum number of total payments needed. When the people above pay their indicated amounts, everyone's account in <strong>{group.name}</strong> is completely settled.
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
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0">
                      {m.name ? m.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="min-w-0">
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

                  {/* Member Actions */}
                  <div className="shrink-0 flex items-center gap-1">
                    {isAdmin && !isCreator && (
                      <button
                        onClick={() => {
                          setRemoveMemberError("")
                          setMemberToRemove(m)
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title={`Remove ${m.name} from group`}
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                    {!isAdmin && isMe && (
                      <button
                        onClick={() => {
                          setRemoveMemberError("")
                          setMemberToRemove(m)
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                        title="Leave this group"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Leave</span>
                      </button>
                    )}
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
        friends={friends}
        onFriendAdded={onFriendAdded}
      />

      <SettleUpModal
        isOpen={isSettleModalOpen}
        onClose={() => {
          setIsSettleModalOpen(false)
          setSettleTarget(null)
        }}
        group={group}
        settlementTarget={settleTarget}
        membersSummary={balancesData?.membersSummary || []}
        onSettlementRecorded={handleSettlementRecorded}
      />

      {/* Delete Group Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeleteError("")
        }}
        title="Delete Group"
      >
        <div className="space-y-4">
          {deleteError && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{deleteError}</span>
            </div>
          )}

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Are you sure you want to delete <strong className="font-semibold text-slate-900 dark:text-slate-100">{group.name}</strong>?
          </p>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
            ⚠️ <strong>Cascade Delete:</strong> This group and all of its recorded split expenses will be deleted permanently from the database.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteGroup}
              disabled={isDeleting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-medium text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? "Deleting..." : "Yes, Delete Group"}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Remove Member / Leave Group Modal */}
      <Modal
        isOpen={Boolean(memberToRemove)}
        onClose={() => {
          setMemberToRemove(null)
          setRemoveMemberError("")
        }}
        title={memberToRemove?._id === user?._id ? "Leave Group" : `Remove ${memberToRemove?.name || "Member"}`}
      >
        <div className="space-y-4">
          {removeMemberError && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{removeMemberError}</span>
            </div>
          )}

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {memberToRemove?._id === user?._id ? (
              <>
                Are you sure you want to leave <strong className="font-semibold text-slate-900 dark:text-slate-100">{group.name}</strong>? You will no longer see this group or participate in its bill splits.
              </>
            ) : (
              <>
                Are you sure you want to remove <strong className="font-semibold text-slate-900 dark:text-slate-100">{memberToRemove?.name}</strong> from this group? They will be removed from future equal bill splits.
              </>
            )}
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setMemberToRemove(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRemoveMember}
              disabled={isRemovingMember}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-medium text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <UserMinus className="w-3.5 h-3.5" />
              <span>
                {isRemovingMember
                  ? "Processing..."
                  : memberToRemove?._id === user?._id
                  ? "Yes, Leave Group"
                  : "Yes, Remove Member"}
              </span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
