import { NavLink, Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useAuthContext } from "../../contexts/useAuthContext.jsx";
import { getStudentDashboardPath, toStudentSlug } from "./studentPath.js";
import StudentPayments from "./StudentPayments.jsx";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "./StudentDashboard.css";

const navItems = [
  { to: ".", label: "Dashboard", end: true },
  { to: "assignments", label: "Assignments", end: false },
  { to: "courses", label: "Courses", end: false },
  { to: "settings", label: "Settings", end: false },
];

const activityData = [
  { month: "Jan", progress: 20 },
  { month: "Feb", progress: 45 },
  { month: "Mar", progress: 35 },
  { month: "Apr", progress: 70 },
  { month: "May", progress: 65 },
  { month: "Jun", progress: 95 },
];

function StudentSection({ title, lead }) {
  return (
    <section className="student-panel">
      <header className="student-header">
        <div className="student-headerCopy">
          <h1>{title}</h1>
          <p>{lead}</p>
        </div>
      </header>
    </section>
  );
}

export function StudentOverview() {
  return (
    <section className="student-panel">
      <header className="student-header" style={{ marginBottom: "1.75rem" }}>
        <div className="student-headerCopy">
          <h1>Dashboard</h1>
          <p>Your student dashboard information.</p>
        </div>
      </header>

      <div className="student-gridWrapper">
        <div className="student-chartCard">
          <h2 className="student-sectionTitle">Overall Learning Curve (%)</h2>
          <div className="student-chartContainer">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="studentMaroonGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#780d31" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#780d31" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120,13,49,0.06)" />
                <XAxis dataKey="month" tick={{ fill: "#5c5260" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#5c5260" }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: "#ffffff", borderRadius: "12px", border: "1px solid var(--bt-border)" }}
                  labelStyle={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--bt-ink)" }}
                />
                <Area type="monotone" dataKey="progress" stroke="#780d31" strokeWidth={2.5} fillOpacity={1} fill="url(#studentMaroonGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <StudentPayments />
      </div>
    </section>
  );
}

export function StudentAssignments() {
  return (
    <StudentSection
      title="Assignments"
      lead="Assignments will appear in this section later."
    />
  );
}

export function StudentCoursesPanel() {
  return (
    <StudentSection
      title="Courses"
      lead="Your courses will appear in this section later."
    />
  );
}

export function StudentSettings() {
  return (
    <StudentSection
      title="Settings"
      lead="Account settings will appear in this section later."
    />
  );
}

function StudentDashboard() {
  const { studentName } = useParams();
  const location = useLocation();
  const { state } = useAuthContext();
  const user = state?.user;
  const expectedSlug = toStudentSlug(user?.fullName);

  if (studentName !== expectedSlug) {
    const prefix = `/student-dashboard/${studentName}`;
    const nested = location.pathname.startsWith(prefix)
      ? location.pathname.slice(prefix.length)
      : "";
    return (
      <Navigate
        to={`${getStudentDashboardPath(user)}${nested}${location.search}`}
        replace
      />
    );
  }

  return (
    <div className="student-layout">
      <aside className="student-sidebar">
        <div className="student-brand">
          <NavLink to="/" className="student-brandMark">
            Bright <span>tech</span>
          </NavLink>
          <p className="student-brandSub">Student workspace</p>
        </div>

        <nav className="student-nav" aria-label="Student">
          <p className="student-navLabel">Workspace</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `student-navLink${isActive ? " active" : ""}`
              }
            >
              <span className="student-navDot" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="student-sidebarFoot">
          <strong>{user?.fullName || "Student"}</strong>
          <p>Bright tech</p>
        </div>
      </aside>

      <main className="student-content">
        <Outlet />
      </main>
    </div>
  );
}

export default StudentDashboard;
