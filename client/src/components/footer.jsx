import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Facebook, Instagram, Linkedin } from "lucide-react";
import logo from "../assets/Brainera-logo.png";

export default function Footer() {
  return (
    <footer
      className="
        relative mt-16 sm:mt-20 lg:mt-24
        bg-(--bg-glass)
        border-t border-(--border-main)
        backdrop-blur-xl
        transition-colors duration-300
      "
    >
      {/* DARK MODE GLOW */}
      <div
        className="
          absolute inset-0 pointer-events-none
          hidden dark:block
          bg-[radial-gradient(circle_at_bottom,rgba(124,58,237,0.12),transparent_65%)]
        "
      />

      <div
        className="
          relative max-w-7xl mx-auto
          px-4 sm:px-6 lg:px-8
          py-10 sm:py-12 lg:py-14
          grid gap-10 sm:gap-12
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
        "
      >
        {/* BRAND */}
        <div className="text-center sm:text-left">
          <Link to="/" className="inline-flex items-center justify-center sm:justify-start mb-4 w-full sm:w-auto">
            <img
              src={logo}
              alt="Brainera Logo"
              className="h-12 sm:h-14 lg:h-15 w-auto object-contain"
            />
          </Link>

          <p className="text-(--text-muted) text-sm leading-relaxed max-w-sm mx-auto sm:mx-0">
            Learn at your own pace with industry-ready courses.
            Build real-world skills from anywhere.
          </p>

          {/* SOCIAL ICONS */}
          <div className="flex justify-center sm:justify-start gap-3 sm:gap-4 mt-6">
            {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="
                  p-2 rounded-lg
                  border border-(--border-main)
                  hover:border-(--accent-primary)
                  transition
                "
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="text-center sm:text-left">
          <h3 className="font-semibold mb-4 text-(--text-main)">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm text-(--text-muted)">
            <li>
              <Link to="/" className="hover:text-(--accent-primary)">
                Home
              </Link>
            </li>
            <li>
              <Link to="/courses" className="hover:text-(--accent-primary)">
                Courses
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-(--accent-primary)">
                About
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-(--accent-primary)">
                Blog
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-(--accent-primary)">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        {/* SUPPORT */}
        <div className="text-center sm:text-left">
          <h3 className="font-semibold mb-4 text-(--text-main)">
            Support
          </h3>
          <ul className="space-y-2 text-sm text-(--text-muted)">
            <li>
              <Link to="/help-center" className="hover:text-(--accent-primary)">
                Help Center
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-(--accent-primary)">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" className="hover:text-(--accent-primary)">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms-of-service" className="hover:text-(--accent-primary)">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        {/* CONTACT */}
        <div className="text-center sm:text-left">
          <h3 className="font-semibold mb-4 text-(--text-main)">
            Contact
          </h3>
          <p className="text-sm text-(--text-muted)">
            123 kdk Street
          </p>
          <p className="text-sm text-(--text-muted)">
            Surat City
          </p>
          <p className="text-sm text-(--text-muted) mt-2 wrap-break-word">
            support@Brainera.com
          </p>
          <p className="text-sm text-(--text-muted)">
            +91 111 222 3334
          </p>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-(--border-main)">
        <p className="text-center text-(--text-muted) py-4 sm:py-5 text-xs sm:text-sm px-4">
          © {new Date().getFullYear()} Brainera. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
