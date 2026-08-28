import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import api from "../../api/axios.js";

export default function CreateCourse() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    customCategory: "",
    courseLevel: "Beginner",
    courseprice: "",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const categories = [
    "Web Development",
    "App Development",
    "UI/UX",
    "Data Science",
    "AI & ML",
    "Other",
  ];

  // ✅ HANDLE INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "courseprice") {
      const regex = /^\d{0,6}(\.\d{0,2})?$/;
      if (!regex.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  // ✅ FILE CHANGE
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  };

  // ✅ VALIDATION
  const validate = () => {
    let newErrors = {};

    if (!formData.courseTitle || formData.courseTitle.length < 5) {
      newErrors.courseTitle = "Title must be at least 5 characters";
    }

    if (!formData.subTitle || formData.subTitle.length < 10) {
      newErrors.subTitle = "Subtitle must be at least 10 characters";
    }

    if (!formData.description || formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    const price = parseFloat(formData.courseprice);

    if (price < 0) {
      newErrors.courseprice = "Price cannot be negative";
    }

    if (price > 123456) {
      newErrors.courseprice = "Price cannot exceed ₹123456.00";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ SUBMIT USING API INSTANCE
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "category" && formData.category === "Other") {
          data.append("category", formData.customCategory);
        } else {
          data.append(key, formData[key]);
        }
      });

      if (thumbnail) data.append("courseThumbnail", thumbnail);

      await api.post("/course/create", data);

      toast.success("🚀 Course created successfully!");
      navigate("/instructor/draft-courses");

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create course"
      );
    }
  };

  return (
    <>
      {loading && <Loader />}

      <div className="min-h-screen bg-(--bg-main) text-(--text-main) px-4 py-10 transition-colors">
        <div className="max-w-5xl mx-auto">

          <div className="mb-10">
            <h1 className="text-3xl font-bold">Create New Course</h1>
            <p className="text-(--text-muted) mt-1">
              Fill details carefully — these will be visible to students
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-10 rounded-3xl border border-(--border-main) bg-(--bg-surface) p-8 shadow-xl"
          >

            {/* THUMBNAIL */}
            <div>
              <label className="label">Course Thumbnail</label>

              <div 
                onClick={() => !preview && fileInputRef.current?.click()}
                className={`rounded-2xl border border-dashed border-(--border-main) p-6 text-center hover:border-(--accent-primary) transition cursor-pointer ${preview ? '' : 'hover:bg-(--bg-glass)'}`}
              >
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="preview"
                      className="mx-auto h-52 w-full object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreview(null);
                        setThumbnail(null);
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
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </div>

            {/* BASIC INFO */}
            <div className="grid gap-6">
              <div>
                <label className="label">Course Title</label>
                <input
                  name="courseTitle"
                  value={formData.courseTitle}
                  onChange={handleChange}
                  className="input"
                />
                {errors.courseTitle && (
                  <p className="error">{errors.courseTitle}</p>
                )}
              </div>

              <div>
                <label className="label">Subtitle</label>
                <input
                  name="subTitle"
                  value={formData.subTitle}
                  onChange={handleChange}
                  className="input"
                />
                {errors.subTitle && (
                  <p className="error">{errors.subTitle}</p>
                )}
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  rows="4"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input"
                />
                {errors.description && (
                  <p className="error">{errors.description}</p>
                )}
              </div>
            </div>

            {/* CATEGORY / LEVEL / PRICE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div>
                <label className="label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="error">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="label">Level</label>
                <select
                  name="courseLevel"
                  value={formData.courseLevel}
                  onChange={handleChange}
                  className="input"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <div>
                <label className="label">Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="123456"
                  name="courseprice"
                  value={formData.courseprice}
                  onChange={handleChange}
                  className="input"
                />
                {errors.courseprice && (
                  <p className="error">{errors.courseprice}</p>
                )}
              </div>

            </div>

            {formData.category === "Other" && (
              <div>
                <label className="label">Custom Category</label>
                <input
                  name="customCategory"
                  value={formData.customCategory}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            )}

            <button
              disabled={loading}
              className={`w-full rounded-xl py-4 font-semibold text-lg transition
              ${
                loading
                  ? "bg-gray-600"
                  : "bg-(--accent-primary) hover:opacity-90"
              }`}
            >
              Create Course
            </button>

          </form>
        </div>

        <style jsx>{`
          .label {
            display: block;
            font-size: 0.875rem;
            color: var(--text-muted);
            margin-bottom: 0.25rem;
          }
          .input {
            width: 100%;
            background: var(--bg-main);
            border: 1px solid var(--border-main);
            border-radius: 0.75rem;
            padding: 0.75rem 1rem;
            outline: none;
            color: var(--text-main);
          }
          .input:focus {
            border-color: var(--accent-primary);
          }
          .error {
            font-size: 0.75rem;
            color: #f87171;
            margin-top: 0.25rem;
          }
        `}</style>
      </div>
    </>
  );
}