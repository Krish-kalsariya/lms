/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import {
  Megaphone,
  Send,
  Clock,
  Trash2,
  Edit,
  Save,
  Pin,
} from "lucide-react";
import toast from "react-hot-toast";

const AddAnnouncement = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [announcements, setAnnouncements] = useState([]);
  const [fetching, setFetching] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");

  // 🔹 Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      setFetching(true);
      const res = await api.get("/announcements/instructor");
      setAnnouncements(res.data || []);
    } catch (err) {
      console.error("Failed to fetch announcements", err);
      toast.error("Failed to fetch announcements", { duration: 1500 });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // 🔹 Create
  const submitHandler = async () => {
    if (!title || !message) {
      toast.error("All fields are required", { duration: 1200 });
      return;
    }

    try {
      setLoading(true);

      await api.post("/announcements", { title, message });

      setTitle("");
      setMessage("");
      fetchAnnouncements();

      toast.success("Announcement posted successfully 🎉", {
        duration: 1500,
      });
    } catch (error) {
      toast.error("Failed to post announcement", { duration: 1500 });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete
  const deleteHandler = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium">
          Are you sure you want to delete this announcement?
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancel
          </button>

          <button
            onClick={async () => {
              try {
                await api.delete(`/announcements/${id}`);
                fetchAnnouncements();
                toast.success("Announcement deleted successfully", {
                  duration: 1500,
                });
              } catch (error) {
                toast.error("Failed to delete announcement", {
                  duration: 1500,
                });
              } finally {
                toast.dismiss(t.id);
              }
            }}
            className="px-3 py-1 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  // 🔹 Start edit
  const startEdit = (item) => {
    setEditingId(item._id);
    setEditTitle(item.title);
    setEditMessage(item.message);
    toast("Editing mode enabled ✏️", { duration: 1000 });
  };

  // 🔹 Save edit
  const saveEdit = async (id) => {
    try {
      await api.put(`/announcements/${id}`, {
        title: editTitle,
        message: editMessage,
      });
      setEditingId(null);
      fetchAnnouncements();
      toast.success("Announcement updated successfully", {
        duration: 1500,
      });
    } catch (error) {
      toast.error("Failed to update announcement", {
        duration: 1500,
      });
    }
  };

  // 🔹 Toggle pin
  const togglePin = async (id) => {
    try {
      await api.patch(`/announcements/${id}/pin`);
      fetchAnnouncements();
      toast.success("Pin status updated ", { duration: 1200 });
    } catch (error) {
      toast.error("Failed to update pin status", {
        duration: 1500,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 md:mt-10 px-3 md:px-6 space-y-8 md:space-y-10">
      {/* ================= POST ================= */}
      <div
        className="
          bg-(--bg-surface)
          border border-(--border-main)
          rounded-2xl
          shadow-sm
          p-4 md:p-6
        "
      >
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="p-2 rounded-lg bg-(--accent-primary)/10">
            <Megaphone className="text-(--accent-primary)" />
          </div>
          <h2 className="text-lg md:text-xl font-bold">
            Post Announcement
          </h2>
        </div>

        <input
          className="w-full mb-3 md:mb-4 rounded-xl bg-(--bg-glass) border px-4 py-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          rows={4}
          className="w-full mb-4 md:mb-6 rounded-xl bg-(--bg-glass) border px-4 py-3"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          onClick={submitHandler}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-(--accent-primary) text-white py-2.5 rounded-xl font-semibold text-sm md:text-base"
        >
          <Send size={18} />
          {loading ? "Posting..." : "Post Announcement"}
        </button>
      </div>

      {/* ================= HISTORY ================= */}
      <div>
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
          Past Announcements
        </h3>

        {fetching ? (
          <p className="text-sm text-(--text-muted)">Loading...</p>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-(--text-muted)">
            No announcements posted yet.
          </p>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {announcements.map((item) => (
              <div
                key={item._id}
                className="bg-(--bg-surface) border border-(--border-main) rounded-xl p-3 md:p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  {editingId === item._id ? (
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-(--bg-glass) border rounded px-3 py-1.5 text-sm"
                    />
                  ) : (
                    <h4 className="font-semibold text-sm md:text-base">
                      {item.isPinned && "📌 "}
                      {item.title}
                    </h4>
                  )}

                  <div className="flex justify-end sm:justify-start gap-3">
                    <button
                      onClick={() => togglePin(item._id)}
                      className="p-1 hover:bg-(--bg-glass) rounded"
                    >
                      <Pin size={16} />
                    </button>

                    {editingId === item._id ? (
                      <button
                        onClick={() => saveEdit(item._id)}
                        className="p-1 hover:bg-(--bg-glass) rounded"
                      >
                        <Save size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(item)}
                        className="p-1 hover:bg-(--bg-glass) rounded"
                      >
                        <Edit size={16} />
                      </button>
                    )}

                    <button
                      onClick={() => deleteHandler(item._id)}
                      className="p-1 hover:bg-red-500/10 rounded"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>

                {editingId === item._id ? (
                  <textarea
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    className="w-full bg-(--bg-glass) border rounded px-3 py-2 text-sm"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-(--text-muted) leading-relaxed">
                    {item.message}
                  </p>
                )}

                <div className="mt-2 flex items-center gap-1 text-xs text-(--text-muted)">
                  <Clock size={14} />
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddAnnouncement;
