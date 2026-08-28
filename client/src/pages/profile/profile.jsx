import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import {
  Camera,
  Lock,
  ShieldCheck,
  User,
  X,
  Save,
} from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    photo: null,
  });
  const [previewUrl, setPreviewUrl] = useState("/avatar.png");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile");
        if (res.data.success) {
          setUser(res.data.user);
          setFormData({ name: res.data.user.name, photo: null });
          setPreviewUrl(res.data.user.photoUrl || "/avatar.png");
        }
      } catch {
        setError("Failed to load profile");
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  /* ================= HANDLERS ================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData({ ...formData, photo: file });
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    if (formData.photo) data.append("photo", formData.photo);

    try {
      const res = await api.put("/users/profile/update", data);
      if (res.data.success) {
        setUser(res.data.user);
        setIsEditing(false);
        setPreviewUrl(res.data.user.photoUrl || "/avatar.png");
        toast.success("Profile updated successfully");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Profile update failed");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      setChangingPassword(true);
      const res = await api.put("/users/change-password", passwordData);
      toast.success(res.data.message || "Password updated");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--bg-main) text-(--text-muted)">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--bg-main) text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-main) text-(--text-main) py-6 sm:py-8 md:py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">

        {/* LEFT PROFILE */}
        <div className="md:col-span-1 bg-(--bg-surface) rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-(--border-main) flex flex-col items-center text-center shadow-(--shadow-soft)">
          <div className="relative mb-4 sm:mb-6">
            <img
              src={user.photoUrl || "/avatar.png"}
              alt="Profile"
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl sm:rounded-2xl object-cover border-4 border-(--bg-surface)"
            />
            <div className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 bg-(--accent-primary) text-white p-1.5 rounded-lg">
              <ShieldCheck size={18} />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold capitalize">
            {user.name}
          </h2>
          <p className="text-(--text-muted) text-xs sm:text-sm mb-3 sm:mb-4">
            {user.email}
          </p>

          <span className="px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold uppercase bg-(--bg-glass) text-(--accent-primary) border border-(--border-main) mb-6 sm:mb-8">
            {user.role}
          </span>

          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-(--accent-primary) text-white py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <User size={18} /> Edit Profile
          </button>

          {user.role === "instructor" && (
            <Link
              to="/instructor/dashboard"
              className="mt-3 sm:mt-4 text-(--accent-primary) underline text-xs sm:text-sm"
            >
              Go to Instructor Dashboard
            </Link>
          )}
        </div>

        {/* SECURITY */}
        <div className="md:col-span-2 bg-(--bg-surface) rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-(--border-main) shadow-(--shadow-soft)">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-red-500/10 p-2.5 sm:p-3 rounded-full text-red-500">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Security</h2>
              <p className="text-(--text-muted) text-xs sm:text-sm">
                Keep your account secure
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5 sm:space-y-6">
            <input
              type="password"
              placeholder="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              className="w-full bg-(--bg-glass) border border-(--border-main) rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <input
                type="password"
                placeholder="New Password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                className="w-full bg-(--bg-glass) border border-(--border-main) rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                className="w-full bg-(--bg-glass) border border-(--border-main) rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base"
              />
            </div>

            <button
              disabled={changingPassword}
              className="w-full bg-linear-to-r from-red-600 to-red-500 text-white py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base"
            >
              {changingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-(--bg-surface) border border-(--border-main) rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-sm sm:max-w-md">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)}>
                <X />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5 sm:space-y-6">
              <div className="flex justify-center">
                <label className="cursor-pointer">
                  <img
                    src={previewUrl}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl object-cover"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-(--bg-glass) border border-(--border-main) rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base"
              />

              <button className="w-full bg-(--accent-primary) text-white py-2.5 sm:py-3 rounded-xl flex justify-center gap-2 text-sm sm:text-base">
                <Save size={18} /> Save
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
