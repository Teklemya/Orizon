import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);

    // SUPER SIMPLE DEMO — replace later with backend auth
    if (email === "demo@orizon.app" && password === "demo123") {
      login(email);
      navigate("/dashboard");
    } else {
      setErr("Invalid demo credentials. Try demo@orizon.app / demo123");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow p-6">
      <h1 className="text-xl font-semibold mb-4">Demo Login</h1>
      <p className="text-sm text-gray-500 mb-4">
        Use the demo account to preview Orizon features.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm text-gray-600">Email</span>
          <input
            type="email"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="demo@orizon.app"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">Password</span>
          <input
            type="password"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="demo123"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {err && (
          <div className="text-red-600 text-sm bg-red-50 rounded-lg p-2">
            {err}
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-black text-white py-2 hover:bg-gray-800"
        >
          Login
        </button>
      </form>
    </div>
  );
}
