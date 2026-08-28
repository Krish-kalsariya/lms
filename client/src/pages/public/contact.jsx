import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Send, Mail, User } from "lucide-react";
import Footer from "../../components/footer";
import toast from "react-hot-toast";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    /* ================= VALIDATION ================= */

    // Name
    if (!name) {
      toast.error("Name is required");
      return;
    }

    if (name.length < 3) {
      toast.error("Name must be at least 3 characters");
      return;
    }

    if (!/^[A-Za-z ]+$/.test(name)) {
      toast.error("Name can contain only letters and spaces");
      return;
    }

    // Email
    if (!email) {
      toast.error("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Message
    if (!message) {
      toast.error("Message is required");
      return;
    }

    if (message.length < 10) {
      toast.error("Message must be at least 10 characters");
      return;
    }

    /* ================= SUBMIT ================= */

    try {
      setSending(true);
      await api.post("/contact", form);
      toast.success("Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const submitBtnClass =
    "w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all " +
    (sending
      ? "bg-[var(--bg-glass)] text-[var(--text-muted)] cursor-not-allowed"
      : "bg-linear-to-r from-violet-600 to-cyan-500 text-white hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] active:scale-[0.98]");

  return (
    <>
      <section className="relative min-h-screen bg-(--bg-main) flex items-center justify-center px-6 py-20 overflow-hidden transition-colors">

        {/* DARK MODE GLOW */}
        <div
          className="hidden dark:block pointer-events-none fixed z-0 w-100 h-100 rounded-full blur-[120px] bg-cyan-500/20 transition-transform"
          style={{ transform: `translate(${cursor.x - 200}px, ${cursor.y - 200}px)` }}
        />

        <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-5 rounded-3xl overflow-hidden bg-(--bg-surface) border border-(--border-main) backdrop-blur-2xl shadow-(--shadow-soft)">

          {/* LEFT */}
          <div className="lg:col-span-2 bg-linear-to-br from-violet-600 to-cyan-500 p-10 text-white flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
              <p className="text-white/80">
                Have questions about our industry-ready courses? We’re here to help.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/15 rounded-xl">
                  <Mail size={20} />
                </div>
                <span className="text-sm">support@brainera.com</span>
              </div>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 px-8 py-10 space-y-8">
            <div className="space-y-6">

              <div className="relative">
                <User size={18} className="absolute left-0 top-3 text-(--text-muted)" />
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className="w-full bg-transparent border-b border-(--border-main) text-(--text-main) pl-8 py-3 focus:outline-none focus:border-(--accent-primary)"
                />
              </div>

              <div className="relative">
                <Mail size={18} className="absolute left-0 top-3 text-(--text-muted)" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                  className="w-full bg-transparent border-b border-(--border-main) text-(--text-main) pl-8 py-3 focus:outline-none focus:border-(--accent-primary)"
                />
              </div>

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                required
                className="w-full bg-(--bg-glass) border border-(--border-main) rounded-2xl text-(--text-main) p-4 focus:outline-none focus:border-(--accent-primary)"
                placeholder="How can we help?"
              />
            </div>

            <button disabled={sending} className={submitBtnClass}>
              {sending ? "Sending..." : <>
                <Send size={18} /> Send Message
              </>}
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
}