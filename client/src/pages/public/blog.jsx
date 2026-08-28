import { Link } from "react-router-dom";
import { ArrowRight, User, Calendar } from "lucide-react";
import Footer from "../../components/footer";

export default function Blog() {
  const blogs = [
    {
      id: 1,
      title: "How Online Learning is Changing Education",
      author: "Admin",
      date: "Oct 12, 2024",
      excerpt: "Discover how digital platforms are reshaping education worldwide.",
    },
    {
      id: 2,
      title: "Top Skills to Learn in 2025",
      author: "Team LMS",
      date: "Nov 05, 2024",
      excerpt: "Future-proof your career with these in-demand skills.",
    },
    {
      id: 3,
      title: "Student Success Stories",
      author: "Community",
      date: "Dec 01, 2024",
      excerpt: "Real stories from learners who transformed their careers.",
    },
    {
      id: 4,
      title: "Why Project-Based Learning Matters",
      author: "LMS Experts",
      date: "Jan 10, 2025",
      excerpt: "Learn why hands-on projects improve real-world skills.",
    },
    {
      id: 5,
      title: "How to Stay Consistent While Learning Online",
      author: "Mentor Team",
      date: "Feb 14, 2025",
      excerpt: "Simple habits to stay focused and motivated.",
    },
    {
      id: 6,
      title: "Career Paths After Learning MERN Stack",
      author: "Industry Guide",
      date: "Mar 20, 2025",
      excerpt: "Explore job roles you can get after mastering MERN Stack.",
    },
  ];

  return (
    <>
      <section
        className="
          min-h-screen
          bg-(--bg-main)
          text-(--text-main)
          transition-colors duration-300
        "
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20">

          {/* HEADER */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1
              className="
                text-4xl md:text-5xl font-extrabold mb-6
                bg-linear-to-r from-violet-500 to-cyan-500
                bg-clip-text text-transparent
              "
            >
              Our Blog & Insights
            </h1>
            <p className="text-(--text-muted) text-lg leading-relaxed">
              Stay ahead with industry insights, learning tips, and success
              stories from our global community.
            </p>
          </div>

          {/* BLOG GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="
                  group flex flex-col justify-between
                  rounded-2xl
                  bg-(--bg-surface)
                  border border-(--border-main)
                  p-8
                  shadow-(--shadow-soft)
                  transition-all duration-300
                  hover:border-(--accent-primary)
                  hover:shadow-[0_0_30px_rgba(124,58,237,0.25)]
                "
              >
                <div>
                  {/* META */}
                  <div className="flex items-center gap-4 mb-4 text-xs font-medium uppercase tracking-widest">
                    <span className="flex items-center gap-1 text-(--accent-primary)">
                      <User size={14} /> {blog.author}
                    </span>
                    <span className="flex items-center gap-1 text-(--text-muted)">
                      <Calendar size={14} /> {blog.date || "2025"}
                    </span>
                  </div>

                  {/* TITLE */}
                  <h3
                    className="
                      text-xl font-bold mb-3
                      text-(--text-main)
                      group-hover:text-(--accent-secondary)
                      transition-colors line-clamp-2
                    "
                  >
                    {blog.title}
                  </h3>

                  {/* EXCERPT */}
                  <p className="text-(--text-muted) text-sm leading-relaxed mb-8 line-clamp-3">
                    {blog.excerpt}
                  </p>
                </div>

                {/* READ MORE */}
                <Link
                  to={`/blog/${blog.id}`}
                  className="
                    inline-flex items-center gap-2
                    text-(--accent-primary)
                    font-bold text-sm
                    hover:text-(--accent-secondary)
                    transition-all group/link
                  "
                >
                  Read Full Article
                  <ArrowRight
                    size={16}
                    className="group-hover/link:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>
         {/* FOOTER */}
      <Footer />
      </section>

     
    </>
  );
}
