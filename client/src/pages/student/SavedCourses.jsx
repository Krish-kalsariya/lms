import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Footer from "../../components/footer";

/* ================= CUSTOM SAVE ICON ================= */
const SaveIcon = ({ saved }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="transition">
    <rect
      x="1"
      y="1"
      width="22"
      height="22"
      rx="6"
      stroke="url(#grad)"
      strokeWidth="2"
      fill={saved ? "url(#gradLight)" : "transparent"}
    />
    <path
      d="M9 7h6v10l-3-2-3 2V7z"
      stroke={saved ? "#7C3AED" : "#A855F7"}
      strokeWidth="1.8"
      fill={saved ? "#7C3AED" : "none"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#EC4899" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient id="gradLight" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#FCE7F3" />
        <stop offset="100%" stopColor="#EDE9FE" />
      </linearGradient>
    </defs>
  </svg>
);
/* =================================================== */

const SavedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  /* FETCH SAVED COURSES */
  useEffect(() => {
    const fetchSavedCourses = async () => {
      try {
        const res = await api.get("/users/profile");
        setCourses(res.data.user?.savedCourses || []);
      } catch {
        toast.error("Failed to load saved courses");
      } finally {
        setLoading(false);
      }
    };
    fetchSavedCourses();
  }, []);

  /* UNSAVE */
  const handleUnsave = async (courseId) => {
    try {
      await api.delete(`/course/${courseId}/unsave`);
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
      toast.success("Course removed from saved");
    } catch {
      toast.error("Failed to unsave course");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-(--text-muted)">
        Loading saved courses...
      </div>
    );
  }

  return (
    <>
      <section
        className="
          min-h-screen
          bg-(--bg-main)
          text-(--text-main)
          px-6 py-16
          transition-colors duration-300
        "
      >
        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold">
              Saved{" "}
              <span className="bg-linear-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
                Courses
              </span>
            </h1>
            <p className="mt-3 text-(--text-muted)">
              Your bookmarked learning paths, all in one place.
            </p>
          </div>

          {/* EMPTY STATE */}
          {courses.length === 0 ? (
            <div
              className="
                rounded-3xl
                border border-(--border-main)
                bg-(--bg-glass)
                backdrop-blur-xl
                py-24 text-center
                text-(--text-muted)
              "
            >
              <p className="text-lg font-medium">
                You haven’t saved any courses yet.
              </p>
              <p className="text-sm mt-2">
                Explore courses and bookmark your favorites.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="
                    relative rounded-3xl overflow-hidden
                    border border-(--border-main)
                    bg-(--bg-glass)
                    backdrop-blur-xl
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:shadow-[0_0_40px_rgba(124,58,237,0.35)]
                  "
                >
                  {/* UNSAVE */}
                  <button
                    onClick={() => handleUnsave(course._id)}
                    className="
                      absolute top-4 right-4 z-10 p-1 rounded-lg
                      hover:bg-(--bg-glass) transition
                    "
                  >
                    <SaveIcon saved />
                  </button>

                  {/* IMAGE */}
                  <img
                    src={course.courseThumbnail}
                    alt={course.courseTitle}
                    className="h-44 w-full object-cover"
                  />

                  {/* CONTENT */}
                  <div className="p-6 space-y-3">
                    <h2 className="font-semibold text-lg line-clamp-1">
                      {course.courseTitle}
                    </h2>

                    <p className="text-sm text-(--text-muted) line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-bold text-(--accent-primary)">
                        {course.courseprice === 0
                          ? "FREE"
                          : `₹${course.courseprice}`}
                      </span>
                    </div>

                    <Link
                      to={`/course/${course._id}`}
                      className="
                        mt-4 block text-center py-2 rounded-xl
                        bg-linear-to-r from-violet-600 to-cyan-500
                        font-semibold text-white
                        transition hover:opacity-90
                      "
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      {/* FOOTER */}
      <Footer />
      </section>

    </>
  );
};

export default SavedCourses;
