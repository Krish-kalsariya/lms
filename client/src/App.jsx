/* eslint-disable react-hooks/exhaustive-deps */
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useLoader } from "./context/LoaderContext";
import Loader from "./components/Loader";
import { setupInterceptors } from "./api/axios";
import MainLayout from "./layout/MainLayout.jsx";
import ProtectedRoute from "./utils/ProtectedRoute";

// Layout
import DashboardLayout from "./layout/DashbordLayout.jsx";

// Navbar
import Navbar from "./components/navbar.jsx";

// Auth
import Login from "./pages/auth/login.jsx";
import Register from "./pages/auth/register.jsx";

// Public
import Home from "./pages/public/home.jsx";
import About from "./pages/public/about.jsx";
import ContactUs from "./pages/public/contact.jsx";
import Blog from "./pages/public/blog.jsx";
import BlogDetail from "./pages/public/blogDetail.jsx";
import FAQ from "./pages/public/faq.jsx";
import Error404 from "./pages/public/Error404.jsx";

// student
import CourseDetail from "./pages/public/CourseDetail";
import Courses from "./pages/public/courses.jsx";
import StudentProfile from "./pages/student/Profile.jsx";
import SavedCourses from "./pages/student/SavedCourses.jsx";
import AnnouncementList from "./pages/student/AnnouncementList.jsx";
import HelpCenter from "./pages/student/HelpCenter.jsx";
import PrivacyPolicy from "./pages/student/PrivacyPolicy.jsx";
import TermsOfService from "./pages/student/TermsOfService.jsx";

// Instructor
import InstructorDashboard from "./pages/instructor/dashbord.jsx";
import CreateCourse from "./pages/instructor/createcourse.jsx";
import MyCourses from "./pages/instructor/Mycourses.jsx";
import Profile from "./pages/profile/profile.jsx";
import ViewCourse from "./pages/instructor/ViewCourse.jsx";
import EditCourse from "./pages/instructor/Editcourse.jsx";
import CreateLecture from "./pages/instructor/Createlecture.jsx";
import InstructorDraftCourses from "./pages/instructor/InstructorDraftCourses.jsx";
import ContactMessages from "./pages/instructor/ContactMessages";
import CourseLectures from "./pages/instructor/Createlecture.jsx";
import EditLecture from "./pages/instructor/Editlecture.jsx";
import EnrolledStudents from "./pages/instructor/EnrolledStudents.jsx";
import ManageStudents from "./pages/instructor/Managestudent.jsx";
import AddAnnouncement from "./pages/instructor/AddAnnouncement.jsx";

function App() {
  const { loading, setLoading } = useLoader();

  useEffect(() => {
    setupInterceptors(setLoading);
  }, []);

  return (
    <>
      {/* ✅ ONLY CHANGE: Toaster is now at ROOT */}
      <Toaster
        position="bottom-left"
        gutter={16}
        containerStyle={{
          bottom: 24,
          left: 24,
          zIndex: 99999,
        }}
        toastOptions={{
          duration: 2000,
          style: {
            background: "linear-gradient(135deg, #020617, #020617)",
            color: "#f8fafc",
            padding: "16px 20px",
            borderRadius: "16px",
            fontWeight: "600",
            boxShadow: "0 20px 40px rgba(0,0,0,0.55)",
            border: "1px solid rgba(255,255,255,0.08)",
            animation: "toast-safe-in 0.25s ease-out",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#ecfdf5",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fee2e2",
            },
          },
        }}
      />

      <MainLayout>
        <div className="select-none">
          {loading && <Loader />}

          <Navbar />

          <Routes>
            {/* Public */}
            <Route path="*" element={<Error404 />} />
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />

             {/* PUBLIC – visitor allowed */}
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />

            <Route
              path="/student/profile"
              element={
                <ProtectedRoute>
                  <StudentProfile role="student" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/saved-courses"
              element={
                <ProtectedRoute>
                  <SavedCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/announcements"
              element={
                <ProtectedRoute>
                  <AnnouncementList />
                </ProtectedRoute>
              }
            />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Instructor */}
            <Route
              path="/instructor"
              element={
                <ProtectedRoute>
                  <DashboardLayout role="instructor" />
                </ProtectedRoute>
              }
            >
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <InstructorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="create-course"
                element={
                  <ProtectedRoute>
                    <CreateCourse />
                  </ProtectedRoute>
                }
              />
              <Route
                path="my-courses"
                element={
                  <ProtectedRoute>
                    <MyCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="view-course/:courseId"
                element={
                  <ProtectedRoute>
                    <ViewCourse />
                  </ProtectedRoute>
                }
              />
              <Route
                path="edit-course/:courseId"
                element={
                  <ProtectedRoute>
                    <EditCourse />
                  </ProtectedRoute>
                }
              />
              <Route
                path="draft-courses"
                element={
                  <ProtectedRoute>
                    <InstructorDraftCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/contact-messages"
                element={
                  <ProtectedRoute>
                    <ContactMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="create-lecture/:courseId"
                element={
                  <ProtectedRoute>
                    <CreateLecture />
                  </ProtectedRoute>
                }
              />
              <Route
                path="course-lectures/:courseId"
                element={
                  <ProtectedRoute>
                    <CourseLectures />
                  </ProtectedRoute>
                }
              />
              <Route
                path="edit-lecture/:lectureId"
                element={
                  <ProtectedRoute>
                    <EditLecture />
                  </ProtectedRoute>
                }
              />
              <Route
                path="course/:courseId/lecture/:lectureId/edit"
                element={
                  <ProtectedRoute>
                    <EditLecture />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/course/:courseId/students"
                element={
                  <ProtectedRoute>
                    <EnrolledStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/manage-students"
                element={
                  <ProtectedRoute>
                    <ManageStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/add-announcement"
                element={
                  <ProtectedRoute>
                    <AddAnnouncement />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </div>
      </MainLayout>
    </>
  );
}

export default App;