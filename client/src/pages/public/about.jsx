/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import {
  CheckCircle,
  Lightbulb,
  Globe,
  Users,
  Rocket,
} from "lucide-react";
import Footer from "../../components/footer";

export default function AboutUs() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

  return (
    <div
      className="
        min-h-screen
        bg-(--bg-main)
        text-(--text-main)
        transition-colors duration-300
      "
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* HEADER */}
        <div className="mb-12 sm:mb-16">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6
                         bg-linear-to-r from-violet-500 to-cyan-500
                         bg-clip-text text-transparent"
          >
            About Our Brainera 
          </h1>

          <p className="text-(--text-muted) leading-relaxed text-base sm:text-lg md:text-xl max-w-3xl">
            Founded in 2026, our Learning Management System was built with a
            mission to make quality education{" "}
            <span className="text-(--accent-primary) font-semibold">
              accessible and affordable
            </span>{" "}
            for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start">
          {/* LEFT COLUMN */}
          <div className="space-y-8 sm:space-y-12">
            {/* VISION */}
            <section
              className="
                relative overflow-hidden
                rounded-2xl
                bg-(--bg-surface)
                border border-(--border-main)
                p-6 sm:p-8
                shadow-(--shadow-soft)
                transition
              "
            >
              <div
                className="
                  absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32
                  bg-violet-500/10
                  blur-3xl rounded-full
                "
              />
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <Rocket className="text-(--accent-secondary)" size={24} />
                Our Vision
              </h2>
              <p className="text-(--text-muted) text-base sm:text-lg leading-relaxed">
                To bridge the gap between education and industry by providing
                practical, project-based learning experiences.
              </p>
            </section>

            {/* WHY CHOOSE US */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Why Choose Us?</h2>
              <ul className="space-y-3 sm:space-y-4">
                {[
                  "Modern curriculum designed by experts",
                  "Flexible learning schedule",
                  "Affordable pricing",
                  "Dedicated student support",
                  "Interactive video lectures & quizzes",
                  "Certificate of completion for every course",
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 sm:gap-3 text-(--text-muted) text-base sm:text-lg"
                  >
                    <CheckCircle
                      className="text-(--accent-primary) shrink-0 mt-1"
                      size={18}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* RIGHT COLUMN – CORE VALUES */}
          <section className="grid grid-cols-1 gap-4 sm:gap-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 lg:hidden">
              Our Core Values
            </h2>

            {/* CARD 1 */}
            <div
              className="
                group rounded-2xl
                bg-(--bg-surface)
                border border-(--border-main)
                p-6 sm:p-8
                transition-all
                hover:border-(--accent-primary)
                hover:shadow-[0_0_30px_rgba(124,58,237,0.25)]
              "
            >
              <div
                className="
                  mb-3 sm:mb-4 p-2 sm:p-3 w-fit rounded-lg
                  bg-(--bg-glass)
                  group-hover:scale-110 transition-transform
                "
              >
                <Lightbulb className="text-yellow-400" size={20} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Innovation</h3>
              <p className="text-(--text-muted) text-sm sm:text-base">
                Continuously improving our platform with the latest
                technologies.
              </p>
            </div>

            {/* CARD 2 */}
            <div
              className="
                group rounded-2xl
                bg-(--bg-surface)
                border border-(--border-main)
                p-6 sm:p-8
                transition-all
                hover:border-(--accent-primary)
                hover:shadow-[0_0_30px_rgba(124,58,237,0.25)]
              "
            >
              <div
                className="
                  mb-3 sm:mb-4 p-2 sm:p-3 w-fit rounded-lg
                  bg-(--bg-glass)
                  group-hover:scale-110 transition-transform
                "
              >
                <Globe className="text-(--accent-secondary)" size={20} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Accessibility</h3>
              <p className="text-(--text-muted) text-sm sm:text-base">
                Making learning easy for everyone, anywhere, anytime.
              </p>
            </div>

            {/* CARD 3 */}
            <div
              className="
                group rounded-2xl
                bg-(--bg-surface)
                border border-(--border-main)
                p-6 sm:p-8
                transition-all
                hover:border-(--accent-primary)
                hover:shadow-[0_0_30px_rgba(124,58,237,0.25)]
              "
            >
              <div
                className="
                  mb-3 sm:mb-4 p-2 sm:p-3 w-fit rounded-lg
                  bg-(--bg-glass)
                  group-hover:scale-110 transition-transform
                "
              >
                <Users className="text-(--accent-primary)" size={20} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Community</h3>
              <p className="text-(--text-muted) text-sm sm:text-base">
                Building a strong support system for learners and instructors.
              </p>
            </div>
          </section>
        </div>

        {/* CTA SECTION WITH NEW LOGIC */}
        <section
          className="
            mt-16 sm:mt-24 text-center py-12 sm:py-16
            rounded-3xl sm:rounded-[2.5rem]
            bg-(--bg-surface)
            border border-(--border-main)
            shadow-(--shadow-soft)
          "
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4">
            Ready to Start Learning?
          </h2>
          <p className="text-(--text-muted) mb-6 sm:mb-8 text-base sm:text-lg px-4">
            Join thousands of learners who are transforming their careers.
          </p>

          {/* BEFORE LOGIN */}
          {!user && (
            <a
              href="/register"
              className="
                inline-block px-6 sm:px-8 py-3 sm:py-4 rounded-xl
                font-bold text-base sm:text-lg text-white
                bg-linear-to-r from-violet-600 to-cyan-500
                shadow-md
                hover:scale-105 hover:shadow-lg
                transition-all
              "
            >
              Get Started
            </a>
          )}

          {/* AFTER LOGIN */}
          {user && (
            <a
              href="/contact"
              className="
                inline-flex items-center justify-center
                rounded-xl 
                px-6 sm:px-8 md:px-10 py-3 sm:py-4
                font-semibold text-white
                bg-linear-to-r from-violet-600 to-cyan-500
                shadow-[0_0_35px_rgba(124,58,237,0.6)]
                transition-all duration-300
                hover:scale-[1.06]
                hover:shadow-[0_0_55px_rgba(124,58,237,0.9)]
                active:scale-100
                text-base sm:text-lg
              "
            >
              Go to Contact
            </a>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}