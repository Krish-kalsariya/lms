import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  Link,
} from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios.js";

/* ================= DISPLAY LECTURES ================= */
const CourseLectures = () => {
  const { courseId } = useParams();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const res = await api.get(`/course/${courseId}/lecture`);
        setLectures(res.data.lectures || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load lectures"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchLectures();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-(--bg-main) flex items-center justify-center text-(--text-muted)">
        Loading lectures...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-main) text-(--text-main) px-4 py-10 transition-colors">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold">Course Lectures</h2>
            <p className="text-(--text-muted) text-sm mt-1">
              Manage and preview your course content
            </p>
          </div>

          <Link
            to={`/course/${courseId}/create-lecture`}
            className="inline-flex items-center justify-center rounded-xl
                       bg-(--accent-primary) px-5 py-3 font-semibold
                       hover:opacity-90 transition"
          >
            + Add Lecture
          </Link>
        </div>

        {/* EMPTY STATE */}
        {lectures.length === 0 ? (
          <div className="rounded-3xl border border-(--border-main) bg-(--bg-surface) p-16 text-center">
            <p className="text-(--text-muted)">
              No lectures added yet. Start by creating your first lecture.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lectures.map((lec, index) => (
              <div
                key={lec._id}
                className="rounded-2xl border border-(--border-main)
                           bg-(--bg-surface) p-5
                           transition
                           hover:border-(--accent-primary)
                           hover:shadow-xl"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold">
                    {index + 1}. {lec.title}
                  </h4>

                  {lec.isPreviewFree && (
                    <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full">
                      Free Preview
                    </span>
                  )}
                </div>

                <video
                  src={lec.videoInfo?.videoUrl}
                  controls
                  className="w-full rounded-xl border border-(--border-main) bg-black"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= CREATE LECTURE ================= */
const CreateLecture = () => {
  const { courseId } = useParams();
  const [title, setTitle] = useState("");
  const [video, setVideo] = useState(null);
  const [isPreviewFree, setIsPreviewFree] = useState(false);
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!video) {
      toast.error("Video required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("isPreviewFree", isPreviewFree);
    formData.append("video", video);

    try {
      setLoading(true);

      await api.post(`/course/${courseId}/lecture`, formData);

      toast.success("Lecture created successfully 🎉");

      setTitle("");
      setVideo(null);
      setIsPreviewFree(false);

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--bg-main) px-4 py-10 text-(--text-main) transition-colors">
      <div className="max-w-3xl mx-auto">

        <div className="mb-8">
          <h2 className="text-3xl font-bold">Create Lecture</h2>
          <p className="text-(--text-muted) mt-1">
            Upload video content for your course
          </p>
        </div>

        <div className="rounded-2xl border border-(--border-main) bg-(--bg-surface) p-8 shadow-xl">
          <form onSubmit={submitHandler} className="space-y-6">

            <div>
              <label className="block text-sm text-(--text-muted) mb-2">
                Lecture Title
              </label>
              <input
                type="text"
                className="w-full rounded-xl bg-(--bg-glass)
                           border border-(--border-main)
                           px-4 py-3 outline-none
                           focus:border-(--accent-primary)"
                placeholder="Example: Introduction to React"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-(--text-muted) mb-2">
                Upload Video
              </label>
              <input
                type="file"
                accept="video/*"
                className="w-full rounded-xl bg-(--bg-glass)
                           border border-(--border-main)
                           px-4 py-3"
                onChange={(e) => setVideo(e.target.files[0])}
                required
              />
              <p className="text-xs text-(--text-muted) mt-1">
                Supported formats: MP4, WebM
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isPreviewFree}
                onChange={(e) => setIsPreviewFree(e.target.checked)}
                className="h-4 w-4 accent-(--accent-primary)"
              />
              <span className="text-sm text-(--text-muted)">
                Allow free preview for students
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                disabled={loading}
                className={`flex-1 rounded-xl py-3 font-semibold transition ${
                  loading
                    ? "bg-gray-600"
                    : "bg-(--accent-primary) hover:opacity-90"
                }`}
              >
                {loading ? "Uploading..." : "Create Lecture"}
              </button>

              <Link
                to={`/course/${courseId}/lectures`}
                className="flex-1 text-center rounded-xl
                           border border-(--border-main)
                           py-3 hover:bg-(--bg-glass) transition"
              >
                Cancel
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

/* ================= ROUTES ================= */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/course/:courseId/lectures"
          element={<CourseLectures />}
        />
        <Route
          path="/course/:courseId/create-lecture"
          element={<CreateLecture />}
        />
      </Routes>
    </BrowserRouter>
  );
}