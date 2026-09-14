import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Homepage from "./pages/Home/Homepage.jsx";
import About from "./pages/Home/About.jsx";
import Courses from "./pages/Home/Courses.jsx";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import WelcomePage from "./pages/Welcome/WelcomePage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminHome from "./pages/Admin/AdminHome.jsx";
import StudentsList from "./pages/Admin/StudentsList";
import InstructorsList from "./pages/Admin/InstructorsList.jsx";
import RegisterStaff from "./pages/Admin/RegisterStaff.jsx";
import PaymentManagement from "./pages/Admin/PaymentManagement.jsx";
import ManageCourses from "./pages/Admin/ManageCourses.jsx";
import StudentDashboard, {
  StudentAssignments,
  StudentCoursesPanel,
  StudentOverview,
  StudentSettings,
} from "./pages/Student/StudentDashboard.jsx";
import CourseClassroom from "./pages/Student/CourseClassroom.jsx"; 
import PaymentPending from "./pages/Student/PaymentPending";
import PaidStudentGuard from "./components/PaidStuentGuard.jsx"
import InstructorDashboard from "./pages/Instructor/InstructorDashboard.jsx";
import { InstructorOverview } from "./pages/Instructor/InstructorOverview";


import { AuthContextProvider } from "./contexts/authContext.jsx";
import Footer from "./components/common/Footer.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import {InstructorProvider} from "./contexts/InstructorContext"

function AppContent() {
  return (
    <>
      <div className="app-main">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          
<Route
  path="/admin"
  element={
    <ProtectedRoute adminOnly>
      <AdminDashboard />
    </ProtectedRoute>
  }
>
  
  <Route index element={<AdminHome />} /> 
  
  <Route path="register-staff" element={<RegisterStaff />} />
  <Route path="students" element={<StudentsList />} />
  <Route path="instructors" element={<InstructorsList />} />
  <Route path="payments" element={<PaymentManagement />} />
  <Route path="courses" element={<ManageCourses />} />
</Route>

          

               
  
  <Route path="/payment-pending" element={<PaymentPending />} />

  
  <Route
    path="/student-dashboard/:studentName"
    element={
      <ProtectedRoute allowedRoles={["student"]}>
        <PaidStudentGuard> {/* Forces validation intercept checks here */}
          <StudentDashboard />
        </PaidStudentGuard>
      </ProtectedRoute>
    }
  >
    <Route index element={<StudentOverview />} />
    <Route path="assignments" element={<StudentAssignments />} />
    <Route path="courses" element={<StudentCoursesPanel />} />
    <Route path="settings" element={<StudentSettings />} />
    <Route path="courses/:courseId" element={<CourseClassroom />} /> 
  </Route>
                 
<Route
  path="/instructor"
  element={
    <ProtectedRoute allowedRoles={["instructor"]}>
      <InstructorDashboard />
    </ProtectedRoute>
  }
>
  
  <Route index element={<InstructorOverview />} />
  
  <Route path="students" element={<div>Instructor Student List Page</div>} />
  <Route path="courses" element={<div>Instructor Course Catalog View</div>} />
  <Route path="assignments" element={<div>Instructor Assignment Manager</div>} />
  <Route path="grades" element={<div>Instructor Grades Tracker</div>} />
  <Route path="attendance" element={<div>Instructor Attendance Logs</div>} />
</Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <InstructorProvider>
        <AppContent />
        </InstructorProvider>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
