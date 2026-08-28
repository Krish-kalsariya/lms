import { useState, useRef } from "react";
import api from "../../api/axios.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const requestLock = useRef(false); // 🔒 prevents double calls

  // register | verify
  const [step, setStep] = useState("register");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= REGISTER ================= */
  const handleRegister = async (e) => {
    e.preventDefault();
    if (requestLock.current) return;

    const { name, email, password } = formData;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // 🔹 Name validation
    if (!trimmedName) {
      toast.error("Name is required", { id: "register-error" });
      return;
    }

    if (trimmedName.length < 3) {
      toast.error("Name must be at least 3 characters", { id: "register-error" });
      return;
    }

    if (!/^[A-Za-z ]+$/.test(trimmedName)) {
      toast.error("Name can contain only letters and spaces", { id: "register-error" });
      return;
    }

    // 🔹 Email validation
    if (!trimmedEmail) {
      toast.error("Email is required", { id: "register-error" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("Please enter a valid email address", { id: "register-error" });
      return;
    }

    // 🔹 Password validation
    if (!password) {
      toast.error("Password is required", { id: "register-error" });
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters", { id: "register-error" });
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error("Password must contain at least one uppercase letter", {
        id: "register-error",
      });
      return;
    }

    if (!/[a-z]/.test(password)) {
      toast.error("Password must contain at least one lowercase letter", {
        id: "register-error",
      });
      return;
    }

    if (!/[0-9]/.test(password)) {
      toast.error("Password must contain at least one number", {
        id: "register-error",
      });
      return;
    }

    try {
      requestLock.current = true;
      setLoading(true);

      const { data } = await api.post("/users/register", formData);
      toast.success(data.message || "Registration successful 🎉", {
        id: "register-success",
      });
      setStep("verify");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed", {
        id: "register-fail",
      });
    } finally {
      setLoading(false);
      requestLock.current = false;
    }
  };

  /* ================= VERIFY OTP ================= */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (requestLock.current) return;

    // 🔹 OTP validation
    if (!otp) {
      toast.error("OTP is required", { id: "otp-invalid" });
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error("OTP must be exactly 6 digits", { id: "otp-invalid" });
      return;
    }

    try {
      requestLock.current = true;
      setLoading(true);

      const { data } = await api.post("/users/verify-otp", {
        email: formData.email,
        otp,
      });

      toast.success(data.message || "Email verified ✔", {
        id: "otp-success",
      });
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.message;
      if (message === "User not found or OTP expired") {
        toast.error("OTP expired. Please register again.", {
          id: "otp-expired",
        });
        setOtp("");
        setStep("register");
      } else {
        toast.error(message || "OTP verification failed", {
          id: "otp-fail",
        });
      }
    } finally {
      setLoading(false);
      requestLock.current = false;
    }
  };

  /* ================= RESEND OTP ================= */
  const resendOtp = async () => {
    if (requestLock.current) return;

    try {
      requestLock.current = true;
      setLoading(true);

      const { data } = await api.post("/users/resend-otp", {
        email: formData.email,
      });

      toast.success(data.message || "OTP resent successfully 📧", {
        id: "otp-resend",
      });
    } catch (err) {
      const message = err.response?.data?.message;
      if (message === "User already exists. Please login.") {
        toast.success("Account already verified. Please login.", {
          id: "already-verified",
        });
        navigate("/login");
      } else {
        toast.error(message || "Failed to resend OTP", {
          id: "otp-resend-fail",
        });
      }
    } finally {
      setLoading(false);
      requestLock.current = false;
    }
  };

  /* ================= CANCEL OTP ================= */
  const handleCancelOtp = () => {
    setOtp("");
    setFormData({ name: "", email: "", password: "" });
    setStep("register");
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-(--gradient-main) px-4 transition-colors duration-300">
      <div className="w-full max-w-md rounded-2xl border border-(--border-main) bg-(--bg-glass) backdrop-blur-xl shadow-2xl p-8">

        {/* HEADER */}
        <h2 className="text-3xl font-extrabold text-center mb-6">
          <span className="bg-linear-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
            {step === "register" ? "Create Account" : "Verify Email"}
          </span>
        </h2>

        <p className="text-center text-(--text-muted) text-sm mb-8">
          {step === "register"
            ? "Start your learning journey with us"
            : "Enter the OTP sent to your email"}
        </p>

        {/* ================= REGISTER FORM ================= */}
        {step === "register" && (
          <form onSubmit={handleRegister} className="space-y-5">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-(--bg-glass) border border-(--border-main) text-(--text-main)"
            />

            <input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-(--bg-glass) border border-(--border-main) text-(--text-main)"
            />

            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-(--bg-glass) border border-(--border-main) text-(--text-main)"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white
                         bg-linear-to-r from-violet-600 to-cyan-500
                         hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? "Registering..." : "Create Account"}
            </button>

            <p className="text-(--text-muted) text-center text-sm">
              Already have an account?{" "}
              <span
                className="text-(--accent-primary) cursor-pointer hover:underline"
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </p>
          </form>
        )}

        {/* ================= OTP VERIFY FORM ================= */}
        {step === "verify" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <p className="text-center text-(--text-muted) text-sm">
              OTP sent to <br />
              <span className="text-(--accent-primary) font-medium">
                {formData.email}
              </span>
            </p>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ""))
              }
              className="w-full px-4 py-3 text-center tracking-widest rounded-xl bg-(--bg-glass) border border-(--border-main) text-(--text-main)"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={handleCancelOtp}
              className="w-full py-3 rounded-xl bg-(--bg-glass) text-(--text-main)"
            >
              Cancel
            </button>

            <p
              onClick={resendOtp}
              className="text-(--accent-primary) text-center text-sm cursor-pointer hover:underline"
            >
              Resend OTP
            </p>
          </form>
        )}
      </div>
    </section>
  );
}