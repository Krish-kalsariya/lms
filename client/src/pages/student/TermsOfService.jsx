import { FileText, Scale, Users, CreditCard, AlertTriangle, CheckCircle } from "lucide-react";
import Footer from "../../components/Footer";

const TermsOfService = () => {
  const sections = [
    {
      icon: Users,
      title: "Account Registration",
      content: `By creating an account, you agree to:
      • Provide accurate and complete information
      • Maintain the security of your account credentials
      • Accept responsibility for all activities under your account
      • Notify us immediately of any unauthorized access
      • Be at least 13 years of age (16 for EU residents)`
    },
    {
      icon: CreditCard,
      title: "Payments & Refunds",
      content: `Our payment terms include:
      • All prices are listed in INR (₹) and inclusive of applicable taxes
      • Payments are processed securely through our payment partners
      • 30-day money-back guarantee for course purchases
      • Refunds are processed within 5-7 business days
      • Subscription plans auto-renew unless cancelled`
    },
    {
      icon: FileText,
      title: "Course Content & Access",
      content: `Regarding course content:
      • Lifetime access to purchased courses
      • Content is for personal learning only, not for redistribution
      • We reserve the right to update or remove course content
      • Download rights are subject to instructor permissions
      • Account sharing is strictly prohibited`
    },
    {
      icon: Scale,
      title: "Code of Conduct",
      content: `All users must:
      • Respect instructors and fellow students
      • Not engage in harassment or discriminatory behavior
      • Not share copyrighted material without permission
      • Not attempt to disrupt platform services
      • Use the platform for lawful purposes only`
    },
    {
      icon: AlertTriangle,
      title: "Termination",
      content: `We may suspend or terminate accounts that:
      • Violate these terms of service
      • Engage in fraudulent payment activities
      • Share account access with multiple users
      • Distribute course content illegally
      • Harass other users or instructors`
    }
  ];

  return (
    <div className="min-h-screen bg-theme">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border-b border-theme py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-theme-accent/10 flex items-center justify-center mx-auto mb-6">
            <Scale className="text-theme-accent" size={32} />
          </div>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-theme-muted text-lg">
            Please read these terms carefully before using our platform.
          </p>
          <p className="text-sm text-theme-muted mt-4">
            Last Updated: March 17, 2026
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Acceptance Notice */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-amber-500 mb-2">Acceptance of Terms</h3>
              <p className="text-theme-muted">
                By accessing or using Brainera&apos;s learning platform, you agree to be bound by these Terms of Service. 
                If you disagree with any part of the terms, you may not access the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div 
              key={index} 
              className="bg-theme-surface border border-theme rounded-xl overflow-hidden hover:border-theme-accent/30 transition-all"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-theme-accent/10 flex items-center justify-center">
                    <section.icon className="text-theme-accent" size={20} />
                  </div>
                  <h2 className="text-xl font-bold">{section.title}</h2>
                </div>
                <div className="text-theme-muted leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Intellectual Property */}
        <div className="bg-theme-surface border border-theme rounded-xl p-6 mt-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="text-theme-accent" />
            Intellectual Property
          </h2>
          <div className="text-theme-muted leading-relaxed space-y-3">
            <p>
              All content on this platform, including but not limited to courses, videos, text, 
              graphics, logos, and software, is the property of Brainera or its content creators 
              and is protected by Indian and international copyright laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, create derivative works of, publicly 
              display, publicly perform, republish, download, store, or transmit any of the 
              material on our platform, except as necessary for your personal learning experience.
            </p>
          </div>
        </div>

        {/* Disclaimers */}
        <div className="bg-theme-surface border border-theme rounded-xl p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Disclaimer of Warranties</h2>
          <div className="text-theme-muted leading-relaxed space-y-3">
            <p>
              Our platform is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. 
              We make no warranties, expressed or implied, regarding the operation of our platform 
              or the information, content, materials, or products included.
            </p>
            <p>
              We do not guarantee that:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>The platform will be uninterrupted or error-free</li>
              <li>Defects will be corrected</li>
              <li>The platform is free of viruses or other harmful components</li>
              <li>Course outcomes or career results are guaranteed</li>
            </ul>
          </div>
        </div>

        {/* Limitation of Liability */}
        <div className="bg-theme-surface border border-theme rounded-xl p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Limitation of Liability</h2>
          <p className="text-theme-muted leading-relaxed">
            In no event shall Brainera, its directors, employees, partners, agents, suppliers, 
            or affiliates be liable for any indirect, incidental, special, consequential, or 
            punitive damages, including without limitation, loss of profits, data, use, goodwill, 
            or other intangible losses, resulting from your access to or use of or inability 
            to access or use the platform.
          </p>
        </div>

        {/* Governing Law */}
        <div className="bg-gradient-to-r from-theme-accent/10 to-cyan-500/10 border border-theme rounded-xl p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Governing Law</h2>
          <p className="text-theme-muted leading-relaxed">
            These Terms shall be governed and construed in accordance with the laws of India, 
            without regard to its conflict of law provisions. Any dispute arising under these 
            Terms shall be subject to the exclusive jurisdiction of the courts in Ahmedabad, Gujarat.
          </p>
        </div>

        {/* Changes to Terms */}
        <div className="bg-theme-surface border border-theme rounded-xl p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Changes to Terms</h2>
          <p className="text-theme-muted leading-relaxed">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
            We will provide notice of any changes by posting the new Terms on this page and updating 
            the &ldquo;Last Updated&rdquo; date. Your continued use of the platform after any such changes 
            constitutes your acceptance of the new Terms.
          </p>
        </div>

        {/* Contact Section */}
        <div className="bg-theme-surface border border-theme rounded-xl p-6 mt-6">
          <h2 className="text-xl font-bold mb-3">Contact Information</h2>
          <p className="text-theme-muted mb-4">
            If you have any questions about these Terms, please contact us:
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-theme-muted">Email:</span>
              <span className="font-medium">legal@brainera.com</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-theme-muted">Address:</span>
              <span className="font-medium">Brainera Technologies, Surat, Gujarat, India</span>
            </div>
          </div>
        </div>

        {/* Agreement Footer */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-theme-accent/10 text-theme-accent px-4 py-2 rounded-full">
            <CheckCircle size={18} />
            <span className="font-medium">By using our platform, you agree to these terms</span>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
