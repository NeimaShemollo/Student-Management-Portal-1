import "./AdminDashboard.css"; 
import "./AdminShared.css"; // Ensure shared classes are active globally across layout views
import { Outlet, NavLink, Link } from "react-router-dom";

const navItems = [
  { to: "/admin", label: "Dashboard", end: true }, // Added explicit Base Landing Link
  { to: "/admin/students", label: "Students" },
  { to: "/admin/instructors", label: "Instructors" },
  { to: "/admin/register-staff", label: "Register Staff" },
  { to: "/admin/payments", label: "Payments" },
  { to: "/admin/courses", label: "Courses" },
];

function AdminDashboard() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Link to="/" className="admin-brandMark">
            Bright <span>tech</span>
          </Link>
          <p className="admin-brandSub">Admin console</p>
        </div>
        
        <nav className="admin-nav" aria-label="Admin">
          <p className="admin-navLabel">Workspace</p>
          {navItems.map((item) => (
            <NavLink 
              key={item.to} 
              to={item.to} 
              end={item.end} 
              className={({ isActive }) => `admin-navLink${isActive ? " active" : ""}`}
            >
              <span className="admin-navDot" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="admin-sidebarFoot">
          <strong>Bright tech</strong>
          <p>Academy Management Portal v1.0</p>
        </div>
      </aside>

      <main className="admin-content">
        <header className="admin-header">
          <div className="admin-headerCopy">
            <h1>Admin Dashboard</h1>
            <p>Overview and tools for your Bright tech academy.</p>
          </div>
          <div className="admin-headerBadge">
            <span>● Live System</span>
          </div>
        </header>
        
        <div className="admin-contentArea">
          {/* Your index layout (AdminHome) or child routing modules mount dynamically here */}
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
