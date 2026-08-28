import { Shield, Lock, Eye, Database, Share2, Cookie } from "lucide-react";
import Footer from "../../components/footer";

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: `We collect information you provide directly to us, including:
      • Personal identification information (name, email address, phone number)
      • Account credentials and profile information
      • Payment and billing information
      • Course progress and learning data
      • Communication preferences and feedback`
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: `We use your information to:
      • Provide and maintain our educational services
      • Process your transactions and manage your account
      • Send you course updates, announcements, and marketing communications
      • Personalize your learning experience
      • Improve our platform and develop new features
      • Respond to your inquiries and provide customer support`
    },
    {
      icon: Share2,
      title: "Information Sharing",
      content: `We do not sell your personal information. We may share your information with:
      • Instructors to facilitate course participation
      • Service providers who assist in platform operations
      • Legal authorities when required by law
      • Business partners with your explicit consent
      All third parties are bound by confidentiality agreements.`
    },
    {
      icon: Lock,
      title: "Data Security",
      content: `We implement robust security measures:
      • Industry-standard SSL/TLS encryption
      • Regular security audits and vulnerability assessments
      • Secure data centers with restricted access
      • Multi-factor authentication options
      • Regular backup and disaster recovery procedures`
    },
    {
      icon: Cookie,
      title: "Cookies and Tracking",
      content: `We use cookies and similar technologies to:
      • Remember your preferences and login status
      • Analyze site traffic and usage patterns
      • Deliver personalized content and recommendations
      • Improve site functionality and performance
      You can manage cookie preferences through your browser settings.`
    }
  ];

  return (
    <div className="min-h-screen bg-theme">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border-b border-theme py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-theme-accent/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="text-theme-accent" size={32} />
          </div>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-theme-muted text-lg">
            Your privacy is our priority. Learn how we protect and handle your data.
          </p>
          <p className="text-sm text-theme-muted mt-4">
            Last Updated: March 17, 2026
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-theme-surface border border-theme rounded-xl p-6 mb-8">
          <p className="text-theme-muted leading-relaxed">
            Brainera (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you use our 
            learning management platform. Please read this privacy policy carefully. By accessing or 
            using our platform, you agree to the terms of this privacy policy.
          </p>
        </div>

        {/* Policy Sections */}
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
                <div className="text-theme-muted leading-relaxed whitespace-pre-line pl-13">
                  {section.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Your Rights Section */}
        <div className="bg-theme-surface border border-theme rounded-xl p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Your Privacy Rights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-theme rounded-lg">
              <h3 className="font-semibold mb-2">Access & Portability</h3>
              <p className="text-sm text-theme-muted">Request a copy of your personal data in a structured format.</p>
            </div>
            <div className="p-4 bg-theme rounded-lg">
              <h3 className="font-semibold mb-2">Correction</h3>
              <p className="text-sm text-theme-muted">Update or correct inaccurate personal information.</p>
            </div>
            <div className="p-4 bg-theme rounded-lg">
              <h3 className="font-semibold mb-2">Deletion</h3>
              <p className="text-sm text-theme-muted">Request deletion of your personal data and account.</p>
            </div>
            <div className="p-4 bg-theme rounded-lg">
              <h3 className="font-semibold mb-2">Opt-Out</h3>
              <p className="text-sm text-theme-muted">Unsubscribe from marketing communications anytime.</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-theme-accent/10 to-cyan-500/10 border border-theme rounded-xl p-6 mt-6">
          <h2 className="text-xl font-bold mb-3">Contact Us</h2>
          <p className="text-theme-muted mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-theme-muted">Email:</span>
              <span className="font-medium">privacy@brainera.com</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-theme-muted">Address:</span>
              <span className="font-medium">Ahmedabad, Gujarat, India</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12 text-sm text-theme-muted">
          <p>
            This privacy policy is effective as of March 17, 2026 and will remain in effect except 
            with respect to any changes in its provisions in the future.
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
