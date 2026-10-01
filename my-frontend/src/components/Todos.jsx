import { useState } from "react"
import { useTodos } from "../hooks/useTodos"
import TodoHeader from "./todos/TodoHeader"
import TodoStats from "./todos/TodoStats"
import TodoInput from "./todos/TodoInput"
import TodoFilter from "./todos/TodoFilter"
import TodoList from "./todos/TodoList"
import TodoSidebarFooter from "./todos/TodoSidebarFooter"
import ProfileModal from "./profile/ProfileModal"
import ProfileDrawer from "./profile/ProfileDrawer"
import Toast from "./ui/Toast"
import { AlertCircle } from "lucide-react"

export default function Todos({ token, user, onLogout, dark, toggleTheme, onUpdateProfile }) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const {
    todos,
    allCount,
    activeCount,
    doneCount,
    filter,
    setFilter,
    loading,
    adding,
    error,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
  } = useTodos(token, onLogout)

  const showToast = (msg) => {
    setToastMessage(msg)
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Fixed Top Navbar */}
      <div className="shrink-0">
        <TodoHeader
          user={user}
          onLogout={onLogout}
          dark={dark}
          toggleTheme={toggleTheme}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
        />
      </div>

      {/* Fixed Height Main Dashboard Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-hidden min-h-0">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs sm:text-sm shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0 overflow-hidden">
          {/* Left Panel */}
          <aside className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 overflow-y-auto shrink-0 lg:shrink flex flex-col justify-between custom-scrollbar">
            <div className="space-y-4">
              <TodoStats
                totalCount={allCount}
                activeCount={activeCount}
                doneCount={doneCount}
              />

              <div className="h-[1px] bg-slate-200/80 dark:bg-slate-800/80" />

              <TodoInput onAddTodo={addTodo} adding={adding} />

              <div className="h-[1px] bg-slate-200/80 dark:bg-slate-800/80" />

              <TodoFilter
                filter={filter}
                setFilter={setFilter}
                allCount={allCount}
                activeCount={activeCount}
                doneCount={doneCount}
              />
            </div>

            <TodoSidebarFooter />
          </aside>

          {/* Right Main Task Panel */}
          <section className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-xs h-full flex flex-col min-h-0 overflow-hidden">
            <TodoList
              todos={todos}
              filter={filter}
              loading={loading}
              onToggle={toggleTodo}
              onEdit={editTodo}
              onDelete={deleteTodo}
            />
          </section>
        </div>
      </main>

      {/* Profile Detail View Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onOpenEditDrawer={() => setIsProfileDrawerOpen(true)}
      />

      {/* Edit Profile Sidebar Drawer */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        user={user}
        onUpdateProfile={onUpdateProfile}
        onSuccessToast={showToast}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />
    </div>
  )
}

