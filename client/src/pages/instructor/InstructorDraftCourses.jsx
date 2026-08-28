import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import { useNavigate } from "react-router-dom";


const InstructorDraftCourses = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = async () => {
    try {
      const res = await api.get("/course/instructor/drafts");
      setCourses(res.data.courses || []);
    } catch {
      toast.error("Failed to load draft courses");
    } finally {
      setLoading(false);
    }
  };

const handlePublish = async (id) => {
  try {
    await api.patch(`/course/publish/${id}`);

    toast.success("Course published successfully 🚀");

    // ✅ Redirect after publish
    navigate("/instructor/my-courses");

  } catch (error) {
    toast.error("Failed to publish course" , error);
  }
};

  useEffect(() => {
    fetchDrafts();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-(--text-muted)">
        <Loader />
      </div>
    );
  }

  /* ================= EMPTY ================= */
  if (courses.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center border border-(--border-main) bg-(--bg-surface) rounded-2xl p-10 text-(--text-muted)">
          <p className="text-lg font-medium">No Draft Courses</p>
          <p className="text-sm mt-2">
            All your draft courses will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-main) text-(--text-main) p-4 sm:p-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Draft Courses</h2>
          <p className="text-(--text-muted) text-sm mt-1">
            Courses that are not yet published
          </p>
        </div>

        {/* GRID */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course._id}
              className="rounded-2xl border border-(--border-main) bg-(--bg-surface) p-5 shadow-lg hover:shadow-indigo-500/10 transition flex flex-col justify-between"
            >
              {/* INFO */}
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  {course.courseTitle}
                </h3>

                <span className="inline-block text-xs mt-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  Draft
                </span>
              </div>

              {/* ACTION */}
              <button
                onClick={() => handlePublish(course._id)}
                className="
                  mt-6 w-full py-2.5 rounded-xl font-semibold
                  bg-linear-to-r from-green-500 to-emerald-600
                  hover:from-green-600 hover:to-emerald-700
                  text-white transition active:scale-95
                "
              >
                Publish Course
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstructorDraftCourses;