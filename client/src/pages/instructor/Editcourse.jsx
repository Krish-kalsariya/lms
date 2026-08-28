import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";  
import toast from "react-hot-toast";
import Loader from "../../components/Loader";

export default function EditCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    customCategory: "",
    courseLevel: "Beginner",
    courseprice: "",
    courseThumbnail: null,
  });

  const categories = [
    "Web Development",
    "App Development",
    "UI/UX",
    "Data Science",
    "AI & ML",
    "Other",
  ];

  /* ================= FETCH COURSE ================= */
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/course/${courseId}`); // ✅ changed

        const course = res.data.course;

        // Check if category is in predefined list
        const categoryList = [
          "Web Development",
          "App Development",
          "UI/UX",
          "Data Science",
          "AI & ML",
        ];
        const isCustomCategory = !categoryList.includes(course.category);

        setFormData({
          courseTitle: course.courseTitle || "",
          subTitle: course.subTitle || "",
          description: course.description || "",
          category: isCustomCategory ? "Other" : (course.category || ""),
          customCategory: isCustomCategory ? course.category : "",
          courseLevel: course.courseLevel || "Beginner",
          courseprice: course.courseprice ?? "",
          courseThumbnail: null,
        });

        if (course.courseThumbnail) {
          setPreview(course.courseThumbnail);
        }

      } catch (error) {
        toast.error("Failed to load course" , error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  /* ================= HANDLE INPUT CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= HANDLE FILE CHANGE ================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      courseThumbnail: file,
    }));

    setPreview(URL.createObjectURL(file));
  };

  /* ================= HANDLE SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      data.append("courseTitle", formData.courseTitle);
      data.append("subTitle", formData.subTitle);
      data.append("description", formData.description);
      if (formData.category === "Other") {
        data.append("category", formData.customCategory);
      } else {
        data.append("category", formData.category);
      }
      data.append("courseLevel", formData.courseLevel);
      data.append("courseprice", Number(formData.courseprice));

      if (formData.courseThumbnail) {
        data.append("courseThumbnail", formData.courseThumbnail);
      }

      await api.put(`/course/${courseId}`, data); // ✅ changed

      toast.success("Course updated successfully 🎉");
      navigate("/instructor/my-courses");

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update course"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-(--bg-main) py-8 px-4 text-(--text-main)">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Edit Course</h2>
          <p className="text-(--text-muted) mt-1">
            Update course details and manage content
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-(--border-main) bg-(--bg-surface) p-8 shadow-xl">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Thumbnail Preview */}
            {preview && (
              <div>
                <label className="block text-sm text-(--text-muted) mb-2">
                  Course Thumbnail
                </label>
                <img
                  src={preview}
                  alt="Thumbnail Preview"
                  className="h-48 w-full object-cover rounded-xl border border-(--border-main)"
                />
              </div>
            )}

            {/* Course Title */}
            <div>
              <label className="block text-sm text-(--text-muted) mb-2">
                Course Title
              </label>
              <input
                type="text"
                name="courseTitle"
                value={formData.courseTitle}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-(--bg-glass)
                           border border-(--border-main)
                           px-4 py-3 outline-none
                           focus:border-(--accent-primary)"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm text-(--text-muted) mb-2">
                Subtitle
              </label>
              <input
                type="text"
                name="subTitle"
                value={formData.subTitle}
                onChange={handleChange}
                className="w-full rounded-xl bg-(--bg-glass)
                           border border-(--border-main)
                           px-4 py-3 outline-none
                           focus:border-(--accent-primary)"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-(--text-muted) mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-xl bg-(--bg-glass)
                           border border-(--border-main)
                           px-4 py-3 outline-none
                           focus:border-(--accent-primary)"
              />
            </div>

            {/* Category & Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm text-(--text-muted) mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="custom-select w-full rounded-xl
               px-4 py-3 outline-none
               bg-theme-glass
               border border-theme
               focus:border-theme-accent"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-(--text-muted) mb-2">
                  Course Level
                </label>

                <select
                  name="courseLevel"
                  value={formData.courseLevel}
                  onChange={handleChange}
                  className="custom-select w-full rounded-xl
               px-4 py-3 outline-none
               bg-theme-glass
               border border-theme
               focus:border-theme-accent"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Custom Category - Full width, only show when Other is selected */}
            {formData.category === "Other" && (
              <div>
                <label className="block text-sm text-(--text-muted) mb-2">
                  Custom Category
                </label>
                <input
                  type="text"
                  name="customCategory"
                  value={formData.customCategory}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl bg-(--bg-glass)
                             border border-(--border-main)
                             px-4 py-3 outline-none
                             focus:border-(--accent-primary)"
                />
              </div>
            )}

            {/* Price */}
            <div>
              <label className="block text-sm text-(--text-muted) mb-2">
                Course Price (₹)
              </label>
              <input
                type="number"
                name="courseprice"
                min="0"
                value={formData.courseprice}
                onChange={handleChange}
                className="w-full rounded-xl bg-(--bg-glass)
                           border border-(--border-main)
                           px-4 py-3 outline-none
                           focus:border-(--accent-primary)"
              />
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm text-(--text-muted) mb-2">
                {preview ? "Change Thumbnail" : "Upload Thumbnail"}
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border border-dashed border-(--border-main) p-6 text-center hover:border-(--accent-primary) hover:bg-(--bg-glass) transition cursor-pointer"
              >
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Thumbnail Preview"
                      className="h-48 w-full object-cover rounded-xl border border-(--border-main)"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreview(null);
                        setFormData(prev => ({ ...prev, courseThumbnail: null }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 px-3 py-1 rounded-lg text-sm text-white"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-(--text-muted) mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-(--text-muted) text-sm">
                      Click to upload a course thumbnail
                    </p>
                    <p className="text-xs text-(--text-muted) mt-1">
                      Recommended: 1280×720 (PNG / JPG)
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl py-3 font-semibold transition ${
                loading
                  ? "bg-gray-600"
                  : "bg-(--accent-primary) hover:opacity-90"
              }`}
            >
              {loading ? "Updating Course..." : "Update Course"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}