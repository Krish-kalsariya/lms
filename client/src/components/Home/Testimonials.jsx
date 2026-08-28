import React from "react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Tarsariya Kevin B.",
      role: "Full Stack Developer",
      message:
        "This Platform helped me crack my first developer job. The courses are very practical!",
    },
    {
      name: "Kachariya Dharmik K.",
      role: "Full Stack Developer",
      message:
        "The React and MERN courses are well structured and easy to follow.",
    },
    {
      name: "Kalsariya Krish G.",
      role: "Full Stack Developer",
      message:
        "Best learning platform for beginners. The instructors explain concepts clearly.",
    },
  ];

  return (
    <section
      className="
        relative 
        py-12 sm:py-16 md:py-20 lg:py-28
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
            What Our Students Say
          </span>
        </h2>

        {/* TESTIMONIAL GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="
                group rounded-xl sm:rounded-2xl
                bg-(--bg-glass)
                border border-(--border-main)
                backdrop-blur-xl
                p-5 sm:p-6 md:p-8
                shadow-(--shadow-soft)
                transition-all duration-300
                hover:-translate-y-1
                hover:border-(--accent-primary)
                hover:shadow-[0_0_35px_rgba(124,58,237,0.35)]
              "
            >
              <p className="text-(--text-muted) text-xs sm:text-sm md:text-base mb-6 sm:mb-8 leading-relaxed">
                “{item.message}”
              </p>

              <div className="pt-3 sm:pt-4 border-t border-(--border-main)">
                <h4 className="font-semibold text-(--text-main) group-hover:text-(--accent-primary) transition text-sm sm:text-base">
                  {item.name}
                </h4>
                <p className="text-(--text-muted) text-xs sm:text-sm">
                  {item.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
