import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen">
      <nav className="border-b bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-3 flex gap-6">
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Login</Link>
          <Link to="/dashboard" className="text-blue-600 font-medium hover:underline">Dashboard</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
