import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";

// tiny helper
function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/70 border-b">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <Logo />
              <span className="font-semibold tracking-tight">Orizon</span>
              <span className="hidden md:inline text-xs px-2 py-0.5 rounded-full bg-black text-white/90">MVP</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  cx(
                    "px-3 py-2 rounded-xl text-sm font-medium transition",
                    isActive
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )
                }
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/login"
                className={({ isActive }) =>
                  cx(
                    "px-3 py-2 rounded-xl text-sm font-medium transition",
                    isActive
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )
                }
              >
                Login
              </NavLink>

              {/* Optional: external docs link placeholder */}
              <a
                href="#"
                className="px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Docs
              </a>
            </nav>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* Contextual breadcrumb-ish text */}
              <span className="text-xs text-gray-500">
                {pathname === "/dashboard" ? "Roadmap · Opportunities" : "Welcome"}
              </span>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border text-gray-700"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Mobile Nav */}
          {open && (
            <div className="md:hidden pb-3">
              <div className="grid gap-1">
                <MobileLink to="/dashboard" onClick={() => setOpen(false)}>Dashboard</MobileLink>
                <MobileLink to="/login" onClick={() => setOpen(false)}>Login</MobileLink>
                <a href="#" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Docs
                </a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex items-center justify-between text-sm text-gray-500">
          <span>© {new Date().getFullYear()} Orizon</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MobileLink({ to, children, onClick }: { to: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cx(
          "px-3 py-2 rounded-lg text-sm font-medium transition",
          isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
        )
      }
    >
      {children}
    </NavLink>
  );
}

function Logo() {
  return (
    <svg className="h-5 w-5 text-black" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {/* Simple compass/arrow logo */}
      <path d="M12 2a1 1 0 0 1 .9.55l2.2 4.4 4.9.7a1 1 0 0 1 .55 1.7l-3.55 3.46.84 4.88a1 1 0 0 1-1.45 1.05L12 17.77l-4.39 2.32a1 1 0 0 1-1.45-1.05l.84-4.88L3.45 9.35A1 1 0 0 1 4 7.65l4.9-.7 2.2-4.4A1 1 0 0 1 12 2z"/>
    </svg>
  );
}
