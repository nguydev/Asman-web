// Footer for the login page.
export default function AuthFooter() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-4 text-xs text-zinc-400 sm:flex-row">
        <span>
          © 2026 ASMAN Enterprise. All rights reserved. Precision in Logistics.
        </span>
        <span className="flex gap-4">
          <a href="#" className="hover:text-brand">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-brand">
            Terms of Service
          </a>
        </span>
      </div>
    </footer>
  )
}
