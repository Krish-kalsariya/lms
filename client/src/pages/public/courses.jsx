import { useEffect, useState, useRef, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import {
  Search,
  X,
  Filter,
  CheckCircle,
  Tag,
  Star,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import Footer from "../../components/footer";

/* ================= CUSTOM SAVE ICON ================= */
const SaveIcon = ({ saved }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
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

const CATEGORIES = [
  "Web Development",
  "App Development",
  "UI/UX",
  "Data Science",
  "AI & ML",
  "Other",
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const PRICE_FILTERS = ["all", "free", "paid"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "low", label: "Price: Low to High" },
  { value: "high", label: "Price: High to Low" },
  { value: "free", label: "Free First" },
  { value: "rating", label: "Highest Rated" },
];

// Pagination constant - 6 courses per page
const COURSES_PER_PAGE = 9;

// Star rating display component
const StarRating = ({ rating, reviewCount, size = "sm" }) => {
  const starSize = size === "sm" ? 12 : 14;
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={starSize}
            className={`${
              star <= (rating || 0)
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
      <span className={`${size === "sm" ? "text-xs" : "text-sm"} font-medium text-gray-700 dark:text-gray-300 ml-1`}>
        {(rating || 0).toFixed(1)}
      </span>
      <span className={`${size === "sm" ? "text-xs" : "text-xs"} text-gray-500 dark:text-gray-400`}>
        ({reviewCount || 0})
      </span>
    </div>
  );
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [savedCourses, setSavedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("newest");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [searchParams] = useSearchParams();
  // State for mobile filter dropdown
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  // State for custom sort dropdown
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const mobileFilterRef = useRef(null);
  const sortDropdownRef = useRef(null);

  /* URL CATEGORY */
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    if (urlCategory) setCategory(urlCategory);
  }, [searchParams]);

  /* FETCH COURSES */
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/course/published-courses");
        const coursesWithRatings = res.data.course || [];
        
        // Ensure each course has averageRating and totalReviews
        const processedCourses = coursesWithRatings.map(course => ({
          ...course,
          averageRating: course.averageRating || 0,
          totalReviews: course.totalReviews || 0,
        }));
        
        setCourses(processedCourses);
      } catch (error) {
        console.error("Failed to load courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  /* FETCH SAVED & ENROLLED COURSES */
  useEffect(() => {
    const fetchUserCourses = async () => {
      try {
        const res = await api.get("/users/profile");
        
        // Check different possible structures
        const user = res.data.user || res.data;
        
        // Handle saved courses
        let savedIds = [];
        if (user?.savedCourses) {
          if (Array.isArray(user.savedCourses)) {
            savedIds = user.savedCourses.map(c => c._id || c);
          }
        }
        
        // Handle enrolled courses
        let enrolledIds = [];
        if (user?.enrolledCourses) {
          if (Array.isArray(user.enrolledCourses)) {
            enrolledIds = user.enrolledCourses.map(c => c._id || c);
          }
        }
        
        if (user?.courses) {
          if (Array.isArray(user.courses)) {
            enrolledIds = [...enrolledIds, ...user.courses.map(c => c._id || c)];
          }
        }
        
        if (user?.enrolledCourseIds && Array.isArray(user.enrolledCourseIds)) {
          enrolledIds = [...enrolledIds, ...user.enrolledCourseIds];
        }
        
        setSavedCourses(savedIds);
        setEnrolledCourses(enrolledIds);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setSavedCourses([]);
        setEnrolledCourses([]);
      }
    };
    fetchUserCourses();
  }, []);

  /* SAVE / UNSAVE */
  const toggleSave = async (courseId) => {
    try {
      const isSaved = savedCourses.includes(courseId);
      if (isSaved) {
        await api.delete(`/course/${courseId}/unsave`);
        setSavedCourses((p) => p.filter((id) => id !== courseId));
        toast.success("Removed from saved");
      } else {
        await api.post(`/course/${courseId}/save`);
        setSavedCourses((p) => [...p, courseId]);
        toast.success("Course saved");
      }
    } catch {
      toast.error("Login required");
    }
  };

  /* FILTER + SORT */
  const filteredCourses = useMemo(() => {
    return [...courses]
      .filter((course) => {
        const matchSearch = course.courseTitle
          ?.toLowerCase()
          .includes(search.toLowerCase());

        const matchCategory =
          category === "all" || course.category === category;

        const matchLevel =
          level === "all" ||
          course.courseLevel?.toLowerCase() === level.toLowerCase();

        const matchPrice =
          price === "all"
            ? true
            : price === "free"
            ? course.courseprice === 0
            : course.courseprice > 0;

        return matchSearch && matchCategory && matchLevel && matchPrice;
      })
      .sort((a, b) => {
        if (sort === "low") return a.courseprice - b.courseprice;
        if (sort === "high") return b.courseprice - a.courseprice;
        if (sort === "free") {
          if (a.courseprice === 0 && b.courseprice > 0) return -1;
          if (a.courseprice > 0 && b.courseprice === 0) return 1;
          return a.courseprice - b.courseprice;
        }
        if (sort === "rating") {
          // Sort by rating (highest first), then by number of reviews
          if (b.averageRating !== a.averageRating) {
            return b.averageRating - a.averageRating;
          }
          return b.totalReviews - a.totalReviews;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [courses, search, category, level, price, sort]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, level, price, sort]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
  
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * COURSES_PER_PAGE;
    const end = start + COURSES_PER_PAGE;
    return filteredCourses.slice(start, end);
  }, [filteredCourses, currentPage]);

  /* Get active filters count */
  const activeFiltersCount = [
    category !== "all",
    level !== "all", 
    price !== "all",
    sort !== "newest"
  ].filter(Boolean).length;

  /* Get filter labels */
  const getFilterLabels = () => {
    const labels = [];
    
    if (category !== "all") {
      labels.push(`Category: ${category}`);
    }
    
    if (level !== "all") {
      labels.push(`Level: ${level.charAt(0).toUpperCase() + level.slice(1)}`);
    }
    
    if (price !== "all") {
      labels.push(`Price: ${price.charAt(0).toUpperCase() + price.slice(1)}`);
    }
    
    if (sort !== "newest") {
      const sortLabel = SORT_OPTIONS.find((opt) => opt.value === sort)?.label;
      labels.push(`Sort: ${sortLabel}`);
    }
    
    return labels;
  };

  /* Close mobile filter on outside click */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileFilterRef.current && !mobileFilterRef.current.contains(event.target)) {
        setShowMobileFilters(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get current sort label
  const currentSortLabel = SORT_OPTIONS.find((opt) => opt.value === sort)?.label || "Sort";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-theme-muted">Loading courses...</div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-theme text-theme relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.18),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Explore{" "}
            <span className="bg-linear-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Courses
            </span>
          </h1>
          <p className="text-theme-muted max-w-2xl mx-auto">
            Discover industry-ready courses crafted by expert instructors.
          </p>
        </div>

        {/* SEARCH AND SORT - WITH CUSTOM DROPDOWN */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted w-4 h-4 sm:w-5 sm:h-5" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="
                  w-full pl-10 pr-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl
                  bg-theme-glass
                  border border-theme
                  focus:border-theme-accent
                  outline-none
                  text-sm sm:text-base text-theme
                  placeholder:text-theme-muted/60
                "
              />
              {/* Clear search button */}
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-theme-accent/10"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-theme-muted hover:text-theme" />
                </button>
              )}
            </div>

            {/* Custom Sort Dropdown - FIXED FOR DARK MODE */}
            <div className="sm:w-48 relative" ref={sortDropdownRef}>
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="
                  w-full py-3 sm:py-4 px-4 rounded-xl sm:rounded-2xl
                  bg-theme-glass
                  border border-theme
                  focus:border-theme-accent
                  outline-none
                  text-sm sm:text-base text-theme
                  cursor-pointer
                  flex items-center justify-between
                "
              >
                <span>{currentSortLabel}</span>
                <ChevronDown 
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-theme-muted transition-transform duration-200 ${
                    isSortDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {/* Dropdown Menu */}
              {isSortDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 rounded-xl border border-theme bg-theme-glass backdrop-blur-xl shadow-lg overflow-hidden">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSort(option.value);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`
                        w-full px-4 py-3 text-left text-sm sm:text-base
                        hover:bg-theme-accent/10 transition-colors
                        ${sort === option.value 
                          ? 'text-theme-accent font-medium bg-theme-accent/5' 
                          : 'text-theme'
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACTIVE FILTERS DISPLAY */}
        {activeFiltersCount > 0 && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-theme-muted font-medium flex items-center gap-2">
                <Filter size={14} />
                Active Filters ({activeFiltersCount}):
              </span>
              {getFilterLabels().map((label, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-1 bg-theme-glass border border-theme-accent/30 text-theme-accent text-xs px-3 py-1.5 rounded-full"
                >
                  <Tag size={10} />
                  <span>{label}</span>
                  <button
                    onClick={() => {
                      if (label.startsWith("Category:")) setCategory("all");
                      else if (label.startsWith("Level:")) setLevel("all");
                      else if (label.startsWith("Price:")) setPrice("all");
                      else if (label.startsWith("Sort:")) setSort("newest");
                    }}
                    className="ml-1 text-theme-muted hover:text-theme"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {activeFiltersCount > 1 && (
                <button
                  onClick={() => {
                    setCategory("all");
                    setLevel("all");
                    setPrice("all");
                    setSort("newest");
                  }}
                  className="text-xs text-theme-muted hover:text-theme-accent underline ml-2"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        )}

        {/* MOBILE FILTER BUTTON - visible only on small screens */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-theme bg-theme-glass text-theme"
          >
            <span className="flex items-center gap-2">
              <Filter size={18} className="text-theme-accent" />
              <span className="font-medium">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-theme-accent text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </span>
            {showMobileFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {/* MOBILE FILTER DROPDOWN */}
          {showMobileFilters && (
            <div 
              ref={mobileFilterRef}
              className="mt-4 p-6 rounded-2xl border border-theme bg-theme-glass animate-slideDown"
            >
              {/* Category Filter */}
              <div className="mb-8">
                <h4 className="font-medium mb-3 text-theme">Category</h4>
                <div className="space-y-3 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="category" 
                      checked={category === "all"} 
                      onChange={() => setCategory("all")}
                      className="text-theme-accent"
                    />
                    <span className="text-theme-muted">All Categories</span>
                  </label>
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="category" 
                        checked={category === cat} 
                        onChange={() => setCategory(cat)}
                        className="text-theme-accent"
                      />
                      <span className="text-theme-muted">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div className="mb-8">
                <h4 className="font-medium mb-3 text-theme">Level</h4>
                <div className="space-y-3 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="level" 
                      checked={level === "all"} 
                      onChange={() => setLevel("all")}
                      className="text-theme-accent"
                    />
                    <span className="text-theme-muted">All Levels</span>
                  </label>
                  {LEVELS.map((lvl) => (
                    <label key={lvl} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="level" 
                        checked={level === lvl.toLowerCase()} 
                        onChange={() => setLevel(lvl.toLowerCase())}
                        className="text-theme-accent"
                      />
                      <span className="text-theme-muted">{lvl}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-8">
                <h4 className="font-medium mb-3 text-theme">Price</h4>
                <div className="space-y-3 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="price" 
                      checked={price === "all"} 
                      onChange={() => setPrice("all")}
                      className="text-theme-accent"
                    />
                    <span className="text-theme-muted">All</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="price" 
                      checked={price === "free"} 
                      onChange={() => setPrice("free")}
                      className="text-theme-accent"
                    />
                    <span className="text-theme-muted">Free</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="price" 
                      checked={price === "paid"} 
                      onChange={() => setPrice("paid")}
                      className="text-theme-accent"
                    />
                    <span className="text-theme-muted">Paid</span>
                  </label>
                </div>
              </div>

              {/* Clear Filters Button */}
              {(category !== "all" || level !== "all" || price !== "all") && (
                <button
                  onClick={() => {
                    setCategory("all");
                    setLevel("all");
                    setPrice("all");
                  }}
                  className="w-full py-2 text-sm border border-theme rounded-lg text-theme-muted hover:bg-theme transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
          {/* DESKTOP FILTER SIDEBAR - hidden on mobile, visible on lg */}
          <aside className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl border border-theme bg-theme-glass p-6">
              <div className="flex items-center gap-2 mb-6">
                <Filter size={18} className="text-theme-accent" />
                <h3 className="font-semibold">Filters</h3>
              </div>

              {/* Category Filter */}
              <div className="mb-8">
                <h4 className="font-medium mb-3 text-theme">Category</h4>
                <div className="space-y-3 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="category" 
                      checked={category === "all"} 
                      onChange={() => setCategory("all")}
                      className="text-theme-accent"
                    />
                    <span className="text-theme-muted">All Categories</span>
                  </label>
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="category" 
                        checked={category === cat} 
                        onChange={() => setCategory(cat)}
                        className="text-theme-accent"
                      />
                      <span className="text-theme-muted">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div className="mb-8">
                <h4 className="font-medium mb-3 text-theme">Level</h4>
                <div className="space-y-3 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="level" 
                      checked={level === "all"} 
                      onChange={() => setLevel("all")}
                      className="text-theme-accent"
                    />
                    <span className="text-theme-muted">All Levels</span>
                  </label>
                  {LEVELS.map((lvl) => (
                    <label key={lvl} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="level" 
                        checked={level === lvl.toLowerCase()} 
                        onChange={() => setLevel(lvl.toLowerCase())}
                        className="text-theme-accent"
                      />
                      <span className="text-theme-muted">{lvl}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-8">
                <h4 className="font-medium mb-3 text-theme">Price</h4>
                <div className="space-y-3 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="price" 
                      checked={price === "all"} 
                      onChange={() => setPrice("all")}
                      className="text-theme-accent"
                    />
                    <span className="text-theme-muted">All</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="price" 
                      checked={price === "free"} 
                      onChange={() => setPrice("free")}
                      className="text-theme-accent"
                    />
                    <span className="text-theme-muted">Free</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="price" 
                      checked={price === "paid"} 
                      onChange={() => setPrice("paid")}
                      className="text-theme-accent"
                    />
                    <span className="text-theme-muted">Paid</span>
                  </label>
                </div>
              </div>

              {/* Clear Filters Button */}
              {(category !== "all" || level !== "all" || price !== "all") && (
                <button
                  onClick={() => {
                    setCategory("all");
                    setLevel("all");
                    setPrice("all");
                  }}
                  className="w-full mt-6 py-2 text-sm border border-theme rounded-lg text-theme-muted hover:bg-theme transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </aside>

          {/* COURSES GRID */}
          <main className="lg:col-span-3">
            {/* Results Info */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <p className="text-theme-muted">
                Showing {paginatedCourses.length} of {filteredCourses.length} courses
                {filteredCourses.length > 0 && ` (Page ${currentPage} of ${totalPages})`}
              </p>
            </div>

            {/* Courses Grid */}
            {filteredCourses.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-theme-muted text-lg">No courses found. Try different filters.</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setCategory("all");
                    setLevel("all");
                    setPrice("all");
                    setSort("newest");
                  }}
                  className="mt-4 px-6 py-2 bg-theme-accent text-white rounded-lg hover:bg-theme-accent/90 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {paginatedCourses.map((course) => {
                    const courseId = course._id;
                    const isEnrolled = enrolledCourses.includes(courseId);
                    const isSaved = savedCourses.includes(courseId);
                    
                    return (
                      <div
                        key={courseId}
                        className="relative rounded-2xl overflow-hidden border border-theme bg-theme-glass hover:border-theme-accent/50 transition-all duration-300 hover:shadow-lg"
                      >
                        {/* Save Button */}
                        <button 
                          onClick={() => toggleSave(courseId)} 
                          className="absolute top-3 right-3 z-10 hover:scale-110 transition-transform"
                        >
                          <SaveIcon saved={isSaved} />
                        </button>

                        {/* Free Badge */}
                        {course.courseprice === 0 && (
                          <div className="absolute top-3 left-3 z-10">
                            <div className="flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                              <Tag size={10} />
                              <span>FREE</span>
                            </div>
                          </div>
                        )}

                        {/* Enrolled Badge */}
                        {isEnrolled && (
                          <div className="absolute top-3 left-3 z-10" style={course.courseprice === 0 ? { top: '3rem' } : {}}>
                            <div className="flex items-center gap-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              <CheckCircle size={10} />
                              <span>Enrolled</span>
                            </div>
                          </div>
                        )}

                        {/* Course Image */}
                        <div className="relative h-44 w-full overflow-hidden">
                          <img
                            src={course.courseThumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                            alt={course.courseTitle}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            {course.category || "Uncategorized"}
                          </div>
                          <div className="absolute bottom-2 right-2 bg-theme-accent text-white text-xs px-2 py-1 rounded">
                            {course.courseLevel || "Beginner"}
                          </div>
                        </div>

                        {/* Course Details */}
                        <div className="p-5">
                          <h3 className="font-semibold text-lg line-clamp-1 mb-1">
                            {course.courseTitle}
                          </h3>

                          {/* Rating Display */}
                          <div className="mb-2">
                            <StarRating 
                              rating={course.averageRating || 0} 
                              reviewCount={course.totalReviews || 0} 
                              size="sm"
                            />
                          </div>

                          <p className="text-sm text-theme-muted line-clamp-2 mb-4 min-h-10">
                            {course.description || "No description available"}
                          </p>

                          <div className="flex items-center justify-between mt-4">
                            <p className="text-xl font-bold text-theme-accent">
                              {course.courseprice === 0 ? "FREE" : `₹ ${course.courseprice}`}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-5">
                            <Link
                              to={`/course/${courseId}`}
                              className="text-center py-2 rounded-lg border border-theme hover:bg-theme transition-colors text-sm"
                            >
                              Details
                            </Link>
                            
                            {isEnrolled ? (
                              <Link
                                to={`/course/${courseId}`}
                                className="text-center py-2 rounded-lg bg-linear-to-r from-green-600 to-emerald-500 text-white font-semibold hover:opacity-90 transition-opacity text-sm"
                              >
                                Continue
                              </Link>
                            ) : (
                              <Link
                                to={`/course/${courseId}`}
                                className="text-center py-2 rounded-lg bg-linear-to-r from-violet-600 to-cyan-500 text-white font-semibold hover:opacity-90 transition-opacity text-sm"
                              >
                                Enroll
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`
                        p-2 rounded-lg border border-theme
                        ${currentPage === 1 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-theme-accent/10 cursor-pointer'
                        }
                        transition-colors
                      `}
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={20} className="text-theme" />
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`
                          w-10 h-10 rounded-lg border border-theme
                          ${currentPage === page 
                            ? 'bg-theme-accent text-white border-theme-accent' 
                            : 'hover:bg-theme-accent/10 text-theme'
                          }
                          transition-colors cursor-pointer
                        `}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`
                        p-2 rounded-lg border border-theme
                        ${currentPage === totalPages 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-theme-accent/10 cursor-pointer'
                        }
                        transition-colors
                      `}
                      aria-label="Next page"
                    >
                      <ChevronRight size={20} className="text-theme" />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </section>
  );
}