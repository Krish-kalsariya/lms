import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Calendar, BookOpen } from "lucide-react";
import Footer from "../../components/footer";

export default function BlogDetail() {
  const { id } = useParams();

  const blogData = {
    1: {
      title: "How Online Learning is Changing Education",
      author: "Admin",
      date: "Oct 12, 2024",
      content: `
Online learning has transformed education by removing geographical barriers and making quality education accessible to everyone.

With flexible schedules, students can learn at their own pace while balancing work and personal commitments.

Modern LMS platforms offer interactive videos, quizzes, real-world projects, and certifications that prepare learners for industry demands.
      `,
    },
    2: {
      title: "Top Skills to Learn in 2025",
      author: "Team LMS",
      date: "Nov 05, 2024",
      content: `
As technology evolves, skills like Full Stack Development, AI & ML, Cloud Computing, and Data Science are becoming essential.

Employers value problem-solving skills, project experience, and continuous learning over traditional degrees alone.
      `,
    },
    3: {
      title: "Student Success Stories",
      author: "Community",
      date: "Dec 01, 2024",
      content: `
Many learners have transitioned into tech careers through consistent learning, hands-on projects, and mentorship.

These success stories prove that dedication and the right guidance can change lives.
      `,
    },
    4: {
      title: "Why Project-Based Learning Matters",
      author: "LMS Experts",
      date: "Jan 10, 2025",
      content: `
Project-based learning helps students apply theory into practice. It improves problem-solving skills and job readiness.
      `,
    },
    5: {
      title: "How to Stay Consistent While Learning Online",
      author: "Mentor Team",
      date: "Feb 14, 2025",
      content: `
Consistency is key to online learning success. Small daily habits lead to big achievements.
      `,
    },
    6: {
      title: "Career Paths After Learning MERN Stack",
      author: "Industry Guide",
      date: "Mar 20, 2025",
      content: `
MERN developers can work as Full Stack Developers, Backend Engineers, or Frontend Specialists across industries.
      `,
    },
  };

  const blog = blogData[Number(id)];

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--bg-main)">
        <div className="text-xl font-semibold text-(--accent-primary)">
          Blog not found.
        </div>
      </div>
    );
  }

  return (
    <>
      <section
        className="
          relative min-h-screen
          bg-(--bg-main)
          text-(--text-main)
          transition-colors duration-300
        "
      >
        {/* DARK MODE GLOW */}
        <div
          className="
            absolute top-0 left-1/2 -translate-x-1/2
            w-full max-w-4xl h-96
            hidden dark:block
            bg-violet-600/10 blur-[120px]
            pointer-events-none
          "
        />

        {/* HEADER */}
        <div className="relative z-10 border-b border-(--border-main)">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <Link
              to="/blog"
              className="
                inline-flex items-center gap-2 text-sm font-semibold
                text-(--accent-primary)
                hover:text-(--accent-secondary)
                transition-colors mb-8 group
              "
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Back to All Blogs
            </Link>

            <h1
              className="
                text-3xl sm:text-4xl md:text-5xl font-extrabold
                leading-tight mb-6
                bg-linear-to-r from-violet-500 to-cyan-500
                bg-clip-text text-transparent
              "
            >
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-(--text-muted)">
              <span className="flex items-center gap-2">
                <User size={16} className="text-(--accent-primary)" />
                Published by{" "}
                <span className="text-(--text-main) font-medium">
                  {blog.author}
                </span>
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={16} className="text-(--accent-primary)" />
                {blog.date}
              </span>
              <span className="flex items-center gap-2">
                <BookOpen size={16} className="text-(--accent-primary)" />
                5 min read
              </span>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
          <article
            className="
              rounded-4xl
              bg-(--bg-surface)
              border border-(--border-main)
              p-8 md:p-12
              shadow-(--shadow-soft)
            "
          >
            <div className="leading-relaxed text-lg space-y-8 text-(--text-muted)">
              {blog.content
                .trim()
                .split("\n\n")
                .map((para, index) => (
                  <p
                    key={index}
                    className="first-letter:text-3xl first-letter:font-bold
                               first-letter:text-(--accent-primary)"
                  >
                    {para}
                  </p>
                ))}
            </div>

            {/* BOTTOM BAR */}
            <div className="mt-16 pt-8 border-t border-(--border-main) flex justify-between items-center">
              <div className="flex gap-2">
                {["Education", "Tech"].map((tag) => (
                  <span
                    key={tag}
                    className="
                      px-3 py-1 rounded-full text-xs
                      bg-(--bg-glass)
                      border border-(--border-main)
                      text-(--text-muted)
                    "
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() =>
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }
                className="text-xs text-(--text-muted) hover:text-(--accent-primary)
                           underline underline-offset-4"
              >
                Scroll to top
              </button>
            </div>
          </article>
        </div>
          {/* FOOTER */}
      <Footer />
      </section>
    </>
  );
}
