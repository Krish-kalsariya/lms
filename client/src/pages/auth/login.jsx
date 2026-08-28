import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/Authcontext";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState("login");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ================= LOGIN ================= */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    const email = formData.email.trim();
    const password = formData.password;

    if (!email) {
      toast.error("Email is required", { id: "auth-error" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address", { id: "auth-error" });
      return;
    }

    if (!password) {
      toast.error("Password is required", { id: "auth-error" });
      return;
    }

    try {
      setLoading(true);
      toast.dismiss();

      const res = await api.post("/users/login", formData);
      login(res.data.user);

      toast.success("Login successful", { id: "login-success" });

      navigate(
        res.data.user.role === "instructor"
          ? "/instructor/dashboard"
          : "/"
      );
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || "Invalid credentials", {
        id: "auth-error",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEND OTP ================= */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (loading) return;

    const email = forgotEmail.trim();

    if (!email) {
      toast.error("Email is required", { id: "auth-error" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address", { id: "auth-error" });
      return;
    }

    try {
      setLoading(true);
      toast.dismiss();

      await api.post("/users/forgot-password", { email });
      toast.success("OTP sent to your email", { id: "otp-sent" });
      setStep("verify");
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || "User not found", {
        id: "auth-error",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!otp) {
      toast.error("OTP is required", { id: "auth-error" });
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error("OTP must be exactly 6 digits", { id: "auth-error" });
      return;
    }

    try {
      setLoading(true);
      toast.dismiss();

      await api.post("/users/verify-reset-otp", {
        email: forgotEmail,
        otp,
      });

      toast.success("OTP verified", { id: "otp-verified" });
      setStep("reset");
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || "Invalid or expired OTP", {
        id: "auth-error",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESET PASSWORD ================= */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!newPassword) {
      toast.error("New password is required", { id: "auth-error" });
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters", {
        id: "auth-error",
      });
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      toast.error("Password must contain one uppercase letter", {
        id: "auth-error",
      });
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      toast.error("Password must contain one lowercase letter", {
        id: "auth-error",
      });
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      toast.error("Password must contain one number", {
        id: "auth-error",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match", { id: "auth-error" });
      return;
    }

    try {
      setLoading(true);
      toast.dismiss();

      await api.post("/users/reset-password", {
        email: forgotEmail,
        otp,
        newPassword,
      });

      toast.success("Password reset successful", {
        id: "password-reset",
      });

      setStep("login");
      setForgotEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || "Failed to reset password", {
        id: "auth-error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-(--gradient-main) px-4 transition-colors duration-300">
      <div className="relative w-full max-w-md rounded-2xl border border-(--border-main) bg-(--bg-glass) backdrop-blur-xl shadow-2xl p-8">

        <h2 className="text-3xl font-extrabold text-center mb-6">
          <span className="bg-linear-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
            {step === "login" && "Welcome Back"}
            {step === "forgot" && "Forgot Password"}
            {step === "verify" && "Verify OTP"}
            {step === "reset" && "Set New Password"}
          </span>
        </h2>

        <p className="text-center text-(--text-muted) text-sm mb-6">
          {step === "login" && "Login to continue your learning journey"}
          {step === "forgot" && "Enter your registered email"}
          {step === "verify" && "Enter the OTP sent to your email"}
          {step === "reset" && "Create a strong new password"}
        </p>

        {/* UI BELOW IS 100% UNCHANGED */}
        {/* LOGIN */}
        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-5">
            <input type="email" name="email" placeholder="Email address"
              value={formData.email} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-(--bg-glass) border border-(--border-main) text-(--text-main)" />

            <input type="password" name="password" placeholder="Password"
              value={formData.password} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-(--bg-glass) border border-(--border-main) text-(--text-main)" />

            <button disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-linear-to-r from-violet-600 to-cyan-500 hover:shadow-lg transition disabled:opacity-50">
              {loading ? "Logging in..." : "Login"}
            </button>

            <p onClick={() => setStep("forgot")}
              className="text-sm text-(--accent-primary) text-center cursor-pointer hover:underline">
              Forgot password?
            </p>
          </form>
        )}

        {/* FORGOT */}
        {step === "forgot" && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <input type="email" placeholder="Enter your email"
              value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-(--bg-glass) border border-(--border-main) text-(--text-main)" />

            <button disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700">
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

            <button type="button" onClick={() => setStep("login")}
              className="w-full py-3 rounded-xl bg-(--bg-glass) text-(--text-main)">
              Back to Login
            </button>
          </form>
        )}

        {/* VERIFY */}
        {step === "verify" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <input type="text" maxLength={6} placeholder="Enter 6-digit OTP"
              value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-3 text-center tracking-widest rounded-xl bg-(--bg-glass) border border-(--border-main) text-(--text-main)" />

            <button disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700">
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button type="button" onClick={() => setStep("forgot")}
              className="w-full py-3 rounded-xl bg-(--bg-glass) text-(--text-main)">
              Back
            </button>
          </form>
        )}

        {/* RESET */}
        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <input type="password" placeholder="New password"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-(--bg-glass) border border-(--border-main) text-(--text-main)" />

            <input type="password" placeholder="Confirm password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-(--bg-glass) border border-(--border-main) text-(--text-main)" />

            <button disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700">
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <button type="button" onClick={() => setStep("login")}
              className="w-full py-3 rounded-xl bg-(--bg-glass) text-(--text-main)">
              Cancel
            </button>
          </form>
        )}

        <p className="text-center text-sm text-(--text-muted) mt-8">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-(--accent-primary) hover:underline">
            Register
          </Link>
        </p>
      </div>
    </section>
  );
}