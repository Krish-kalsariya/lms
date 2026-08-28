/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CTA = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

  return (
    <section
      className="
        relative 
        py-12 sm:py-20 md:py-24
        bg-(--bg-main)
        transition-colors duration-300
      "
    >
      {/* DARK MODE GLOW ONLY */}
      <div
        className="
          absolute inset-0 pointer-events-none
          hidden dark:block
          bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.25),transparent_65%)]
        "
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <div
          className="
            text-center
            rounded-2xl sm:rounded-3xl
            bg-(--bg-glass)
            border border-(--border-main)
            backdrop-blur-xl
            shadow-(--shadow-soft)
            px-5 py-12 
            sm:px-10 sm:py-16 
            md:px-12 md:py-20
            transition-all duration-300
          "
        >
          {/* TITLE */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6">
            <span className="bg-linear-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
              Start Learning Today
            </span>
          </h2>

          {/* DESCRIPTION */}
          <p className="text-(--text-muted) text-sm sm:text-base md:text-lg mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto">
            Join thousands of students building real-world skills and launching
            successful careers.
          </p>

          {/* BEFORE LOGIN */}
          {!user && (
            <Link
              to="/register"
              className="
                inline-flex items-center justify-center
                rounded-xl 
                px-8 py-3 
                sm:px-10 sm:py-4
                font-semibold text-white
                bg-linear-to-r from-violet-600 to-cyan-500
                shadow-[0_0_35px_rgba(124,58,237,0.6)]
                transition-all duration-300
                hover:scale-[1.06]
                hover:shadow-[0_0_55px_rgba(124,58,237,0.9)]
                active:scale-100
              "
            >
              Join Now
            </Link>
          )}

          {/* AFTER LOGIN */}
          {user && (
            <Link
              to="/courses"
             className="
                inline-flex items-center justify-center
                rounded-xl 
                px-8 py-3 
                sm:px-10 sm:py-4
                font-semibold text-white
                bg-linear-to-r from-violet-600 to-cyan-500
                shadow-[0_0_35px_rgba(124,58,237,0.6)]
                transition-all duration-300
                hover:scale-[1.06]
                hover:shadow-[0_0_55px_rgba(124,58,237,0.9)]
                active:scale-100
              "
            >
              Go to Courses
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default CTA;
