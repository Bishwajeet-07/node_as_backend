import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./context/AuthContext"
import Auth from "./components/Auth"
import Sidebar from "./components/layout/Sidebar"
import Navbar from "./components/layout/Navbar"
import Dashboard from "./components/dashboard/Dashboard"
import ExpenseList from "./components/expenses/ExpenseList"
import AddExpenseModal from "./components/expenses/AddExpenseModal"
import GroupList from "./components/groups/GroupList"
import GroupDetail from "./components/groups/GroupDetail"
import CreateGroupModal from "./components/groups/CreateGroupModal"
import CategoryManager from "./components/categories/CategoryManager"
import AddCategoryModal from "./components/categories/AddCategoryModal"
import ProfileView from "./components/profile/ProfileView"
import { expenseApi, groupApi, categoryApi } from "./services/api"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function App() {
  const { token, dark } = useAuth()

  // App Navigation
  const [currentTab, setCurrentTab] = useState("dashboard")
  const [selectedGroupId, setSelectedGroupId] = useState(null)

  // Global State
  const [expenses, setExpenses] = useState([])
  const [groups, setGroups] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Quick Action Modals
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false)
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false)
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)

  // Fetch all initial data
  const loadInitialData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError("")

    try {
      const [expRes, grpRes, catRes] = await Promise.allSettled([
        expenseApi.getMyExpenses(),
        groupApi.getMyGroups(),
        categoryApi.getCategories(),
      ])

      if (expRes.status === "fulfilled" && expRes.value?.success) {
        setExpenses(expRes.value.data || [])
      } else if (expRes.status === "rejected") {
        console.warn("Expenses fetch failed:", expRes.reason)
      }

      if (grpRes.status === "fulfilled" && grpRes.value?.success) {
        setGroups(grpRes.value.data || [])
      } else if (grpRes.status === "rejected") {
        console.warn("Groups fetch failed:", grpRes.reason)
      }

      if (catRes.status === "fulfilled" && catRes.value?.success) {
        setCategories(catRes.value.data || [])
      } else if (catRes.status === "rejected") {
        console.warn("Categories fetch failed:", catRes.reason)
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.")
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      loadInitialData()
    }
  }, [token, loadInitialData])

  // Callbacks
  const handleExpenseAdded = (newExpense) => {
    setExpenses((prev) => [newExpense, ...prev])
  }

  const handleGroupCreated = (newGroup) => {
    setGroups((prev) => [newGroup, ...prev])
    setSelectedGroupId(newGroup._id)
    setCurrentTab("group-detail")
  }

  const handleCategoryCreated = (newCat) => {
    setCategories((prev) => [...prev, newCat])
  }

  const handleNavigate = (tab) => {
    setCurrentTab(tab)
    if (tab !== "group-detail") {
      setSelectedGroupId(null)
    }
  }

  const handleSelectGroup = (groupId) => {
    setSelectedGroupId(groupId)
    setCurrentTab("group-detail")
  }

  const handleBackToGroups = () => {
    setSelectedGroupId(null)
    setCurrentTab("groups")
  }

  // Not authenticated -> Show Auth page
  if (!token) {
    return <Auth />
  }

  return (
    <div className={`flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 ${dark ? "dark" : ""}`}>
      {/* Desktop Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onNavigate={handleNavigate}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Mobile Header / Navigation */}
        <Navbar
          currentTab={currentTab}
          onNavigate={handleNavigate}
          onOpenAddExpense={() => setIsAddExpenseModalOpen(true)}
          onOpenCreateGroup={() => setIsCreateGroupModalOpen(true)}
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Global Error Banner */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-3 text-rose-700 dark:text-rose-300 text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={loadInitialData}
                  className="px-2.5 py-1 rounded bg-rose-100 dark:bg-rose-900/60 hover:bg-rose-200 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Dynamic Tab Switch */}
            {currentTab === "dashboard" && (
              <Dashboard
                expenses={expenses}
                groups={groups}
                categories={categories}
                onNavigate={handleNavigate}
                onOpenAddExpense={() => setIsAddExpenseModalOpen(true)}
                onOpenCreateGroup={() => setIsCreateGroupModalOpen(true)}
              />
            )}

            {currentTab === "expenses" && (
              <ExpenseList
                expenses={expenses}
                categories={categories}
                loading={loading}
                onExpenseAdded={handleExpenseAdded}
                onOpenCategoryModal={() => setIsAddCategoryModalOpen(true)}
              />
            )}

            {currentTab === "groups" && (
              <GroupList
                groups={groups}
                loading={loading}
                onSelectGroup={handleSelectGroup}
                onGroupCreated={handleGroupCreated}
              />
            )}

            {currentTab === "group-detail" && selectedGroupId && (
              <GroupDetail
                groupId={selectedGroupId}
                onBack={handleBackToGroups}
                categories={categories}
              />
            )}

            {currentTab === "categories" && (
              <CategoryManager
                categories={categories}
                expenses={expenses}
                loading={loading}
                onCategoryCreated={handleCategoryCreated}
              />
            )}

            {currentTab === "profile" && <ProfileView />}
          </div>
        </main>
      </div>

      {/* Global Quick Action Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        categories={categories}
        onExpenseAdded={handleExpenseAdded}
        onOpenCategoryModal={() => {
          setIsAddExpenseModalOpen(false)
          setIsAddCategoryModalOpen(true)
        }}
      />

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  )
}
