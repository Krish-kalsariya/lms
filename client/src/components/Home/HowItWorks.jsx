import React from "react";

const HowItWorks = () => {
  return (
    <section
      className="
        relative 
        py-12 sm:py-16 md:py-20 lg:py-24
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
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 md:mb-16">
          <span className="bg-linear-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
            How It Works
          </span>
        </h2>

        <div
          className="
            grid 
            grid-cols-1 
            sm:grid-cols-2 
            md:grid-cols-3 
            gap-4 sm:gap-6 md:gap-8 
            text-center
          "
        >
          {/* STEP 1 */}
          <div
            className="
              group rounded-xl sm:rounded-2xl
              bg-(--bg-glass)
              border border-(--border-main)
              backdrop-blur-xl
              p-6 sm:p-7 md:p-8
              shadow-(--shadow-soft)
              transition-all duration-300
              hover:-translate-y-1
              hover:border-(--accent-primary)
              hover:shadow-[0_0_35px_rgba(124,58,237,0.35)]
            "
          >
            <div
              className="
                mx-auto mb-4 sm:mb-5 
                flex h-10 w-10 sm:h-12 sm:w-12 
                items-center justify-center 
                rounded-full
                bg-linear-to-r from-violet-600 to-cyan-500
                text-white font-bold shadow-lg
              "
            >
              1
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-(--text-main) group-hover:text-(--accent-primary) transition">
              Register
            </h3>
            <p className="text-(--text-muted) text-xs sm:text-sm md:text-base">
              Create your free account and join our platform.
            </p>
          </div>

          {/* STEP 2 */}
          <div
            className="
              group rounded-xl sm:rounded-2xl
              bg-(--bg-glass)
              border border-(--border-main)
              backdrop-blur-xl
              p-6 sm:p-7 md:p-8
              shadow-(--shadow-soft)
              transition-all duration-300
              hover:-translate-y-1
              hover:border-(--accent-primary)
              hover:shadow-[0_0_35px_rgba(124,58,237,0.35)]
            "
          >
            <div
              className="
                mx-auto mb-4 sm:mb-5 
                flex h-10 w-10 sm:h-12 sm:w-12 
                items-center justify-center 
                rounded-full
                bg-linear-to-r from-violet-600 to-cyan-500
                text-white font-bold shadow-lg
              "
            >
              2
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-(--text-main) group-hover:text-(--accent-primary) transition">
              Learn
            </h3>
            <p className="text-(--text-muted) text-xs sm:text-sm md:text-base">
              Enroll in courses and learn at your own pace.
            </p>
          </div>

          {/* STEP 3 */}
          <div
            className="
              group rounded-xl sm:rounded-2xl
              bg-(--bg-glass)
              border border-(--border-main)
              backdrop-blur-xl
              p-6 sm:p-7 md:p-8
              shadow-(--shadow-soft)
              transition-all duration-300
              hover:-translate-y-1
              hover:border-(--accent-primary)
              hover:shadow-[0_0_35px_rgba(124,58,237,0.35)]
            "
          >
            <div
              className="
                mx-auto mb-4 sm:mb-5 
                flex h-10 w-10 sm:h-12 sm:w-12 
                items-center justify-center 
                rounded-full
                bg-linear-to-r from-violet-600 to-cyan-500
                text-white font-bold shadow-lg
              "
            >
              3
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-(--text-main) group-hover:text-(--accent-primary) transition">
              Get Certified
            </h3>
            <p className="text-(--text-muted) text-xs sm:text-sm md:text-base">
              Complete courses and earn certificates.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
