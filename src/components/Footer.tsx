import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        {/* Copyright */}
        <p className="text-sm text-neutral-500 text-center sm:text-left">
          &copy; 2026 Aryan Padarthi Clovrr Solutions. All rights reserved.
        </p>

        {/* Legal links */}
        <nav aria-label="Legal" className="flex items-center gap-6">
          <Link
            href="/privacy-policy"
            className="text-sm text-neutral-500 hover:text-emerald-600 transition-colors duration-200"
          >
            Privacy Policy
          </Link>
          <span className="text-neutral-300 dark:text-neutral-700 select-none">
            |
          </span>
          <Link
            href="/terms-of-service"
            className="text-sm text-neutral-500 hover:text-emerald-600 transition-colors duration-200"
          >
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}
