import { useState, useMemo } from "react"
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Copy,
  Check,
  ShieldCheck,
  Coins,
  ArrowRight,
  FolderHeart,
  UserCheck,
} from "lucide-react"
import AddFriendModal from "./AddFriendModal"

export default function FriendList({
  friends = [],
  groups = [],
  loading = false,
  onFriendAdded,
  onOpenCreateGroup,
  onNavigate,
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedId, setCopiedId] = useState(null)

  // Copy email to clipboard
  const copyEmail = (friendId, email) => {
    navigator.clipboard.writeText(email)
    setCopiedId(friendId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filtered friends
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends
    const q = searchQuery.toLowerCase().trim()
    return friends.filter(
      (f) =>
        f.name?.toLowerCase().includes(q) ||
        f.email?.toLowerCase().includes(q)
    )
  }, [friends, searchQuery])

  // Calculate shared groups count for each friend
  const getSharedGroupsForFriend = (friendId) => {
    return groups.filter((g) =>
      (g.members || []).some((m) => {
        const mId = typeof m === "object" ? m?._id : m
        return mId === friendId
      })
    )
  }

  // Quick stats
  const friendsInGroupsCount = useMemo(() => {
    return friends.filter((f) => getSharedGroupsForFriend(f._id).length > 0).length
  }, [friends, groups])

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Friends</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {friends.length}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Add your friends by email to split dinner bills, shared flats, and trip expenses with one click.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Friend</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Total Friends
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {friends.length}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Saved connections
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            In Active Groups
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {friendsInGroupsCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              sharing split bills
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Total Split Groups
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {groups.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              available to join
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {friends.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search friends by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Friends Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : friends.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            No friends added yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Add friends using their registered email. Once added, you won't need to type their email again when creating split groups or sharing bills!
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Your First Friend</span>
          </button>
        </div>
      ) : filteredFriends.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No friends match "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Show all friends
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredFriends.map((friend) => {
            const sharedGroups = getSharedGroupsForFriend(friend._id)
            const isCopied = copiedId === friend._id

            return (
              <div
                key={friend._id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top user row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-200 shrink-0">
                        {friend.name ? friend.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {friend.name || "Friend"}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span className="truncate max-w-[140px] sm:max-w-[170px]" title={friend.email}>
                            {friend.email}
                          </span>
                          <button
                            onClick={() => copyEmail(friend._id, friend.email)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 transition-colors cursor-pointer"
                            title="Copy Email"
                          >
                            {isCopied ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {friend.defaultCurrency && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                        {friend.defaultCurrency}
                      </span>
                    )}
                  </div>

                  {/* Shared Groups Information */}
                  <div className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs mb-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <FolderHeart className="w-3 h-3 text-slate-400" />
                        <span>Shared Groups</span>
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {sharedGroups.length > 0 ? (
                          `${sharedGroups.length} group${sharedGroups.length !== 1 ? "s" : ""}`
                        ) : (
                          <span className="text-slate-400 italic">None yet</span>
                        )}
                      </span>
                    </div>

                    {sharedGroups.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {sharedGroups.slice(0, 2).map((g) => (
                          <span
                            key={g._id}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium truncate max-w-[120px]"
                          >
                            {g.name}
                          </span>
                        ))}
                        {sharedGroups.length > 2 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md text-slate-400 font-medium">
                            +{sharedGroups.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Connected Friend</span>
                  </span>

                  {onOpenCreateGroup && (
                    <button
                      onClick={onOpenCreateGroup}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      <span>New Group</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Friend Modal */}
      <AddFriendModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onFriendAdded={onFriendAdded}
      />
    </div>
  )
}
