import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/Authcontext";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import OtpVerify from "../../components/OtpVerify.jsx";

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
    if (e && typeof e.preventDefault === "function") e.preventDefault();
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

      const { data } = await api.post("/users/forgot-password", { email });
      console.log("🔑 [DEBUG] OTP Received on Forgot Password:", data.otp);
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
  const handleVerifyOtpCode = async (otpCode) => {
    if (loading) return;

    try {
      setLoading(true);
      toast.dismiss();

      await api.post("/users/verify-reset-otp", {
        email: forgotEmail,
        otp: otpCode,
      });

      setOtp(otpCode);
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
        <AnimatePresence mode="wait">
          {step === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* HEADER */}
              <div>
                <h2 className="text-3xl font-extrabold text-center mb-2">
                  <span className="bg-linear-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
                    Welcome Back
                  </span>
                </h2>
                <p className="text-center text-(--text-muted) text-sm">
                  Login to continue your learning journey
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <input type="email" name="email" placeholder="Email address"
                  value={formData.email} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-(--bg-glass) border border-(--border-main) text-(--text-main) outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 focus:bg-(--bg-surface) transition-all duration-200" />

                <input type="password" name="password" placeholder="Password"
                  value={formData.password} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-(--bg-glass) border border-(--border-main) text-(--text-main) outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 focus:bg-(--bg-surface) transition-all duration-200" />

                <button disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-white bg-linear-to-r from-violet-600 to-cyan-500 hover:shadow-lg transition-all duration-300 disabled:opacity-50 active:scale-[0.99] cursor-pointer">
                  {loading ? "Logging in..." : "Login"}
                </button>

                <p onClick={() => setStep("forgot")}
                  className="text-sm text-violet-500 dark:text-violet-400 text-center cursor-pointer hover:underline font-semibold">
                  Forgot password?
                </p>
              </form>

              <p className="text-center text-sm text-(--text-muted) pt-2 border-t border-(--border-main)">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="text-violet-500 dark:text-violet-400 font-semibold hover:underline">
                  Register
                </Link>
              </p>
            </motion.div>
          )}

          {step === "forgot" && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* HEADER */}
              <div>
                <h2 className="text-3xl font-extrabold text-center mb-2">
                  <span className="bg-linear-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
                    Forgot Password
                  </span>
                </h2>
                <p className="text-center text-(--text-muted) text-sm">
                  Enter your registered email
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <input type="email" placeholder="Enter your email"
                  value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-(--bg-glass) border border-(--border-main) text-(--text-main) outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 focus:bg-(--bg-surface) transition-all duration-200" />

                <button disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-white bg-linear-to-r from-violet-600 to-cyan-500 hover:shadow-lg transition-all duration-300 disabled:opacity-50 active:scale-[0.99] cursor-pointer">
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>

                <button type="button" onClick={() => setStep("login")}
                  className="w-full py-3 rounded-xl bg-(--bg-glass) border border-(--border-main) text-(--text-main) hover:bg-(--bg-surface) transition duration-200 cursor-pointer">
                  Back to Login
                </button>
              </form>
            </motion.div>
          )}

          {step === "verify" && (
            <OtpVerify
              key="otp-verify"
              email={forgotEmail}
              loading={loading}
              onVerify={handleVerifyOtpCode}
              onResend={() => handleSendOtp({ preventDefault: () => {} })}
              onCancel={() => setStep("forgot")}
            />
          )}

          {step === "reset" && (
            <motion.div
              key="reset"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* HEADER */}
              <div>
                <h2 className="text-3xl font-extrabold text-center mb-2">
                  <span className="bg-linear-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
                    Set New Password
                  </span>
                </h2>
                <p className="text-center text-(--text-muted) text-sm">
                  Create a strong new password
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <input type="password" placeholder="New password"
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-(--bg-glass) border border-(--border-main) text-(--text-main) outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 focus:bg-(--bg-surface) transition-all duration-200" />

                <input type="password" placeholder="Confirm password"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-(--bg-glass) border border-(--border-main) text-(--text-main) outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 focus:bg-(--bg-surface) transition-all duration-200" />

                <button disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 hover:brightness-110 active:scale-[0.99] transition-all duration-300 disabled:opacity-50 cursor-pointer">
                  {loading ? "Resetting..." : "Reset Password"}
                </button>

                <button type="button" onClick={() => setStep("login")}
                  className="w-full py-3 rounded-xl bg-(--bg-glass) border border-(--border-main) text-(--text-main) hover:bg-(--bg-surface) transition duration-200 cursor-pointer">
                  Cancel
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}