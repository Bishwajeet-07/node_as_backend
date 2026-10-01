import { useState, useMemo } from "react"
import Modal from "../ui/Modal"
import { groupApi, friendApi } from "../../services/api"
import {
  Users,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Check,
  Search,
  Plus,
} from "lucide-react"

export default function CreateGroupModal({
  isOpen,
  onClose,
  onGroupCreated,
  friends = [],
  onFriendAdded,
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedMemberIds, setSelectedMemberIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Inline "Add New Friend" state
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [newFriendEmail, setNewFriendEmail] = useState("")
  const [addingFriend, setAddingFriend] = useState(false)
  const [friendFeedback, setFriendFeedback] = useState({ error: "", success: "" })
  const [friendSearch, setFriendSearch] = useState("")

  // Filtered friends
  const filteredFriends = useMemo(() => {
    if (!friendSearch.trim()) return friends
    const q = friendSearch.toLowerCase()
    return friends.filter(
      (f) => f.name?.toLowerCase().includes(q) || f.email?.toLowerCase().includes(q)
    )
  }, [friends, friendSearch])

  // Toggle friend selection
  const toggleSelectFriend = (friendId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    )
  }

  // Select all / Deselect all
  const selectAll = () => {
    setSelectedMemberIds(friends.map((f) => f._id))
  }
  const deselectAll = () => {
    setSelectedMemberIds([])
  }

  // Handle Add New Friend Inline
  const handleAddNewFriend = async (e) => {
    e.preventDefault()
    setFriendFeedback({ error: "", success: "" })

    if (!newFriendEmail.trim()) {
      setFriendFeedback({ error: "Please provide your friend's registered email.", success: "" })
      return
    }

    setAddingFriend(true)
    try {
      const res = await friendApi.addFriend(newFriendEmail.trim())
      if (res && res.success) {
        const addedFriend = res.data
        if (onFriendAdded) onFriendAdded(addedFriend)

        // Automatically tick the new friend
        if (!selectedMemberIds.includes(addedFriend._id)) {
          setSelectedMemberIds((prev) => [...prev, addedFriend._id])
        }

        setFriendFeedback({
          error: "",
          success: res.message || `${addedFriend.name} added to your friends list! 🤝`,
        })
        setNewFriendEmail("")
      }
    } catch (err) {
      setFriendFeedback({
        error: err.message || "Could not add friend. Ensure they have registered an account.",
        success: "",
      })
    } finally {
      setAddingFriend(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Please specify a group name.")
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        memberIds: selectedMemberIds,
      }

      const res = await groupApi.createGroup(payload)
      if (res && res.success) {
        onGroupCreated(res.data)
        // Reset form
        setName("")
        setDescription("")
        setSelectedMemberIds([])
        setFriendFeedback({ error: "", success: "" })
        setShowAddFriend(false)
        onClose()
      }
    } catch (err) {
      setError(err.message || "Failed to create group.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Split Group" maxWidth="max-w-lg">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Group Name */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Group Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Manali Trip 🏔️, Flat 402, Friday Dinners"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Description */}
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

        {/* Friends Selection Section */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Select Friends to Add</span>
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {selectedMemberIds.length} friend{selectedMemberIds.length !== 1 ? "s" : ""} selected (+ You)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {friends.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="text-[11px] text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowAddFriend(!showAddFriend)
                  setFriendFeedback({ error: "", success: "" })
                }}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer ml-1"
              >
                <Plus className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{showAddFriend ? "Close" : "Add Friend"}</span>
              </button>
            </div>
          </div>

          {/* Inline Form to Add a New Friend */}
          {showAddFriend && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in duration-150">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                Add New Friend by Email
              </span>

              {friendFeedback.error && (
                <div className="p-2 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{friendFeedback.error}</span>
                </div>
              )}
              {friendFeedback.success && (
                <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{friendFeedback.success}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="friend@example.com"
                  value={newFriendEmail}
                  onChange={(e) => setNewFriendEmail(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddNewFriend}
                  disabled={addingFriend}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{addingFriend ? "Adding..." : "Add Friend"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Friends List with Checkboxes */}
          {friends.length === 0 ? (
            <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700/80 space-y-1.5">
              <Users className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                No friends in your list yet
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Click <strong>"Add Friend"</strong> above to save friends by email, or create the group now and invite them later.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {friends.length > 5 && (
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter friends..."
                    value={friendSearch}
                    onChange={(e) => setFriendSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {filteredFriends.map((f) => {
                  const isSelected = selectedMemberIds.includes(f._id)

                  return (
                    <div
                      key={f._id}
                      onClick={() => toggleSelectFriend(f._id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all select-none ${
                        isSelected
                          ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500/50 shadow-2xs"
                          : "bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-[11px] text-slate-700 dark:text-slate-300 shrink-0">
                          {f.name ? f.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0">
                          <span className="block text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {f.name}
                          </span>
                          <span className="block text-[10px] text-slate-400 truncate">
                            {f.email}
                          </span>
                        </div>
                      </div>

                      {/* Custom Checkbox */}
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Guidance */}
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          💡 You will be added as Admin automatically. All ticked friends will be added as members upon creation.
        </div>

        {/* Action Buttons */}
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
            {loading ? "Creating..." : `Create Group (${selectedMemberIds.length + 1} Members)`}
          </button>
        </div>
      </form>
    </Modal>
  )
}
