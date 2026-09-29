import { HelpCircle, Mail } from "lucide-react"

export default function TodoSidebarFooter() {
  return (
    <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800/60 shadow-2xs">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs mb-1.5">
          <HelpCircle className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
          <span>Support & Inquiries</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-2.5">
          For technical support, feedback, or enterprise inquiries, reach out to us:
        </p>
        <a
          href="mailto:bishwajeetk121@gmail.com"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer transition-colors break-all"
        >
          <Mail className="w-3.5 h-3.5 shrink-0" />
          <span>bishwajeetk121@gmail.com</span>
        </a>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1 font-medium">
        <span>TaskWorkspace v1.0</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          System Active
        </span>
      </div>
    </div>
  )
}

