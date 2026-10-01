import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { apiClient } from "../../services/api"
import {
  User,
  Mail,
  Coins,
  Calendar,
  Key,
  LogOut,
  Copy,
  Check,
  Activity,
  Shield,
} from "lucide-react"

export default function ProfileView() {
  const { user, currency, logout } = useAuth()
  const [copied, setCopied] = useState(false)
  const [healthStatus, setHealthStatus] = useState("checking")

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await apiClient("/health")
        if (res && res.status === "OK") {
          setHealthStatus("online")
        } else {
          setHealthStatus("offline")
        }
      } catch {
        setHealthStatus("offline")
      }
    }
    checkHealth()
  }, [])

  const copyUserId = () => {
    if (user?._id) {
      navigator.clipboard.writeText(user._id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Recent"

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Account & Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View your logged-in profile information and server connection status.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
        {/* User Identity Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {user?.name || "Anonymous User"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email}</span>
            </p>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          {/* Default Currency */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">Default Currency</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {currency} ({currency === "INR" ? "₹ Indian Rupee" : currency})
              </span>
            </div>
          </div>

          {/* Member Since */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">Member Since</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {joinDate}
              </span>
            </div>
          </div>

          {/* Server Connection Status */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">Backend API</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    healthStatus === "online"
                      ? "bg-emerald-500"
                      : healthStatus === "offline"
                      ? "bg-rose-500"
                      : "bg-amber-500 animate-pulse"
                  }`}
                />
                <span className="capitalize">{healthStatus} (Port 5000)</span>
              </span>
            </div>
          </div>

          {/* User ID */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] text-slate-400">Account ID</span>
                <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 truncate block max-w-[150px]">
                  {user?._id || "—"}
                </span>
              </div>
            </div>

            <button
              onClick={copyUserId}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Copy User ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Logout Section */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Sign out to switch accounts or end your active session.
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
