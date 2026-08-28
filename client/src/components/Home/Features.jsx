export default function Features() {
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
            Why Choose Our LMS?
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
          {/* FEATURE 1 */}
          <div
            className="
              group rounded-xl sm:rounded-2xl
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
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-(--text-main) group-hover:text-(--accent-primary) transition">
              Expert Instructors
            </h3>
            <p className="text-(--text-muted) text-xs sm:text-sm md:text-base">
              Learn from experienced developers and industry professionals.
            </p>
          </div>

          {/* FEATURE 2 */}
          <div
            className="
              group rounded-xl sm:rounded-2xl
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
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-(--text-main) group-hover:text-(--accent-primary) transition">
              Flexible Learning
            </h3>
            <p className="text-(--text-muted) text-xs sm:text-sm md:text-base">
              Access courses anytime, anywhere, on any device.
            </p>
          </div>

          {/* FEATURE 3 */}
          <div
            className="
              group rounded-xl sm:rounded-2xl
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
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-(--text-main) group-hover:text-(--accent-primary) transition">
              Certificates
            </h3>
            <p className="text-(--text-muted) text-xs sm:text-sm md:text-base">
              Get certified after completing your courses.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
