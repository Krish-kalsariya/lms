import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import api from "../../api/axios";  

export default function EnrolledStudents() {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get(
          `/course/${courseId}/enrolled-students`
        );

        setStudents(res.data.students || []);
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            "Failed to load enrolled students"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [courseId]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-(--text-muted)">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-main) text-(--text-main) px-3 sm:px-4 py-8 sm:py-10 transition-colors">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Enrolled Students
            </h1>
            <p className="text-(--text-muted) text-xs sm:text-sm mt-1">
              Students who have enrolled in this course
            </p>
          </div>

          <div className="mx-auto sm:mx-0 rounded-xl bg-(--accent-soft) border border-(--border-main) px-4 py-2 text-sm text-(--accent-primary) w-fit">
            Total Students:{" "}
            <span className="font-semibold">
              {students.length}
            </span>
          </div>
        </div>

        {/* EMPTY STATE */}
        {students.length === 0 ? (
          <div className="rounded-2xl border border-(--border-main) bg-(--bg-surface) p-8 sm:p-12 text-center text-(--text-muted)">
            <p className="text-base sm:text-lg font-medium">
              No students enrolled yet
            </p>
            <p className="text-xs sm:text-sm mt-2">
              Students will appear here once they enroll in this course.
            </p>
          </div>
        ) : (
          <>
            {/* TABLE (DESKTOP) */}
            <div className="hidden md:block rounded-2xl border border-(--border-main) bg-(--bg-surface) overflow-hidden shadow-xl">
              <table className="w-full text-sm">
                <thead className="bg-(--bg-glass) text-(--text-muted) uppercase text-xs">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">#</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">
                      Student
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">
                      Email
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">
                      Joined On
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr
                      key={student._id}
                      className="border-t border-(--border-main) hover:bg-(--bg-glass) transition"
                    >
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-(--text-muted)">
                        {index + 1}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 font-medium">
                        {student.name}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-(--text-muted)">
                        {student.email}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-(--text-muted)">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CARDS (MOBILE) */}
            <div className="md:hidden grid gap-3 sm:gap-4">
              {students.map((student, index) => (
                <div
                  key={student._id}
                  className="rounded-2xl border border-(--border-main) bg-(--bg-surface) p-4 sm:p-5 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm sm:text-base">
                      {student.name}
                    </p>
                    <span className="text-xs text-(--text-muted)">
                      #{index + 1}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-(--text-muted) mb-1">
                    {student.email}
                  </p>

                  <p className="text-xs text-(--text-muted)">
                    Joined on{" "}
                    {new Date(student.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}