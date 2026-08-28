import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { 
  Clock, 
  Pin, 
  Bell, 
  Search, 
  Filter, 
  Calendar, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  User,
  Eye,
  MessageSquare
} from "lucide-react";
import Footer from "../../components/footer.jsx";

const NEW_BADGE_DURATION = 5 * 60 * 1000; // 5 minutes

const AnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all, pinned, new
  const [expandedAnnouncement, setExpandedAnnouncement] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  // ⏱ Update current time every 30 sec (auto hide NEW badge)
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, []);

  // 📦 Load announcements
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get("/announcements");
        setAnnouncements(res.data || []);
        setFilteredAnnouncements(res.data || []);

        // 🔔 Mark seen for navbar badge logic
        await api.post("/announcements/mark-seen");
      } catch (err) {
        console.error("Failed to load announcements" ,err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 🔍 Filter announcements based on search and filter
  useEffect(() => {
    let result = announcements;

    // Apply search filter
    if (searchQuery) {
      result = result.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.createdBy?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filter === "pinned") {
      result = result.filter(a => a.isPinned);
    } else if (filter === "new") {
      result = result.filter(a => showNewBadge(a.createdAt));
    }

    setFilteredAnnouncements(result);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filter, announcements, now]);

  // 🔔 NEW badge logic (5 minutes)
  const showNewBadge = (createdAt) => {
    const createdTime = new Date(createdAt).getTime();
    return now - createdTime < NEW_BADGE_DURATION;
  };

  // 📅 Date + Time formatter
  const formatDateTime = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if it's today
    if (d.toDateString() === today.toDateString()) {
      return `Today • ${d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`;
    }

    // Check if it's yesterday
    if (d.toDateString() === yesterday.toDateString()) {
      return `Yesterday • ${d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`;
    }

    const datePart = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const timePart = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${datePart} • ${timePart}`;
  };

  // Calculate time ago
  const getTimeAgo = (date) => {
    const seconds = Math.floor((now - new Date(date).getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
  };

  // Toggle announcement expansion
  const toggleExpand = (id) => {
    setExpandedAnnouncement(expandedAnnouncement === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-(--bg-main)">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-(--border-main) border-t-(--accent-primary) rounded-full animate-spin"></div>
          <Bell className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-(--accent-primary)" />
        </div>
        <p className="mt-4 text-(--text-muted) animate-pulse">Loading announcements...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-(--bg-main)">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-(--bg-main)/80 backdrop-blur-lg border-b border-(--border-main)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-(--accent-primary) to-(--accent-secondary) bg-clip-text text-transparent">
                  Announcements
                </h1>
                <p className="text-(--text-muted) mt-1 sm:mt-2 text-sm sm:text-base">
                  Stay updated with the latest news and updates
                </p>
              </div>
              
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-xs sm:text-sm text-(--text-muted)">
                  {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
                </span>
                <div className="flex gap-1 sm:gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 sm:p-2 rounded-lg ${viewMode === "grid" ? 'bg-(--bg-surface)' : 'hover:bg-(--bg-surface)'}`}
                  >
                    <div className="grid grid-cols-2 gap-0.5 w-4 sm:w-5 h-4 sm:h-5">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-(--text-muted) rounded-sm"></div>
                      ))}
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 sm:p-2 rounded-lg ${viewMode === "list" ? 'bg-(--bg-surface)' : 'hover:bg-(--bg-surface)'}`}
                  >
                    <div className="flex flex-col gap-0.5 w-4 sm:w-5 h-4 sm:h-5">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-(--text-muted) rounded-sm h-1"></div>
                      ))}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-(--text-muted)" size={18} />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-(--bg-surface) border border-(--border-main) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--accent-primary) focus:border-transparent text-(--text-main) text-sm sm:text-base"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-4 sm:mx-0 px-4 sm:px-0">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm sm:text-base ${
                    filter === "all" 
                      ? 'bg-(--accent-primary) text-white' 
                      : 'bg-(--bg-surface) hover:bg-(--bg-surface)/80'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("pinned")}
                  className={`px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base ${
                    filter === "pinned" 
                      ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30' 
                      : 'bg-(--bg-surface) hover:bg-(--bg-surface)/80'
                  }`}
                >
                  <Pin size={14} />
                  Pinned
                </button>
                <button
                  onClick={() => setFilter("new")}
                  className={`px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base ${
                    filter === "new" 
                      ? 'bg-(--accent-primary)/20 text-(--accent-primary) border border-(--accent-primary)/30' 
                      : 'bg-(--bg-surface) hover:bg-(--bg-surface)/80'
                  }`}
                >
                  <Bell size={14} />
                  New
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {announcements.length === 0 ? (
            <div className="text-center py-12 sm:py-20">
              <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-(--bg-surface) mb-4 sm:mb-6">
                <MessageSquare className="text-(--text-muted)" size={32} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-(--text-main) mb-1 sm:mb-2">
                No announcements yet
              </h3>
              <p className="text-(--text-muted) text-sm sm:text-base">
                When announcements are made, they'll appear here
              </p>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12 sm:py-20">
              <AlertCircle className="mx-auto text-(--text-muted)" size={40} />
              <h3 className="text-lg sm:text-xl font-semibold text-(--text-main) mt-3 sm:mt-4 mb-1 sm:mb-2">
                No results found
              </h3>
              <p className="text-(--text-muted) text-sm sm:text-base">
                Try adjusting your search or filter
              </p>
            </div>
          ) : (
            <div className={`grid gap-4 sm:gap-6 ${viewMode === "grid" ? 'md:grid-cols-2' : ''}`}>
              {filteredAnnouncements.map((a) => (
                <div
                  key={a._id}
                  className={`
                    group relative
                    bg-(--bg-glass)
                    border border-(--border-main)
                    rounded-xl sm:rounded-2xl
                    overflow-hidden
                    transition-all duration-300
                    hover:shadow(--shadow-soft)
                    hover:border-(--accent-primary)/30
                    ${expandedAnnouncement === a._id ? 'ring-2 ring-(--accent-primary)/20' : ''}
                    ${a.isPinned ? 'border-l-4 border-l-amber-500' : ''}
                  `}
                >
                  {/* Pinned indicator */}
                  {a.isPinned && (
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                      <Pin className="text-amber-500" size={18} />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4 sm:p-6">
                    {/* Header with badges */}
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
                          {/* New badge */}
                          {showNewBadge(a.createdAt) && (
                            <span className="
                              inline-flex items-center gap-1
                              text-xs font-medium
                              px-2 sm:px-2.5 py-0.5 sm:py-1
                              rounded-full
                              bg-linear-to-r from-(--accent-primary) to-(--accent-secondary)
                              text-white
                              animate-pulse
                            ">
                              <Bell size={10} /> NEW
                            </span>
                          )}
                          
                          {/* Priority badge */}
                          {a.priority === "high" && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-red-500/10 text-red-600 border border-red-500/20">
                              <AlertCircle size={10} /> HIGH PRIORITY
                            </span>
                          )}
                        </div>

                        <h3 
                          className="font-bold text-base sm:text-lg text-(--text-main) cursor-pointer group-hover:text-(--accent-primary) transition-colors"
                          onClick={() => toggleExpand(a._id)}
                        >
                          {a.title}
                        </h3>
                      </div>

                      <button
                        onClick={() => toggleExpand(a._id)}
                        className="p-1.5 sm:p-2 hover:bg-(--bg-surface) rounded-lg transition-colors"
                      >
                        {expandedAnnouncement === a._id ? (
                          <ChevronUp size={18} className="text-(--text-muted)" />
                        ) : (
                          <ChevronDown size={18} className="text-(--text-muted)" />
                        )}
                      </button>
                    </div>

                    {/* Message - with expand/collapse */}
                    <div className="mt-3 sm:mt-4">
                      <p className={`text-(--text-muted) text-sm sm:text-base ${
                        expandedAnnouncement === a._id ? '' : 'line-clamp-3'
                      }`}>
                        {a.message}
                      </p>
                      
                      {a.message.length > 200 && (
                        <button
                          onClick={() => toggleExpand(a._id)}
                          className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-(--accent-primary) hover:underline"
                        >
                          {expandedAnnouncement === a._id ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-(--border-main) flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-linear-to-r from-(--accent-primary) to-(--accent-secondary) flex items-center justify-center">
                            <User size={12} className="text-white" />
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-(--text-main)">
                              {a.createdBy?.name || "Instructor"}
                            </span>
                            <div className="flex items-center gap-1 sm:gap-2 text-xs text-(--text-muted)">
                              <Clock size={10} />
                              <span title={new Date(a.createdAt).toLocaleString()}>
                                {getTimeAgo(a.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-(--text-muted)">
                        {a.category && (
                          <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-(--bg-surface) text-xs">
                            {a.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Detailed timestamp */}
                    {expandedAnnouncement === a._id && (
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-(--border-main) text-xs text-(--text-muted)">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Calendar size={12} />
                          <span>Posted on {formatDateTime(a.createdAt)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gradient accent line */}
                  <div className="h-1 bg-linear-to-r from-(--accent-primary) to-(--accent-secondary) opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          )}

          {/* Stats Footer */}
          {announcements.length > 0 && (
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-(--border-main)">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                <div className="text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-(--bg-surface)">
                  <div className="text-2xl sm:text-3xl font-bold text-(--accent-primary)">
                    {announcements.filter(a => showNewBadge(a.createdAt)).length}
                  </div>
                  <div className="text-(--text-muted) mt-1 sm:mt-2 text-sm sm:text-base">New Announcements</div>
                </div>
                <div className="text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-(--bg-surface)">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-500">
                    {announcements.filter(a => a.isPinned).length}
                  </div>
                  <div className="text-(--text-muted) mt-1 sm:mt-2 text-sm sm:text-base">Pinned Announcements</div>
                </div>
                <div className="text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-(--bg-surface) sm:col-span-2 md:col-span-1">
                  <div className="text-2xl sm:text-3xl font-bold text-(--accent-secondary)">
                    {announcements.length}
                  </div>
                  <div className="text-(--text-muted) mt-1 sm:mt-2 text-sm sm:text-base">Total Announcements</div>
                </div>
              </div>
            </div>
          )}
        </div>
      <Footer />
      </div>
    </>
  );
};

export default AnnouncementList;