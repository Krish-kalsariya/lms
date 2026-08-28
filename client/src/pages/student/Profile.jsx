import { useEffect, useState } from "react";
import api from "../../api/axios";
import { User, Lock, BookOpen, Camera, Save, X, ShieldCheck, GraduationCap, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Authcontext.jsx";

const StudentProfile = () => {
  const { updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6; 

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await api.get("/users/profile");
        setUser(profileRes.data.user);
        setName(profileRes.data.user.name);
        setPreview(profileRes.data.user.photoUrl || "");

        const courseRes = await api.get("/course/enrolled");
        setEnrolledCourses(courseRes.data.courses || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const formData = new FormData();
      formData.append("name", name);
      if (photo) formData.append("photo", photo);
      const res = await api.put("/users/profile/update", formData);
      setUser(res.data.user);
      setPreview(res.data.user.photoUrl || "");
      
      // Update auth context to refresh navbar image
      updateUser({
        ...user,
        name: res.data.user.name,
        photoUrl: res.data.user.photoUrl,
      });
      
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    try {
      setChangingPassword(true);
      const res = await api.put("/users/change-password", passwordData);
      toast.success(res.data.message);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    } finally {
      setChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Pagination logic - MOVED OUTSIDE JSX
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = enrolledCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(enrolledCourses.length / coursesPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-theme flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-theme-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-theme-muted font-medium tracking-widest uppercase text-xs">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-theme min-h-screen text-theme">
      {/* HEADER */}
      <div className="relative h-48 bg-gradient-theme overflow-hidden border-b border-theme">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--accent-primary)_0%,transparent_70%)] opacity-5"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl px-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-theme-muted mt-1">Manage your account settings and enrolled courses</p>
          </div>
          <GraduationCap className="text-theme-accent/20 w-24 h-24" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT SIDEBAR - PROFILE */}
          <div className="lg:col-span-1 space-y-6">
            {/* PROFILE CARD */}
            <div className="bg-theme-surface border border-theme rounded-2xl p-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-theme-surface shadow-lg">
                    <img
                      src={preview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=${user.role === 'admin' ? '8B5CF6' : '0284C7'}&color=fff&size=256`}
                      className="w-full h-full object-cover"
                      alt="Profile"
                    />
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="absolute bottom-0 right-0 bg-theme-accent p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                      <Camera size={16} className="text-white" />
                    </button>
                  )}
                </div>

                <h2 className="text-xl font-bold text-center">{user.name}</h2>
                <p className="text-theme-muted text-sm text-center mb-2">{user.email}</p>
                
                <div className="inline-flex items-center gap-2 bg-theme-accent/10 text-theme-accent px-3 py-1 rounded-full text-xs font-semibold">
                  <ShieldCheck size={12} />
                  {user.role.toUpperCase()}
                </div>

                <div className="mt-6 w-full space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-theme-muted">Courses Enrolled</span>
                    <span className="font-medium">{enrolledCourses.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="bg-theme-surface border border-theme rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-theme transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-theme-accent/10 rounded-lg">
                      <User size={16} className="text-theme-accent" />
                    </div>
                    <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
                  </div>
                  <ChevronRight size={16} className="text-theme-muted" />
                </button>
                <button
                  onClick={() => setShowCourses(!showCourses)} // 👈 toggle enrolled courses visibility
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-theme transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <BookOpen size={16} className="text-green-500" />
                    </div>
                    <span>My Learning</span>
                  </div>
                  <ChevronRight size={16} className="text-theme-muted" />
                </button>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            {/* EDIT PROFILE SECTION */}
            {isEditing ? (
              <div className="bg-theme-surface border border-theme rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Edit Profile</h2>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2 hover:bg-theme rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-theme">
                        <img
                          src={preview || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284C7&color=fff&size=256`}
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                      </div>
                      <label className="absolute bottom-0 right-0 bg-theme-accent p-2 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                        <Camera size={14} className="text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setPhoto(file);
                              setPreview(URL.createObjectURL(file));
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-theme-muted mb-2">Upload a new photo. Max size 2MB.</p>
                      <p className="text-xs text-theme-muted">JPG, PNG or GIF formats</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-theme border border-theme rounded-xl px-4 py-3 focus:border-theme-accent outline-none transition-colors"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full bg-theme/50 border border-theme rounded-xl px-4 py-3 text-theme-muted cursor-not-allowed"
                      />
                      <p className="text-xs text-theme-muted mt-2">Contact support to change email</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 bg-theme-accent text-white py-3 rounded-xl font-semibold hover:bg-theme-accent/90 transition-colors disabled:opacity-50"
                    >
                      {updating ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Save size={16} />
                          Save Changes
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-theme-surface border border-theme text-theme py-3 rounded-xl font-semibold hover:bg-theme transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {/* SECURITY SECTION */}
            <div className="bg-theme-surface border border-theme rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Lock className="text-red-500" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Security Settings</h3>
                  <p className="text-sm text-theme-muted">Update your password and security preferences</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full bg-theme border border-theme rounded-xl px-4 py-3 pr-10 focus:border-red-500/50 outline-none transition-colors"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme"
                    >
                      {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full bg-theme border border-theme rounded-xl px-4 py-3 pr-10 focus:border-theme-accent outline-none transition-colors"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme"
                      >
                        {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium mb-2">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full bg-theme border border-theme rounded-xl px-4 py-3 pr-10 focus:border-theme-accent outline-none transition-colors"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme"
                      >
                        {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {changingPassword ? "Updating Password..." : "Update Password"}
                </button>
              </form>
            </div>

            {/* ENROLLED COURSES - only shown when showCourses is true */}
            {showCourses && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-theme-accent/10 rounded-lg">
                      <BookOpen className="text-theme-accent" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">My Courses</h3>
                      <p className="text-sm text-theme-muted">{enrolledCourses.length} enrolled courses</p>
                    </div>
                  </div>
                  <button className="text-sm text-theme-accent font-semibold hover:underline">
                    View All
                  </button>
                </div>

                {currentCourses.length === 0 ? (
                  <div className="bg-theme-surface border border-dashed border-theme rounded-2xl p-12 text-center">
                    <BookOpen className="mx-auto text-theme-muted/50 mb-4" size={48} />
                    <p className="text-theme-muted font-medium">No courses enrolled yet</p>
                    <p className="text-sm text-theme-muted mt-2">Browse courses and start learning today</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentCourses.map((course) => (
                      <div
                        key={course._id}
                        className="group bg-theme-surface border border-theme rounded-2xl overflow-hidden hover:border-theme-accent/50 transition-all duration-300"
                      >
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={course.courseThumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt={course.courseTitle}
                          />
                          <div className="absolute top-3 left-3 bg-theme-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                            Enrolled
                          </div>
                          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            ₹{course.courseprice || "Free"}
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h4 className="font-semibold group-hover:text-theme-accent transition-colors line-clamp-1 mb-2">
                            {course.courseTitle}
                          </h4>
                          <p className="text-sm text-theme-muted line-clamp-2 mb-4">
                            {course.subTitle || course.description || "No description available"}
                          </p>
                          
                          <button className="w-full bg-theme hover:bg-theme-accent hover:text-white text-sm font-semibold py-2.5 rounded-lg transition-colors" onClick={() => navigate(`/course/${course._id}`)}>
                            Continue Learning
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-theme hover:bg-theme-accent hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                            currentPage === page
                              ? 'bg-theme-accent text-white'
                              : 'border border-theme hover:bg-theme-accent hover:text-white'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border border-theme hover:bg-theme-accent hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component
const ChevronRight = ({ size = 16, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default StudentProfile;