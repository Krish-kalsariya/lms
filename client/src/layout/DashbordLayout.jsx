import { Outlet } from "react-router-dom";
import InstructorSidebar from "../components/insructor/sidebar.jsx";

export default function DashboardLayout({ role }) {
  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--bg-main)", color: "var(--text-main)" }}
    >
      {/* Sidebar */}
      {role === "instructor" && <InstructorSidebar />}

      {/* Main Content */}
      <main
        className="flex-1 lg:ml-64 pt-16 lg:pt-0 px-4"
        style={{ background: "var(--gradient-main)" }}
      >
        <Outlet />
      </main>
    </div>
  );
}

