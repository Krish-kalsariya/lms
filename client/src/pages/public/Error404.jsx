import { Link } from "react-router-dom";
import { Home, Search, ArrowLeft, AlertCircle } from "lucide-react";

const Error404 = () => {
  // Common search suggestions
  const popularLinks = [
    { name: "Home", path: "/" },
    { name: "Courses", path: "/courses" },
    { name: "About", path: "/about" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <div className="min-h-screen bg-gradient-theme flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl font-bold text-theme-accent hover:opacity-80 transition-opacity"
          >
            LMS
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {popularLinks.slice(1).map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-theme-muted hover:text-theme-accent transition-colors font-medium"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full text-center">
          {/* Error Code with Animation */}
          <div className="relative mb-8">
            <div className="text-[12rem] sm:text-[16rem] font-black leading-none">
              <span className="text-theme-accent/20">4</span>
              <span className="text-theme-accent">0</span>
              <span className="text-theme-accent/20">4</span>
            </div>
            
            {/* Animated circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-2 border-theme-accent/10 animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-theme-accent/5"></div>
            
            {/* Icon overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <AlertCircle className="w-32 h-32 text-theme-accent/30" strokeWidth={1} />
            </div>
          </div>

          {/* Message */}
          <h1 className="text-4xl sm:text-5xl font-bold text-theme mb-6">
            Page Not Found
          </h1>
          <p className="text-xl text-theme-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Oops! The page you're looking for seems to have wandered off into the digital void. 
            It might have been moved, deleted, or perhaps it never existed in the first place.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted/50" />
              <input
                type="text"
                placeholder="Search for courses, articles, or resources..."
                className="w-full pl-12 pr-4 py-4 bg-theme-surface border border-theme rounded-2xl focus:outline-none focus:border-theme-accent/50 transition-colors text-theme"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-theme-accent text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                Search
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link
              to="/"
              className="inline-flex items-center gap-3 px-8 py-4 bg-theme-accent text-white rounded-2xl font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-theme"
            >
              <Home className="w-5 h-5" />
              Back to Homepage
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-3 px-8 py-4 bg-theme-surface border border-theme rounded-2xl font-semibold hover:bg-theme-surface transition-all hover:border-theme-accent/50"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          {/* Quick Links */}
          <div className="mb-12">
            <h3 className="text-lg font-medium text-theme-muted mb-6">
              Quick Links
            </h3>
            <div className="flex flex-wrap justify-center gap-6">
              {popularLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="px-6 py-3 bg-theme-surface border border-theme rounded-xl hover:border-theme-accent/50 hover:text-theme-accent transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-theme-surface/50 border border-theme rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-theme mb-4">
              Need Help?
            </h3>
            <p className="text-theme-muted mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="mailto:support@eduplatform.com"
                className="px-6 py-3 bg-theme-accent/10 text-theme-accent rounded-xl font-medium hover:bg-theme-accent/20 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/faq"
                className="px-6 py-3 border border-theme rounded-xl font-medium hover:border-theme-accent/50 transition-colors"
              >
                Visit FAQ
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-theme">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-theme-muted/50 text-sm">
            © {new Date().getFullYear()} LMS. All rights reserved.
          </p>
          <p className="text-theme-muted/20 text-xs mt-2">
            Error 404 • Page Not Found
          </p>
        </div>
      </footer>

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-theme-accent/5 blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-theme-accent-secondary/5 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-theme-accent/3 blur-3xl"></div>
      </div>
    </div>
  );
};

export default Error404;