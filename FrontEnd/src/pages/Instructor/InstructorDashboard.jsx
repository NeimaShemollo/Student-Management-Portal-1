import "./instactor.css";
import { Outlet, NavLink, Link } from "react-router-dom";

const navItems = [
  { to: "/instructor", label: "Dashboard", end: true }, // Added explicit Base Home Link
  { to: "/instructor/students", label: "Students" },
  { to: "/instructor/courses", label: "My Courses" },
  { to: "/instructor/assignments", label: "Assignments" },
  { to: "/instructor/grades", label: "Grades" },
  { to: "/instructor/attendance", label: "Attendance" },
];

function InstructorDashboard() {
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
              end={item.end} // Ensures active highlighted link works precisely
              className={({ isActive }) => `instructor-navLink${isActive ? " active" : ""}`}
            >
              <span className="instructor-navDot" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="instructor-sidebarFoot">
          <strong>Bright tech</strong>
          <p>Instructor workspace</p>
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

        {/* Dynamic Outlet mount frame (Stat cards are gone from layout) */}
        <div className="instructor-contentArea">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default InstructorDashboard;
