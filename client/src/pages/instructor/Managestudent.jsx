import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import api from "../../api/axios";  
export default function ManageStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewStudentCourses, setViewStudentCourses] = useState(null);

  /* ================= PAGINATION STATE ================= */
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 5; // standard value for better UX

  /* ================= FETCH STUDENTS ================= */
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/users/students");

        if (res.data.success) {
          setStudents(res.data.students || []);
          setFilteredStudents(res.data.students || []);
        } else {
          setError("Failed to fetch students");
          toast.error("Failed to fetch students");
        }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          "Server error while fetching students";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  /* ================= SEARCH FUNCTION ================= */
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, students]);

  /* ================= TOGGLE STATUS ================= */
  const toggleStatus = async (studentId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "deactive" : "active";

    try {
      await api.patch(`/users/${studentId}/status`, { status: newStatus });

      setStudents((prev) =>
        prev.map((student) =>
          student._id === studentId
            ? { ...student, status: newStatus }
            : student
        )
      );

      toast.success(
        `Student ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully ✔`
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update student status"
      );
    }
  };

  /* ================= PAGINATION LOGIC ================= */
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ================= NEW IMPROVED PAGINATION UI ================= */
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-6 border-t border-(--border-main)">
        <p className="text-sm text-(--text-muted)">
          Showing <span className="font-semibold text-(--text-main)">{indexOfFirstStudent + 1}</span> to <span className="font-semibold text-(--text-main)">{Math.min(indexOfLastStudent, filteredStudents.length)}</span> of <span className="font-semibold text-(--text-main)">{filteredStudents.length}</span> students
        </p>
        
        <div className="flex items-center gap-1">
          {/* Prev Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border transition-all ${
              currentPage === 1
                ? "opacity-30 cursor-not-allowed border-gray-700"
                : "hover:bg-indigo-500/10 border-(--border-main) text-indigo-400"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>

          {/* Page Numbers - Limited for better UI */}
          <div className="flex items-center gap-1 px-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .map((page, index, array) => (
                <div key={page} className="flex items-center">
                  {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 text-(--text-muted)">...</span>}
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`min-w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                      currentPage === page
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                        : "hover:bg-indigo-500/10 text-(--text-muted) hover:text-indigo-400"
                    }`}
                  >
                    {page}
                  </button>
                </div>
              ))}
          </div>

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg border transition-all ${
              currentPage === totalPages
                ? "opacity-30 cursor-not-allowed border-gray-700"
                : "hover:bg-indigo-500/10 border-(--border-main) text-indigo-400"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    );
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-3 md:p-8 bg-(--bg-main) min-h-screen text-(--text-main)">
      <div className="max-w-7xl mx-auto bg-(--bg-surface) rounded-2xl shadow-xl border border-(--border-main) overflow-hidden">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-6 border-b border-(--border-main) bg-white/5">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Manage Students</h2>
            <p className="text-sm text-(--text-muted) mt-1">Review and control student access</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-72 px-4 py-2.5 pl-10 bg-(--bg-glass) border border-(--border-main) rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex items-center justify-center bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-xl text-xs font-bold border border-indigo-500/20">
              {filteredStudents.length} Total
            </div>
          </div>
        </div>

        {error && (
          <div className="m-6 p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm italic">
             {error}
          </div>
        )}

        {/* TABLE CONTENT */}
        <div className="overflow-x-auto">
          {filteredStudents.length === 0 && !error ? (
            <div className="py-20 text-center text-(--text-muted)">
              <p className="text-lg">No students match your criteria.</p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <table className="hidden md:table w-full text-sm">
                <thead className="bg-white/2 text-(--text-muted)">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium">Student Info</th>
                    <th className="px-6 py-4 text-left font-medium">Enrolled Courses</th>
                    <th className="px-6 py-4 text-center font-medium">Status</th>
                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border-main)">
                  {currentStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-linear-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold overflow-hidden">
                            {student.photoUrl ? (
                              <img
                                src={student.photoUrl}
                                alt={student.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              student.name?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-base">{student.name}</div>
                            <div className="text-xs text-(--text-muted)">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {student.enrolledCourses?.length > 0 ? (
                          <button
                            onClick={() => setViewStudentCourses(student)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded hover:bg-indigo-500/20 transition-colors text-xs font-bold"
                          >
                            <Eye size={14} />
                            View ({student.enrolledCourses.length})
                          </button>
                        ) : (
                          <span className="text-(--text-muted) italic text-xs">No active courses</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          student.status === "active" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => toggleStatus(student._id, student.status)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                            student.status === "active" 
                              ? "border-red-500/20 text-red-400 hover:bg-red-500/10" 
                              : "border-green-500/20 text-green-400 hover:bg-green-500/10"
                          }`}
                        >
                          {student.status === "active" ? "Block Access" : "Grant Access"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* MOBILE LIST */}
              <div className="md:hidden p-4 space-y-4">
                {currentStudents.map((student) => (
                  <div key={student._id} className="p-4 bg-white/5 border border-(--border-main) rounded-2xl">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-linear-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold overflow-hidden">
                          {student.photoUrl ? (
                            <img
                              src={student.photoUrl}
                              alt={student.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            student.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold">{student.name}</h3>
                          <p className="text-xs text-(--text-muted)">{student.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        student.status === "active" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      }`}>
                        {student.status}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleStatus(student._id, student.status)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        student.status === "active" ? "border-red-500/20 text-red-400" : "border-green-500/20 text-green-400"
                      }`}
                    >
                      {student.status === "active" ? "Block Student" : "Activate Student"}
                    </button>
                  </div>
                ))}
              </div>

              {renderPagination()}
            </>
          )}
        </div>

        {/* COURSES MODAL */}
        {viewStudentCourses && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-(--bg-surface) rounded-2xl border border-(--border-main) shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-(--border-main)">
                <h3 className="font-bold text-lg">
                  {viewStudentCourses.name}'s Courses
                </h3>
                <button
                  onClick={() => setViewStudentCourses(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                <div className="space-y-2">
                  {viewStudentCourses.enrolledCourses.map((course) => (
                    <div
                      key={course._id}
                      onClick={() => {
                        navigate(`/instructor/view-course/${course._id}`);
                        setViewStudentCourses(null);
                      }}
                      className="flex items-center gap-3 p-3 bg-white/5 border border-(--border-main) rounded-xl cursor-pointer hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all"
                    >
                      <div className="h-12 w-12 rounded-lg bg-indigo-500/20 flex items-center justify-center overflow-hidden shrink-0">
                        {course.courseThumbnail ? (
                          <img
                            src={course.courseThumbnail}
                            alt={course.courseTitle}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Eye size={20} className="text-indigo-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{course.courseTitle}</p>
                        <p className="text-xs text-(--text-muted)">Click to view course</p>
                      </div>
                      <Eye size={16} className="text-(--text-muted)" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}