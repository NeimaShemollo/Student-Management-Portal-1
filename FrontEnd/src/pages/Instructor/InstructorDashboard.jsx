import "./instactor.css"
import { Outlet, NavLink, Link } from "react-router-dom";

const navItems = [
  { to: "/instructor/students", label: "Students" },
  { to: "/instructor/courses", label: "My Courses" },
  { to: "/instructor/assignments", label: "Assignments" },
  { to: "/instructor/grades", label: "Grades" },
  { to: "/instructor/attendance", label: "Attendance" },
];

function InstructorDashboard() {
  return (
    <div className="instructor-layout">

      {/* Sidebar */}
      <aside className="instructor-sidebar">

        <div className="instructor-brand">
          <Link to="/" className="instructor-brandMark">
            Bright <span>tech</span>
          </Link>

          <p className="instructor-brandSub">
            Instructor console
          </p>
        </div>

        <nav className="instructor-nav" aria-label="Instructor">

          <p className="instructor-navLabel">
            Teaching
          </p>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `instructor-navLink${isActive ? " active" : ""}`
              }
            >
              <span
                className="instructor-navDot"
                aria-hidden="true"
              />

              {item.label}
            </NavLink>
          ))}

        </nav>

        <div className="instructor-sidebarFoot">
          <strong>Bright tech</strong>
          <p>Instructor workspace</p>
        </div>

      </aside>


      {/* Main Content */}
      <main className="instructor-content">

        {/* Header */}
        <header className="instructor-header">

          <div className="instructor-headerCopy">

            <h1>
              Instructor Dashboard
            </h1>

            <p>
              Manage your students, courses, assignments and grades.
            </p>

          </div>

          <div className="instructor-headerBadge">
            ● Instructor
          </div>
</header>


        {/* Statistics */}
        <section
          className="instructor-stats"
          aria-label="Instructor overview"
        >

          <article className="instructor-statCard">
            <span>Students</span>
            <strong>Manage</strong>
          </article>

          <article className="instructor-statCard">
            <span>Courses</span>
            <strong>My Courses</strong>
          </article>

          <article className="instructor-statCard">
            <span>Grades</span>
            <strong>Review</strong>
          </article>

        </section>


        {/* Page Content */}
        <div className="instructor-contentArea">
          <Outlet />
        </div>

      </main>

    </div>
  );
}

export default InstructorDashboard;