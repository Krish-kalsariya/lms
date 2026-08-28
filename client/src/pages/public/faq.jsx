import { useState } from "react";
import Footer from "../../components/footer";

export default function FAQ() {
  const faqs = [
    {
      question: "Is this LMS beginner friendly?",
      answer:
        "Yes. Our LMS is designed for beginners as well as advanced learners. Courses start from basic concepts and gradually move to advanced topics.",
    },
    {
      question: "Do I receive a certificate after completing a course?",
      answer:
        "Yes. You will receive a verified certificate of completion for every paid course you successfully finish.",
    },
    {
      question: "Can instructors create and publish courses?",
      answer:
        "Yes. Approved instructors can create, publish, and manage their own courses through the instructor dashboard.",
    },
    {
      question: "Can I access courses on mobile devices?",
      answer:
        "Absolutely. Our platform is fully responsive and works seamlessly on mobile, tablet, and desktop devices.",
    },
    {
      question: "Is there a refund policy?",
      answer:
        "Yes. We offer a 7-day refund policy if you are not satisfied with the course, provided less than 20% of the course has been completed.",
    },
    {
      question: "Are the courses updated regularly?",
      answer:
        "Yes. Our instructors continuously update course content to match the latest industry standards and technologies.",
    },
    {
      question: "Do you provide lifetime access to courses?",
      answer:
        "Yes. Once enrolled, you get lifetime access to the course materials, including future updates.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <section
        className="
          relative min-h-screen
          bg-(--bg-main)
          transition-colors duration-300
        "
      >
        {/* GLOW */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.15),transparent_60%)] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 py-24">
          {/* HEADER */}
          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5">
              <span className="bg-linear-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h1>
            <p className="text-(--text-muted) text-sm sm:text-base md:text-lg max-w-3xl mx-auto">
              Everything you need to know about our learning platform.
            </p>
          </div>

          {/* FAQ LIST */}
          <div className="space-y-5">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={index}
                  className={`
                    rounded-2xl
                    border border-(--border-main)
                    bg-(--bg-glass)
                    backdrop-blur-xl
                    transition-all duration-300
                    ${
                      isOpen
                        ? "shadow-[0_0_35px_rgba(124,58,237,0.35)]"
                        : "hover:shadow-[0_0_20px_rgba(124,58,237,0.15)]"
                    }
                  `}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-semibold text-(--text-main) text-sm sm:text-base">
                      {faq.question}
                    </span>

                    <span
                      className={`
                        text-2xl font-bold transition
                        ${
                          isOpen
                            ? "text-(--accent-primary) rotate-45"
                            : "text-cyan-400"
                        }
                      `}
                    >
                      +
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 text-(--text-muted) text-sm sm:text-base leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* FOOTER */}
        <Footer />
      </section>
    </>
  );
}
