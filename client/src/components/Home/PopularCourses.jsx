import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/Authcontext";
import { motion, useAnimation } from "framer-motion";
import { Star } from "lucide-react";

// Star Rating Component
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

      <span
        className={`${
          size === "sm" ? "text-xs" : "text-sm"
        } font-medium text-gray-700 dark:text-gray-300 ml-1`}
      >
        {(rating || 0).toFixed(1)}
      </span>

      <span className="text-xs text-gray-500 dark:text-gray-400">
        ({reviewCount || 0})
      </span>
    </div>
  );
};

const PopularCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const controls = useAnimation();
  const containerRef = useRef(null);

  // Slider Animation
  useEffect(() => {
    if (isPaused) {
      controls.stop();
    } else {
      controls.start({
        x: "-50%",
        transition: {
          duration: 90, // speed slow kari
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        },
      });
    }
  }, [isPaused, controls]);

  //  Fetch Courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/course/published-courses");

        const processedCourses = (res.data.course || []).map((course) => ({
          ...course,
          averageRating: course.averageRating || 0,
          totalReviews: course.totalReviews || 0,
        }));

        setCourses(processedCourses);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Click par slider stop
  const handleCardClick = () => {
    setIsPaused(true);

    setTimeout(() => {
      setIsPaused(false);
    }, 3000);
  };

  const loopCourses = [...courses, ...courses];

  return (
    <section
      className="
        relative 
        py-12 sm:py-16 md:py-20 lg:py-28 
        overflow-hidden
        bg-(--bg-main)
        transition-colors duration-300
      "
    >
      {/* Dark Glow */}
      <div
        className="
          absolute inset-0 pointer-events-none
          hidden dark:block
          bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.15),transparent_60%)]
        "
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 md:mb-16">
          <span className="bg-linear-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
            Newest Courses
          </span>
        </h2>

        {/* Loading */}
        {loading && (
          <p className="text-center text-(--text-muted)">
            Loading courses...
          </p>
        )}

        {!loading && courses.length > 0 && (
          <>
            {/* Fade Edges */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-12 sm:w-20 md:w-28 bg-linear-to-r from-(--bg-main) to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-12 sm:w-20 md:w-28 bg-linear-to-l from-(--bg-main) to-transparent z-10" />

            {/* Slider */}
            <div className="relative overflow-hidden">
              <motion.div
                ref={containerRef}
                className="flex gap-4 sm:gap-6 md:gap-8 w-max"
                animate={controls}
                initial={{ x: "0%" }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {loopCourses.map((course, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -12, scale: 1.04 }}
                    transition={{ type: "spring", stiffness: 220 }}
                    onClick={handleCardClick}
                    className="
                      min-w-65 sm:min-w-72 md:min-w-80 lg:min-w-96
                      rounded-xl sm:rounded-2xl
                      bg-(--bg-glass)
                      border border-(--border-main)
                      backdrop-blur-xl
                      p-4 sm:p-5 md:p-6
                      shadow-(--shadow-soft)
                      transition
                      hover:shadow-[0_0_40px_rgba(124,58,237,0.35)]
                    "
                  >
                    {/* Image */}
                    <div className="relative">
                      <img
                        src={course.courseThumbnail}
                        alt={course.courseTitle}
                        className="w-full h-36 sm:h-40 md:h-44 object-cover rounded-xl mb-3 sm:mb-4"
                      />

                      {course.courseprice === 0 && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          FREE
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-semibold text-(--text-main) truncate mb-1">
                      {course.courseTitle}
                    </h3>

                    {/* Rating */}
                    <div className="mb-2">
                      <StarRating
                        rating={course.averageRating}
                        reviewCount={course.totalReviews}
                        size="sm"
                      />
                    </div>

                    {/* Description */}
                    <p className="text-(--text-muted) text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4">
                      {course.subTitle || course.description}
                    </p>

                    {/* Info */}
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-(--accent-primary) text-sm sm:text-base">
                          ₹{course.courseprice || 0}
                        </span>

                        <span className="text-xs text-(--text-muted)">
                          {course.category || "Uncategorized"}
                        </span>
                      </div>

                      <span
                        className="
                          text-[10px] sm:text-xs 
                          px-2 sm:px-3 py-1 
                          rounded-full
                          bg-(--bg-glass)
                          border border-(--border-main)
                          text-(--text-muted)
                        "
                      >
                        {course.courseLevel || "Beginner"}
                      </span>
                    </div>

                    {/* Button */}
                    <Link
                      to={`/course/${course._id}`}
                      className="
                        block w-full text-center
                        rounded-lg sm:rounded-xl 
                        py-2.5 sm:py-3
                        font-semibold text-white text-sm sm:text-base
                        bg-linear-to-r from-violet-600 to-cyan-500
                        shadow-md
                        transition-all
                        hover:shadow-lg
                        hover:opacity-90
                      "
                    >
                      View Course
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* View All */}
            {user && (
              <div className="text-center mt-12 sm:mt-16 md:mt-20">
                <Link
                  to="/courses"
                  className="
                    inline-block 
                    px-6 sm:px-8 md:px-12 
                    py-3 sm:py-3.5 md:py-4 
                    rounded-lg sm:rounded-xl
                    font-semibold text-sm sm:text-base
                    bg-(--bg-glass)
                    border border-(--border-main)
                    text-(--text-main)
                    transition-all
                    hover:border-(--accent-primary)
                    hover:text-(--accent-primary)
                  "
                >
                  View All Courses →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default PopularCourses;