import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../lib/auth";

// tiny helper
function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();

  // Breadcrumb text
  const breadcrumb =
    pathname === "/dashboard"
      ? "Roadmap · Opportunities"
      : pathname === "/essay-studio"
      ? "Essay feedback"
      : pathname === "/community"
      ? "Student questions"
      : pathname === "/opportunities"
      ? "Opportunities"
      : pathname === "/account"
      ? "Account"
      : "Welcome";

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
              <span className="hidden md:inline text-xs px-2 py-0.5 rounded-full bg-black text-white/90">
                MVP
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  cx(
                    "px-3 py-2 rounded-xl text-sm font-medium transition",
                    isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
                  )
                }
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/essay-studio"
                className={({ isActive }) =>
                  cx(
                    "px-3 py-2 rounded-xl text-sm font-medium transition",
                    isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
                  )
                }
              >
                Essay Studio
              </NavLink>

              <NavLink
                to="/community"
                className={({ isActive }) =>
                  cx(
                    "px-3 py-2 rounded-xl text-sm font-medium transition",
                    isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
                  )
                }
              >
                Community Q&A
              </NavLink>

              <NavLink
                to="/opportunities"
                className={({ isActive }) =>
                  cx(
                    "px-3 py-2 rounded-xl text-sm font-medium transition",
                    isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
                  )
                }
              >
                Opportunities
              </NavLink>

              <NavLink
                to="/account"
                className={({ isActive }) =>
                  cx(
                    "px-3 py-2 rounded-xl text-sm font-medium transition",
                    isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
                  )
                }
              >
                Account
              </NavLink>
            </nav>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs text-gray-500">{breadcrumb}</span>

              {!user ? (
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    cx(
                      "px-3 py-2 rounded-xl text-sm font-medium border transition",
                      isActive
                        ? "bg-black text-white border-black"
                        : "text-gray-700 border-gray-200 hover:bg-gray-100"
                    )
                  }
                >
                  Login
                </NavLink>
              ) : (
                <button
                  onClick={() => signOut()}
                  className="px-3 py-2 rounded-xl text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border text-gray-700"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Nav */}
          {open && (
            <div className="md:hidden pb-3">
              <div className="grid gap-1">
                <MobileLink to="/dashboard" onClick={() => setOpen(false)}>
                  Dashboard
                </MobileLink>
                <MobileLink to="/essay-studio" onClick={() => setOpen(false)}>
                  Essay Studio
                </MobileLink>
                <MobileLink to="/community" onClick={() => setOpen(false)}>
                  Community Q&A
                </MobileLink>
                <MobileLink to="/opportunities" onClick={() => setOpen(false)}>
                  Opportunities
                </MobileLink>
                <MobileLink to="/account" onClick={() => setOpen(false)}>
                  Account
                </MobileLink>

                {!user ? (
                  <MobileLink to="/login" onClick={() => setOpen(false)}>
                    Login
                  </MobileLink>
                ) : (
                  <button
                    onClick={() => {
                      signOut();
                      setOpen(false);
                    }}
                    className="text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Logout
                  </button>
                )}
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
            <a href="#" className="hover:underline">
              Privacy
            </a>
            <a href="#" className="hover:underline">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MobileLink({
  to,
  children,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
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
    <svg
      className="h-5 w-5 text-black"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2a1 1 0 0 1 .9.55l2.2 4.4 4.9.7a1 1 0 0 1 .55 1.7l-3.55 3.46.84 4.88a1 1 0 0 1-1.45 1.05L12 17.77l-4.39 2.32a1 1 0 0 1-1.45-1.05l.84-4.88L3.45 9.35A1 1 0 0 1 4 7.65l4.9-.7 2.2-4.4A1 1 0 0 1 12 2z" />
    </svg>
  );
}
