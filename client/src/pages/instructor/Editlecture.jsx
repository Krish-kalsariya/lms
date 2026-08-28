import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios.js";

const EditLecture = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [isPreviewFree, setIsPreviewFree] = useState(false);
  const [video, setVideo] = useState(null);
  const [currentVideo, setCurrentVideo] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= LOAD EXISTING LECTURE ================= */
  useEffect(() => {
    const fetchLecture = async () => {
      try {
        const res = await api.get(`/course/${courseId}/lecture`);
        const lecture = res.data.lectures.find(
          (l) => l._id === lectureId
        );

        if (!lecture) {
          toast.error("Lecture not found");
          return;
        }

        setTitle(lecture.title);
        setIsPreviewFree(lecture.isPreviewFree);
        setCurrentVideo(lecture.videoInfo?.videoUrl || "");
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load lecture"
        );
      }
    };

    fetchLecture();
  }, [courseId, lectureId]);

  /* ================= UPDATE LECTURE ================= */
  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("isPreviewFree", isPreviewFree);

    if (video) {
      formData.append("video", video);
    }

    try {
      setLoading(true);

      await api.put(
        `/course/${courseId}/lecture/${lectureId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Lecture updated successfully");

      navigate(`/instructor/view-course/${courseId}`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Update failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--bg-main) px-3 sm:px-4 py-8 sm:py-10 text-(--text-main) transition-colors">
      <div className="w-full max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Edit Lecture
          </h2>
          <p className="text-(--text-muted) mt-1 text-sm sm:text-base">
            Update lecture details and replace video if needed
          </p>
        </div>

        {/* FORM CARD */}
        <div className="rounded-2xl border border-(--border-main) bg-(--bg-surface) p-4 sm:p-6 md:p-8 shadow-xl">
          <form onSubmit={submitHandler} className="space-y-5 sm:space-y-6">

            {/* TITLE */}
            <div>
              <label className="block text-sm text-(--text-muted) mb-2">
                Lecture Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Update lecture title"
                className="w-full rounded-xl bg-(--bg-glass)
                           border border-(--border-main)
                           px-3 sm:px-4 py-2.5 sm:py-3 outline-none
                           focus:border-(--accent-primary)"
              />
            </div>

            {/* PREVIEW TOGGLE */}
            <div className="flex items-center gap-2 sm:gap-3">
              <input
                type="checkbox"
                checked={isPreviewFree}
                onChange={(e) => setIsPreviewFree(e.target.checked)}
                className="h-4 w-4 accent-(--accent-primary)"
              />
              <span className="text-xs sm:text-sm text-(--text-muted)">
                Allow free preview for students
              </span>
            </div>

            {/* CURRENT VIDEO */}
            {currentVideo && (
              <div className="rounded-xl border border-(--border-main) bg-black/30 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-(--text-muted) mb-2">
                  Current Video
                </p>
                <video
                  src={currentVideo}
                  controls
                  className="w-full max-h-40 sm:max-h-48 md:max-h-56 rounded-lg border border-(--border-main)"
                />
              </div>
            )}

            {/* NEW VIDEO */}
            <div>
              <label className="block text-sm text-(--text-muted) mb-2">
                Replace Video (optional)
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideo(e.target.files[0])}
                className="w-full rounded-xl bg-(--bg-glass)
                           border border-(--border-main)
                           px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm"
              />
              <p className="text-xs text-(--text-muted) mt-1">
                Leave empty to keep existing video
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 rounded-xl py-2.5 sm:py-3 font-semibold transition text-sm sm:text-base ${
                  loading
                    ? "bg-gray-600"
                    : "bg-(--accent-primary) hover:opacity-90"
                }`}
              >
                {loading ? "Updating..." : "Update Lecture"}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(`/instructor/view-course/${courseId}`)
                }
                className="flex-1 rounded-xl border border-(--border-main)
                           py-2.5 sm:py-3 hover:bg-(--bg-glass) transition text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditLecture;