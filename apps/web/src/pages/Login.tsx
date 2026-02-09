// apps/web/src/pages/Login.tsx
import { useEffect } from "react";
import type { FormEvent } from "react";

type GoogleResponse = {
  credential: string;
  select_by: string;
};

export default function Login() {
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    alert("This is a demo. Auth is out of scope for MVP.");
}

useEffect(() => {
    // Google calls this function directly
    // @ts-ignore
    window.handleGoogleResponse = (response: GoogleResponse) => {
      console.log("Google ID Token:", response.credential);
      localStorage.setItem("google_token", response.credential);

      // Fake "logged in" state
      localStorage.setItem("user", JSON.stringify({
        provider: "google",
        loggedIn: true,
      }));

      alert("Signed in with Google (frontend-only demo)");      
    };
  }, []);

  

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
        <div
        id="g_id_onload"
        data-client_id="128711577142-qfeqlsj3sbvoro7vugogpf20kt74k8bs.apps.googleusercontent.com"
        data-callback="handleGoogleResponse"
        data-auto_prompt="false"
      ></div>

      <div
        className="g_id_signin"
        data-type="standard"
        data-size="large"
        data-theme="outline"
        data-text="sign_in_with"
        data-shape="rectangular"
      ></div>
      </form>
      </div>
    
  );
}
