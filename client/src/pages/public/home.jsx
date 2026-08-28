import Hero from "../../components/Home/Hero.jsx";
import Features from "../../components/Home/Features.jsx";
import PopularCourses from "../../components/Home/PopularCourses.jsx";
import Testimonials from "../../components/Home/Testimonials.jsx";
import HowItWorks from "../../components/Home/HowItWorks.jsx";
import CTA from "../../components/Home/CTA.jsx";
import Categories from "../../components/Home/Categories.jsx";
import Footer from "../../components/footer";

export default function Home() {
  return (
    <div
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
          absolute inset-0 pointer-events-none
          hidden dark:block
          bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.12),transparent_60%)]
        "
      />

      <div className="relative">

        {/* HERO */}
        <Hero />

        {/* POPULAR COURSES */}
        <section className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <PopularCourses />
          </div>
        </section>

        {/* FEATURES */}
        <section className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Features />
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Categories />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <HowItWorks />
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Testimonials />
          </div>
        </section>

        {/* CTA */}
        <section className="w-full">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <CTA />
          </div>
        </section>

        {/* FOOTER */}
        <Footer />
      </div>
    </div>
  );
}
