import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../lib/auth";
import { API_BASE } from "../lib/apiBase";

interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

type ProfileErrorResponse = {
  error?: string;
  detail?: string;
};

function createFallbackProfile(user: {
  id: string;
  email: string;
  displayName?: string;
}): UserProfile {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  };
}

function formatDate(value?: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
}

export default function Account() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      setProfile(null);
      setFetchError(null);
      setProfileLoading(false);
      return;
    }

    const currentUser = user;
    const controller = new AbortController();

    async function fetchProfile() {
      setProfileLoading(true);
      setFetchError(null);

      try {
        const response = await fetch(`${API_BASE}/api/profile/${currentUser.id}`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.ok) {
          const data = (await response.json()) as UserProfile;
          setProfile(data);
          return;
        }

        setProfile(createFallbackProfile(currentUser));

        let errorPayload: ProfileErrorResponse | null = null;
        try {
          errorPayload = (await response.json()) as ProfileErrorResponse;
        } catch {
          errorPayload = null;
        }

        if (response.status === 404) {
          setFetchError(
            errorPayload?.detail ||
              "Your account exists, but the database profile record is missing. Showing basic account info for now."
          );
          return;
        }

        setFetchError(
          errorPayload?.detail ||
            errorPayload?.error ||
            "Unable to load saved profile details right now."
        );
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Error fetching profile:", error);
        setProfile(createFallbackProfile(currentUser));
        setFetchError("Unable to reach the profile service. Showing basic account info.");
      } finally {
        if (!controller.signal.aborted) {
          setProfileLoading(false);
        }
      }
    }

    void fetchProfile();

    return () => {
      controller.abort();
    };
  }, [user, loading]);

  if (loading || profileLoading) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white px-6 py-20 text-center shadow-sm">
        <p className="text-gray-500 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Account</h1>
        <p className="mt-3 text-gray-500">Please sign in to view your profile.</p>
      </div>
    );
  }

  const resolvedProfile = profile ?? createFallbackProfile(user);
  const displayName =
    resolvedProfile.displayName || resolvedProfile.email.split("@")[0];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-400">
          Account
        </p>
        <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">{displayName}</h1>
            <p className="mt-2 text-gray-600">{resolvedProfile.email}</p>
            <p className="mt-3 text-sm text-gray-400">
              {resolvedProfile.createdAt
                ? `Joined ${formatDate(resolvedProfile.createdAt)}`
                : "Profile details are still syncing."}
            </p>
          </div>
        </div>
      </section>

      {fetchError ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {fetchError}
        </section>
      ) : null}

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Account Information
          </h2>
          <div className="mt-5 space-y-4 text-sm text-gray-600">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">User ID</span>
              <span className="font-mono text-xs text-gray-800">
                {resolvedProfile.id.slice(0, 12)}...
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Email</span>
              <span className="text-right text-gray-800">
                {resolvedProfile.email}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Created</span>
              <span className="text-gray-800">
                {formatDate(resolvedProfile.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Updated</span>
              <span className="text-gray-800">
                {formatDate(resolvedProfile.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          <p className="mt-3 text-sm text-gray-600">
            Password changes and recovery are managed through your Supabase
            authentication flow.
          </p>
          <Link
            to="/reset-password"
            className="mt-5 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Reset Password
          </Link>
        </div>
      </section>
    </div>
  );
}
