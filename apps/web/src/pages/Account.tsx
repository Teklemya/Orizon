import { useEffect, useState } from "react";
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

const ProfilePage: React.FC = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || loading) return;

    async function fetchProfile() {
      try {
        const res = await fetch(`${API_BASE}/api/profile/${user?.id}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          setFetchError("Failed to load profile");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setFetchError("Error loading profile");
      }
    }

    fetchProfile();
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Please sign in to view your profile</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-gray-500 animate-pulse">Loading profile...</p>
          {fetchError && <p className="text-red-500 mt-2">{fetchError}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          My Profile
        </h1>

        {/* Profile Card */}
        <div className="bg-white shadow-md rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">

          {/* User Info */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h2 className="text-2xl font-semibold text-gray-800">
              {profile.displayName || profile.email.split("@")[0]}
            </h2>

            <p className="text-gray-600">{profile.email}</p>


            {profile.createdAt && (
              <p className="text-sm text-gray-400">
                Joined {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Account Details Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              Account Information
            </h3>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>User ID</span>
                <span className="text-xs font-mono">{profile.id.substring(0, 12)}...</span>
              </div>

              <div className="flex justify-between">
                <span>Email</span>
                <span>{profile.email}</span>
              </div>

          <div className="flex justify-between">
                <span>Created at</span>
                <span>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}</span>
              </div>

          <div className="flex justify-between">
                <span>Updated at</span>
                <span>{profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              Security
            </h3>

            <button className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg font-medium">
              Change Password
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;