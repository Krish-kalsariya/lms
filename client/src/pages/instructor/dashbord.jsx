import { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  IndianRupee,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Star,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Play,
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from "recharts";
import { Link } from "react-router-dom";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#f97316"];

export default function InstructorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/course/instructor/dashboard")
      .then((res) => setStats(res.data.data))
      .catch(() => toast.error("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  const monthlyData = stats?.monthlyStats?.labels?.map((label, index) => ({
    month: label,
    enrollments: stats.monthlyStats.enrollments[index] || 0,
    revenue: stats.monthlyStats.revenue[index] || 0,
    cumulative: stats.monthlyStats.cumulativeStudents?.[index] || 0,
  })) || [];

  const courseData = stats?.courseStats?.map((course) => ({
    name: course.name?.length > 20 ? course.name.substring(0, 20) + "..." : course.name,
    fullName: course.name,
    enrollments: course.enrollments,
    revenue: course.revenue,
    rating: course.rating,
  })) || [];

  const totalRevenue = stats?.revenue || 0;
  const totalEnrollments = stats?.enrolledStudents || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--bg-main) text-(--text-muted)">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-main) text-(--text-main) px-3 sm:px-6 py-6 sm:py-8 transition-colors duration-300">
      {/* HEADER */}
      <div className="mb-6 sm:mb-10 rounded-2xl sm:rounded-3xl bg-linear-to-r from-indigo-600 via-purple-600 to-cyan-500 p-px">
        <div className="rounded-2xl sm:rounded-3xl bg-(--bg-main) p-4 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight bg-linear-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Instructor Dashboard
            </h1>
            <p className="text-(--text-muted) text-sm mt-1">
              Track your courses, students & earnings in real-time
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/instructor/create-course"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-300 text-sm font-medium"
            >
              <Plus size={18} />
              Create Course
            </Link>
            <Link
              to="/instructor/my-courses"
              className="flex items-center gap-2 px-4 py-2 bg-(--bg-surface) hover:bg-(--bg-hover) text-(--text-main) border border-(--border-main) rounded-xl transition-all duration-300 text-sm font-medium"
            >
              <Eye size={18} />
              View Courses
            </Link>
          </div>
        </div>
      </div>

      {/* STATS ROW WITH TRENDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <TrendStatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          trend={stats?.revenueGrowth}
          trendLabel="vs last month"
          icon={<IndianRupee size={20} />}
          color="emerald"
        />
        <TrendStatCard
          title="Enrolled Students"
          value={totalEnrollments}
          trend={stats?.enrollmentGrowth}
          trendLabel="vs last month"
          icon={<Users size={20} />}
          color="indigo"
        />
        <TrendStatCard
          title="Total Courses"
          value={stats?.totalCourses}
          trend={stats?.publishedCourses}
          trendLabel="published"
          icon={<BookOpen size={20} />}
          color="purple"
        />
        <TrendStatCard
          title="Avg. Rating"
          value={stats?.averageRating || "0.0"}
          trend={stats?.totalReviews}
          trendLabel="reviews"
          icon={<Star size={20} />}
          color="amber"
        />
      </div>

      {/* MAIN CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Student Growth - Area Chart */}
        <div className="lg:col-span-2 bg-(--bg-surface) border border-(--border-main) rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Activity className="text-indigo-500" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Student Growth</h3>
              <p className="text-sm text-(--text-muted)">Cumulative enrollments over 12 months</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderRadius: '8px' }} itemStyle={{ color: 'var(--text-main)' }} labelStyle={{ color: 'var(--text-muted)' }} />
                <Area type="monotone" dataKey="cumulative" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCumulative)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution - Pie Chart */}
        <div className="bg-(--bg-surface) border border-(--border-main) rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <PieIcon className="text-purple-500" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Categories</h3>
              <p className="text-sm text-(--text-muted)">Course distribution</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.categoryData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.categoryData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderRadius: '8px' }} itemStyle={{ color: 'var(--text-main)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {(stats?.categoryData || []).slice(0, 4).map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-(--text-muted)">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-(--bg-surface) border border-(--border-main) rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <TrendingUp className="text-cyan-500" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Monthly Enrollments</h3>
              <p className="text-sm text-(--text-muted)">New students per month</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderRadius: '8px' }} itemStyle={{ color: 'var(--text-main)' }} />
                <Line type="monotone" dataKey="enrollments" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#06b6d4' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-(--bg-surface) border border-(--border-main) rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <IndianRupee className="text-emerald-500" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Monthly Revenue</h3>
              <p className="text-sm text-(--text-muted)">Revenue trend (₹)</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `₹${value / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderRadius: '8px' }} itemStyle={{ color: 'var(--text-main)' }} labelStyle={{ color: 'var(--text-muted)' }} formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 3 & POPULAR COURSES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-(--bg-surface) border border-(--border-main) rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <BarChart3 className="text-pink-500" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Top Performing Courses</h3>
              <p className="text-sm text-(--text-muted)">By enrollment count</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={11} width={140} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderRadius: '8px' }} itemStyle={{ color: 'var(--text-main)' }} labelStyle={{ color: 'var(--text-muted)' }} formatter={(value, name, props) => [`${value} students`, props.payload.fullName]} />
                <Bar dataKey="enrollments" radius={[0, 4, 4, 0]}>
                  {courseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-(--bg-surface) border border-(--border-main) rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Layers className="text-amber-500" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Course Levels</h3>
              <p className="text-sm text-(--text-muted)">Difficulty distribution</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.levelData || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {(stats?.levelData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderRadius: '8px' }} itemStyle={{ color: 'var(--text-main)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-(--bg-surface) border border-(--border-main) rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Play className="text-indigo-500" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Popular Courses</h3>
              <p className="text-sm text-(--text-muted)">Most enrolled courses</p>
            </div>
          </div>
          <div className="space-y-3">
            {(stats?.recentCourses || []).map((course, index) => (
              <div key={course.id} className="flex items-center gap-4 p-4 bg-(--bg-main) rounded-xl hover:bg-(--bg-hover) transition-colors">
                <div className="h-12 w-12 rounded-lg bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{course.name}</h4>
                  <p className="text-sm text-(--text-muted)">{course.enrollments} students enrolled</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-indigo-400">{course.enrollments}</p>
                  <p className="text-xs text-(--text-muted)">enrollments</p>
                </div>
              </div>
            ))}
            {(stats?.recentCourses || []).length === 0 && (
              <p className="text-center text-(--text-muted) py-8">No courses with enrollments yet</p>
            )}
          </div>
        </div>

        <div className="bg-(--bg-surface) border border-(--border-main) rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Activity className="text-emerald-500" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Quick Stats</h3>
              <p className="text-sm text-(--text-muted)">At a glance</p>
            </div>
          </div>
          <div className="space-y-3">
            <QuickStat label="Published" value={stats?.publishedCourses} total={stats?.totalCourses} />
            <QuickStat label="Draft" value={stats?.draftCourses} total={stats?.totalCourses} />
            <QuickStat label="Platform Students" value={stats?.totalStudents} />
          </div>

        </div>
      </div>
    </div>
  );
}

function TrendStatCard({ title, value, trend, trendLabel, icon, color }) {
  const colorClasses = {
    emerald: "from-emerald-500/20 to-emerald-600/10 text-emerald-500",
    indigo: "from-indigo-500/20 to-indigo-600/10 text-indigo-500",
    purple: "from-purple-500/20 to-purple-600/10 text-purple-500",
    amber: "from-amber-500/20 to-amber-600/10 text-amber-500",
  };
  const isPositive = trend > 0;
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-(--border-main) bg-(--bg-surface) p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10">
      <div className={`absolute inset-0 bg-linear-to-br ${colorClasses[color]} opacity-50`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg bg-linear-to-br ${colorClasses[color]}`}>{icon}</div>
          {trend !== undefined && trend !== null && (
            <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
              <TrendIcon size={14} />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <p className="text-xs sm:text-sm text-(--text-muted)">{title}</p>
        <h2 className="text-xl sm:text-2xl font-bold mt-1">{value ?? 0}</h2>
        {trendLabel && <p className="text-xs text-(--text-muted) mt-1">{trendLabel}</p>}
      </div>
    </div>
  );
}

function QuickStat({ label, value, total }) {
  return (
    <div className="flex items-center justify-between p-3 bg-(--bg-main) rounded-xl">
      <span className="text-sm text-(--text-muted)">{label}</span>
      <div className="text-right">
        <span className="font-semibold">{value ?? 0}</span>
        {total && <span className="text-xs text-(--text-muted) ml-1">/ {total}</span>}
      </div>
    </div>
  );
}