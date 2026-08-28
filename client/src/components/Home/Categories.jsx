import React from "react";
import { useNavigate } from "react-router-dom";

const Categories = () => {
  const navigate = useNavigate();

  const categories = [
    "Web Development",
    "Data Science",
    "Mobile Development",
    "UI / UX Design",
    "Cloud Computing",
    "AI & ML",
  ];

  const handleCategoryClick = (category) => {
    navigate(`/courses?category=${encodeURIComponent(category)}`);
  };

  return (
    <section
      className="
        relative py-12 sm:py-16 md:py-20 lg:py-24
        bg-(--bg-main)
        transition-colors duration-300
      "
    >
      {/* DARK MODE GLOW ONLY */}
      <div
        className="
          absolute inset-0 pointer-events-none
          hidden dark:block
          bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.15),transparent_60%)]
        "
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* TITLE */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-16">
          <span className="bg-linear-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
            Explore Categories
          </span>
        </h2>

        <div
          className="
            grid 
            grid-cols-1 
            sm:grid-cols-2 
            md:grid-cols-3 
            gap-4 sm:gap-6 md:gap-8
          "
        >
          {categories.map((cat) => (
            <div
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className="
                group cursor-pointer
                rounded-xl sm:rounded-2xl
                bg-(--bg-glass)
                border border-(--border-main)
                backdrop-blur-xl
                p-6 sm:p-7 md:p-8 
                text-center
                shadow-(--shadow-soft)
                transition-all duration-300
                hover:-translate-y-1
                hover:border-(--accent-primary)
                hover:shadow-[0_0_35px_rgba(124,58,237,0.35)]
              "
            >
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-(--text-main) group-hover:text-(--accent-primary) transition">
                {cat}
              </h3>

              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-(--text-muted)">
                Browse expert-led courses
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
