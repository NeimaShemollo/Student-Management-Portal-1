import "./instactor.css";
import { Outlet, NavLink, Link } from "react-router-dom";
// 1. Double check the file spelling here (e.g., instructorPath if you renamed it)
import { getInstructorDashboardPath } from "./instructotPath"; 
// 2. Import your Auth Context to get the user's name/slug data
import { useAuthContext } from "../../contexts/useAuthContext.jsx"; 

function InstructorDashboard() {
  // 3. Get the logged-in user object
  const { user } = useAuthContext(); 

  // 4. Dynamically generate the navigation paths based on this user
  const navItems = [
    { to: getInstructorDashboardPath(user), label: "Dashboard", end: true }, 
    { to: getInstructorDashboardPath(user, "students"), label: "Students" },
    { to: getInstructorDashboardPath(user, "courses"), label: "My Courses" },
    { to: getInstructorDashboardPath(user, "assignments"), label: "Assignments" },
    { to: getInstructorDashboardPath(user, "grades"), label: "Grades" },
    { to: getInstructorDashboardPath(user, "attendance"), label: "Attendance" },
  ];

  return (
    <div className="instructor-layout">
      {/* Sidebar Container */}
      <aside className="instructor-sidebar">
        <div className="instructor-brand">
          <Link to="/" className="instructor-brandMark">
            Bright <span>tech</span>
          </Link>
          <p className="instructor-brandSub">Instructor console</p>
        </div>

        <nav className="instructor-nav" aria-label="Instructor">
          <p className="instructor-navLabel">Teaching</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end} 
              className={({ isActive }) => `instructor-navLink${isActive ? " active" : ""}`}
            >
              <span className="instructor-navDot" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="instructor-sidebarFoot">
          <strong>Bright tech</strong>
          {/* Displaying actual user name dynamically */}
          <p>{user?.fullName || "Instructor workspace"}</p> 
        </div>
      </aside>

      {/* Main Content Frames */}
      <main className="instructor-content">
        <header className="instructor-header">
          <div className="instructor-headerCopy">
            <h1>Instructor Dashboard</h1>
            <p>Manage your students, courses, assignments and grades.</p>
          </div>
          <div className="instructor-headerBadge">● Instructor</div>
        </header>

        {/* Dynamic Outlet mount frame */}
        <div className="instructor-contentArea">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default InstructorDashboard;

