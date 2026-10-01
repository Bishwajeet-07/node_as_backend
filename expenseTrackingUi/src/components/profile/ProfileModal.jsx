import { X, Edit3, Mail, Phone, FileText, BadgeCheck } from "lucide-react"

export default function ProfileModal({ isOpen, onClose, user, onOpenEditDrawer }) {
  if (!isOpen) return null

  const initial = user?.username?.[0]?.toUpperCase() || "U"

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Profile Card Container */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800/90 p-6 z-10 animate-in zoom-in-95 duration-200 space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Header Avatar & Main Details */}
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full border-2 border-indigo-500/30 overflow-hidden bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold shadow-md mb-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.username || "Profile"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none"
                }}
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 w-full">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none capitalize">
              {user?.username || "User"}
            </h3>
            <BadgeCheck className="w-5 h-5 text-white fill-indigo-600 dark:fill-indigo-500 shrink-0" />
          </div>

          {user?.bio && (
            <div className="mt-2.5 px-3 py-1 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-full text-indigo-700 dark:text-indigo-300 text-xs font-medium">
              {user.bio}
            </div>
          )}
        </div>

        <div className="h-[1px] bg-slate-200/80 dark:bg-slate-800/80" />

        {/* User Details Grid */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
            <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 block">
                Email
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                {user?.email || "N/A"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
            <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 block">
                Phone
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200 block">
                {user?.phone || "Not set"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
            <FileText className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 block">
                Bio
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200 block leading-relaxed">
                {user?.bio || "No bio added yet."}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: Update Profile */}
        <button
          onClick={() => {
            onClose()
            onOpenEditDrawer()
          }}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-xs hover:shadow transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          <span>Update Profile</span>
        </button>
      </div>
    </div>
  )
}

