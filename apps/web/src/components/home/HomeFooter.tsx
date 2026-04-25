import { Link } from "react-router-dom";

// TODO: Update these paths if your auth routes ever change
const LOGIN_PATH = "/login";
const SIGNUP_PATH = "/login";

type FooterAnchorLink = {
  label: string;
  href: string;
};

type FooterRouteLink = {
  label: string;
  to: string;
};

const PRODUCT_LINKS: FooterAnchorLink[] = [
  { label: "Dashboard", href: "/#features" },
  { label: "Essay Studio", href: "/#features" },
  { label: "Community Q&A", href: "/#community" },
  { label: "Opportunities", href: "/#features" },
];

const COMPANY_LINKS: Array<FooterAnchorLink | FooterRouteLink> = [
  { label: "About", href: "/#about" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
];

export default function HomeFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Main footer content */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 py-14 border-b border-slate-800">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <FooterLogo />
              <span className="text-lg font-bold text-white tracking-tight">
                Orizon
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              A smarter support system for international students navigating
              the study abroad journey.
            </p>

            {/* Social links — TODO: Add real social URLs when available */}
            <div className="flex items-center gap-3 mt-6">
              <SocialLink
                href="#"
                label="Twitter / X"
                icon={
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                }
              />
              <SocialLink
                href="#"
                label="LinkedIn"
                icon={
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" />
                }
              />
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Product
            </h3>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  {"to" in link ? (
                    <Link
                      to={link.to}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Auth links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Get Started
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to={LOGIN_PATH}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Log In
                </Link>
              </li>
              <li>
                <Link
                  to={SIGNUP_PATH}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-6 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Orizon. All rights reserved.</p>
          <p>Built for international students everywhere.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLogo() {
  return (
    <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center shrink-0">
      <svg
        className="w-4 h-4 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    </div>
  );
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        {icon}
      </svg>
    </a>
  );
}
