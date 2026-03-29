import { useEffect, useState } from "react";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch("/api/profile", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    }
    fetchProfile();
  }, []);

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 animate-pulse">Loading profile...</p>
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
              {profile.name}
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
                <span>{profile.id}</span>
              </div>

              <div className="flex justify-between">
                <span>Email</span>
                <span>{profile.email}</span>
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