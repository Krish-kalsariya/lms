import { useEffect, useState } from "react";
import {
  Mail,
  Clock,
  Trash2,
  MessageSquare,
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function InstructorContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get("/contact/messages");
        setMessages(res.data.messages || []);
      } catch {
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  /* ================= DELETE MESSAGE ================= */
  const handleDelete = async (id) => {
    toast(
      (t) => (
        <div className="flex items-center gap-4">
          <span className="text-sm">Delete this message?</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMessages((prev) =>
                  prev.filter((m) => m._id !== id)
                );
                toast.dismiss(t.id);
                toast.success("Message deleted ✔");
              }}
              className="px-3 py-1 text-xs rounded bg-red-600 text-white"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-xs rounded bg-gray-700 text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 5000 }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-(--bg-main) flex flex-col items-center justify-center px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-(--accent-primary) border-t-transparent mb-4" />
        <p className="text-(--text-muted)">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-main) text-(--text-main) px-3 sm:px-4 py-8 transition-colors">
      <div className="max-w-6xl mx-auto">

        {/* HEADER - MOBILE IMPROVED */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="text-(--accent-primary)" size={26} />
              Student Messages
            </h1>
            <p className="text-(--text-muted) mt-1 text-sm">
              You have {messages.length} student inquiries
            </p>
          </div>

          <span className="self-start md:self-center rounded-full border border-(--border-main) bg-(--accent-soft) px-4 py-2 text-xs sm:text-sm text-(--accent-primary)">
            Instructor Inbox
          </span>
        </div>

        {/* EMPTY STATE */}
        {messages.length === 0 ? (
          <div className="rounded-3xl border border-(--border-main) bg-(--bg-surface) p-10 sm:p-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-(--accent-soft)">
              <Mail className="text-(--accent-primary)" size={32} />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold">
              No messages yet
            </h2>
            <p className="text-(--text-muted) mt-2 max-w-sm mx-auto text-sm">
              When students contact you, their messages will appear here.
            </p>
          </div>
        ) : (
          /* MESSAGE LIST */
          <div className="space-y-5 sm:space-y-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className="group relative overflow-hidden rounded-2xl
                           border border-(--border-main)
                           bg-(--bg-surface)
                           p-4 sm:p-6 transition-all
                           hover:border-(--accent-primary)
                           hover:shadow-xl"
              >
                {/* Accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-(--accent-primary) opacity-0 group-hover:opacity-100 transition" />

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6">
                  {/* Left - MOBILE IMPROVED */}
                  <div className="flex gap-3 sm:gap-4 items-start">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-full
                                    bg-linear-to-br from-violet-600 to-cyan-500
                                    flex items-center justify-center
                                    font-bold text-base sm:text-lg text-white">
                      {msg.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold truncate">
                        {msg.name}
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-(--text-muted)">
                        <span className="flex items-center gap-1 break-all">
                          <Mail size={12} />
                          {msg.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Actions (UNCHANGED) */}
                  <div className="hidden lg:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                   
                    <button
                      onClick={() => handleDelete(msg._id)}
                      className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* MESSAGE - MOBILE IMPROVED */}
                <div className="mt-4 sm:mt-5 rounded-xl border border-(--border-main) bg-(--bg-glass) p-3 sm:p-4">
                  <p className="text-(--text-main) leading-relaxed italic text-sm sm:text-base">
                    “{msg.message}”
                  </p>
                </div>

                {/* Mobile Actions - BIGGER TOUCH TARGETS */}
                <div className="mt-4 flex justify-end gap-6 border-t border-(--border-main) pt-4 lg:hidden">
                  
                  <button
                    onClick={() => handleDelete(msg._id)}
                    className="flex items-center gap-1 text-red-400 font-medium text-sm"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
