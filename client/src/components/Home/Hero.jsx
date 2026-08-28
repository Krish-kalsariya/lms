import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Example: check if user exists in localStorage (adjust for your auth system)
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

  return (
    <section
      className="
        relative 
        min-h-[80vh] sm:min-h-[85vh]
        flex items-center justify-center
        overflow-hidden
        bg-(--gradient-main)
        transition-colors duration-300
      "
    >
      {/* GLOW / AURORA (ONLY VISIBLE IN DARK MODE) */}
      <div
        className="
          absolute inset-0 pointer-events-none
          hidden dark:block
          bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.35),transparent_60%)]
        "
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {/* TITLE */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-6 leading-tight">
          <span className="bg-linear-to-r from-cyan-500 to-sky-500 bg-clip-text text-transparent">
            Learn Anytime,
          </span>
          <br />
          <span className="text-(--text-main)">Anywhere</span>
        </h1>

        {/* DESCRIPTION */}
        <p
          className="
            text-sm sm:text-lg md:text-xl
            max-w-3xl mx-auto mb-8 sm:mb-12
            text-(--text-muted)
          "
        >
          A modern learning platform to build real-world skills with
          industry-ready courses.
        </p>

        {/* CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
          {/* PRIMARY CTA - SHOW ONLY IF NOT LOGGED IN */}
          {!user && (
            <Link
              to="/register"
              className="
                inline-flex items-center justify-center
                px-6 py-3 sm:px-8 sm:py-4 
                rounded-xl font-semibold text-white
                bg-linear-to-r from-violet-600 to-cyan-500
                shadow-[0_0_30px_rgba(124,58,237,0.6)]
                transition-all duration-300
                hover:scale-105
                hover:shadow-[0_0_50px_rgba(124,58,237,0.9)]
              "
            >
              Get Started
            </Link>
          )}

          {/* SECONDARY CTA */}
          <Link
            to="/courses"
            className="
              inline-flex items-center justify-center
              px-6 py-3 sm:px-8 sm:py-4
              rounded-xl font-semibold
              text-(--text-main)
              bg-(--bg-glass)
              border border-(--border-main)
              backdrop-blur-md
              shadow-(--shadow-soft)
              transition-all duration-300
              hover:scale-105
              hover:text-(--accent-secondary)
              hover:border-(--accent-secondary)
              hover:bg-white/90
              dark:hover:bg-white/10
            "
          >
            Browse Courses
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
