import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  SlidersHorizontal,
  Trash2,
  Edit3,
  Eye,
  IndianRupee,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Archive,
} from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import api from "../../api/axios";  
export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priceSort, setPriceSort] = useState("");
  const [openSort, setOpenSort] = useState(false);

  // Pagination - 9 courses per page
  const [currentPage, setCurrentPage] = useState(1);
  const COURSES_PER_PAGE = 9;

  const navigate = useNavigate();

  const getThumbnail = (thumbnail) => {
    if (!thumbnail)
      return "https://via.placeholder.com/400x225?text=No+Thumbnail";
    if (thumbnail.startsWith("http")) return thumbnail;
    return `http://localhost:3000/${thumbnail}`;
  };

  /* ================= FETCH COURSES ================= */
  useEffect(() => {
    const fetchCreatorCourses = async () => {
      try {
    
        const res = await api.get("/course/creator");

        const fetchedData = res.data.courses || res.data;

        const normalized = Array.isArray(fetchedData)
          ? fetchedData
              .filter((course) => course.isPublished === true) // Only show published courses
              .map((course) => ({
              ...course,
              courseThumbnail: getThumbnail(course.courseThumbnail),
              courseTitle: course.courseTitle || course.title || "",
              subTitle: course.subTitle || "",
              courseprice: Number(course.courseprice ?? course.price ?? 0),
            }))
          : [];

        setCourses(normalized);
      } catch {
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorCourses();
  }, []);

  /* ================= FILTER & SORT ================= */
  const filteredCourses = useMemo(() => {
    let data = [...courses];

    if (search.trim()) {
      const keyword = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.courseTitle.toLowerCase().includes(keyword) ||
          c.category?.toLowerCase().includes(keyword)
      );
    }

    if (priceSort === "low-high")
      data.sort((a, b) => a.courseprice - b.courseprice);

    if (priceSort === "high-low")
      data.sort((a, b) => b.courseprice - a.courseprice);

    if (priceSort === "free")
      data = data.filter((c) => c.courseprice === 0);

    return data;
  }, [courses, search, priceSort]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, priceSort]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * COURSES_PER_PAGE;
    const end = start + COURSES_PER_PAGE;
    return filteredCourses.slice(start, end);
  }, [filteredCourses, currentPage]);

  /* ================= DELETE ================= */
  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium">
          Are you sure you want to delete this course?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-sm rounded-lg bg-gray-200 dark:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              try {
                await api.delete(`/course/${id}`);
                setCourses((prev) => prev.filter((c) => c._id !== id));
                toast.success("Course deleted");
              } catch {
                toast.error("Delete failed");
              } finally {
                toast.dismiss(t.id);
              }
            }}
            className="px-3 py-1 text-sm rounded-lg bg-red-500 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  const handleUnpublish = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium">
          Are you sure you want to unpublish this course?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-sm rounded-lg bg-gray-200 dark:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              try {
                await api.patch(`/course/${id}`, { publish: false });
                setCourses((prev) => prev.filter((c) => c._id !== id));
                toast.success("Course moved to drafts");
              } catch {
                toast.error("Failed to unpublish course");
              } finally {
                toast.dismiss(t.id);
              }
            }}
            className="px-3 py-1 text-sm rounded-lg bg-yellow-500 text-white"
          >
            Unpublish
          </button>
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  const sortLabel =
    priceSort === ""
      ? "Sort: Default"
      : priceSort === "low-high"
      ? "Price: Low → High"
      : priceSort === "high-low"
      ? "Price: High → Low"
      : "Only Free";

  return (
    <div className="min-h-screen px-6 py-8 text-(--text-main)">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold">My Courses</h1>
          <p className="text-(--text-muted)">
            Manage and monitor your courses
          </p>
        </div>

        <button
          onClick={() => navigate("/instructor/create-course")}
          className="flex items-center gap-2 bg-(--accent-primary) px-6 py-3 rounded-xl"
        >
          <Plus size={20} />
          Create Course
        </button>
      </div>

      {/* SEARCH & SORT */}
      <div className="bg-(--bg-surface) p-4 rounded-2xl flex flex-col md:flex-row gap-4 mb-10 border">
        <div className="relative flex-1">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2"
          />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full pl-12 py-3 rounded-xl 
              bg-(--bg-glass) backdrop-blur-xl
              outline-none
            "
          />
        </div>

        {/* CUSTOM SORT DROPDOWN */}
        <div className="relative w-full md:w-64">
          <SlidersHorizontal
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2"
          />

          <button
            onClick={() => setOpenSort((o) => !o)}
            className="
              w-full pl-12 pr-10 py-3 rounded-xl 
              bg-(--bg-glass) backdrop-blur-xl
              border border-(--border-main)
              flex justify-between items-center
            "
          >
            {sortLabel}
            <ChevronDown size={18} />
          </button>

          {openSort && (
            <div
              className="
                absolute z-50 mt-2 w-full 
                bg-(--bg-glass) backdrop-blur-2xl
                border border-(--border-main)
                rounded-xl overflow-hidden shadow-xl
              "
            >
              {[
                { value: "", label: "Sort: Default" },
                { value: "low-high", label: "Price: Low → High" },
                { value: "high-low", label: "Price: High → Low" },
                { value: "free", label: "Only Free" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setPriceSort(opt.value);
                    setOpenSort(false);
                  }}
                  className="
                    w-full text-left px-4 py-3
                    hover:bg-white/10 dark:hover:bg-black/20
                    transition
                  "
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* COURSES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedCourses.map((course) => (
          <div
            key={course._id}
            className="bg-(--bg-surface) rounded-2xl overflow-hidden"
          >
            <img
              src={course.courseThumbnail}
              className="w-full h-52 object-cover"
            />

            <div className="p-6">
              <h2 className="font-bold text-lg line-clamp-1">
                {course.courseTitle}
              </h2>

              <p className="text-sm text-(--text-muted) line-clamp-2 mb-3">
                {course.subTitle}
              </p>

              <div className="flex items-center font-bold mb-4">
                <IndianRupee size={16} />
                {course.courseprice}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    navigate(`/instructor/view-course/${course._id}`)
                  }
                  className="p-2 border rounded-lg"
                >
                  <Eye size={18} />
                </button>

                <button
                  onClick={() =>
                    navigate(`/instructor/edit-course/${course._id}`)
                  }
                  className="flex-1 bg-(--accent-primary) hover:opacity-90 rounded-lg py-2 flex items-center justify-center gap-2"
                >
                  <Edit3 size={16} />
                  Edit
                </button>

                <button
                  onClick={() => handleUnpublish(course._id)}
                  className="p-2 border border-yellow-500 text-yellow-500 rounded-lg"
                  title="Move to Draft"
                >
                  <Archive size={18} />
                </button>

                <button
                  onClick={() => handleDelete(course._id)}
                  className="p-2 border border-red-500 text-red-500 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="p-2 border rounded-lg"
          >
            <ChevronLeft size={18} />
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === page
                    ? "bg-(--accent-primary) text-white"
                    : ""
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="p-2 border rounded-lg"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}