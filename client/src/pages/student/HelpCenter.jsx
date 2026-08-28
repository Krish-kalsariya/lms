import { useState } from "react";
import { HelpCircle, Search, BookOpen, MessageCircle, Phone, Mail, ChevronDown, ChevronUp } from "lucide-react";
import Footer from "../../components/Footer";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How do I enroll in a course?",
      answer: "To enroll in a course, browse our course catalog, click on the course you're interested in, and click the 'Enroll Now' button. You can pay using various payment methods including credit/debit cards, UPI, and net banking."
    },
    {
      id: 2,
      question: "Can I get a refund if I'm not satisfied?",
      answer: "Yes! We offer a 30-day money-back guarantee for all our courses. If you're not satisfied with the course content, you can request a full refund within 30 days of enrollment."
    },
    {
      id: 3,
      question: "How long do I have access to a course?",
      answer: "Once you enroll in a course, you get lifetime access to the course materials. This includes all future updates and improvements made to the course."
    },
    {
      id: 4,
      question: "Do I get a certificate after completion?",
      answer: "Yes, upon successful completion of a course, you will receive a verified digital certificate that you can share on LinkedIn or download as a PDF."
    },
    {
      id: 5,
      question: "Can I access courses on mobile devices?",
      answer: "Absolutely! Our platform is fully responsive and works on all devices including smartphones, tablets, and desktops. You can learn on the go!"
    },
    {
      id: 6,
      question: "What if I have technical issues?",
      answer: "Our technical support team is available 24/7. You can reach out via email, live chat, or phone. We typically respond within 2 hours."
    }
  ];

  const guides = [
    { title: "Getting Started", icon: BookOpen, desc: "Learn the basics of using our platform" },
    { title: "Account Settings", icon: HelpCircle, desc: "Manage your profile and preferences" },
    { title: "Course Navigation", icon: BookOpen, desc: "How to effectively navigate courses" },
    { title: "Certificates", icon: HelpCircle, desc: "Understanding certification process" }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-theme">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border-b border-theme py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-theme-muted text-lg mb-8 max-w-2xl mx-auto">
            Find answers to your questions and get the support you need
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted" size={20} />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-theme-surface border border-theme focus:border-theme-accent outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Guides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {guides.map((guide, index) => (
            <div key={index} className="bg-theme-surface border border-theme rounded-xl p-6 hover:border-theme-accent/50 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-theme-accent/10 flex items-center justify-center mb-4">
                <guide.icon className="text-theme-accent" size={24} />
              </div>
              <h3 className="font-semibold mb-2">{guide.title}</h3>
              <p className="text-sm text-theme-muted">{guide.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <HelpCircle className="text-theme-accent" />
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-3">
              {filteredFaqs.map((faq) => (
                <div 
                  key={faq.id} 
                  className="bg-theme-surface border border-theme rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-theme transition-colors"
                  >
                    <span className="font-medium">{faq.question}</span>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="text-theme-muted flex-shrink-0" size={20} />
                    ) : (
                      <ChevronDown className="text-theme-muted flex-shrink-0" size={20} />
                    )}
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-5 pb-5 text-theme-muted">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="mx-auto text-theme-muted/50 mb-4" size={48} />
                <p className="text-theme-muted">No results found. Try a different search term.</p>
              </div>
            )}
          </div>

          {/* Contact Support */}
          <div className="lg:col-span-1">
            <div className="bg-theme-surface border border-theme rounded-xl p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageCircle className="text-theme-accent" />
                Contact Support
              </h3>
              <p className="text-theme-muted mb-6">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-theme rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-theme-accent/10 flex items-center justify-center">
                    <Mail className="text-theme-accent" size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-theme-muted">Email Us</p>
                    <p className="font-medium">support@brainera.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-theme rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-theme-accent/10 flex items-center justify-center">
                    <Phone className="text-theme-accent" size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-theme-muted">Call Us</p>
                    <p className="font-medium">+91 1800-123-4567</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-theme rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-theme-accent/10 flex items-center justify-center">
                    <MessageCircle className="text-theme-accent" size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-theme-muted">Live Chat</p>
                    <p className="font-medium">Available 24/7</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default HelpCenter;
