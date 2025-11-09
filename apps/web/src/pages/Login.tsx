// apps/web/src/pages/Login.tsx
import type { FormEvent } from "react";

export default function Login() {
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    alert("This is a demo. Auth is out of scope for MVP.");
  }

  return (
    <div className="mx-auto max-w-md">
      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input type="email" required className="w-full rounded-xl border p-2" placeholder="you@example.com" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <input type="password" required className="w-full rounded-xl border p-2" placeholder="••••••••" />
        </div>
        <button type="submit" className="w-full rounded-xl bg-black text-white py-2 font-medium">
          Sign in
        </button>
        <p className="text-xs text-gray-500">Demo only – use Dashboard to view the MVP.</p>
      </form>
    </div>
  );
}
