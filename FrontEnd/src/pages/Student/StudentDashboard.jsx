import { NavLink, Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../../contexts/useAuthContext.jsx";
import { getStudentDashboardPath, toStudentSlug } from "./studentPath.js";
import StudentPayments from "./StudentPayments.jsx";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react"; // Added missing state imports
import { api } from "../../service/axiosInstance"; // Added API instance import
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
  const [submissions, setSubmissions] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [formData, setFormData] = useState({ courseId: "", title: "", repoUrl: "", notes: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        setLoading(true);
        // 1. Fetch student's course list for the dropdown select input
        const courseRes = await api.get("/student/my-courses");
        setMyCourses(courseRes.data?.data ?? []);

        // 2. Fetch past submission logs
        const subRes = await api.get("/student/my-assignments");
        setSubmissions(subRes.data?.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignmentData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await api.post("/student/submit-assignment", formData);
      setMessage("Assignment submitted successfully!");
      setSubmissions((prev) => [res.data.data, ...prev]);
      setFormData({ courseId: "", title: "", repoUrl: "", notes: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit assignment.");
    }
  };

  
  return (
    <section className="student-panel">
      <header className="student-header" style={{ marginBottom: "1.5rem" }}>
        <div className="student-headerCopy">
          <h1>Assignments Hub</h1>
          <p>Submit project repositories and view grading feedback flags from instructors.</p>
        </div>
      </header>

      {message && <p className="student-success">{message}</p>}
      {error && <p className="student-error">{error}</p>}

      <div className="student-gridWrapper">
        {/* Left Column: Interactive Submission Form */}
        <div className="student-paymentCard" style={{ margin: 0 }}>
          <h2 className="student-sectionTitle">Submit Work</h2>
          <form onSubmit={handleSubmit} className="student-paymentForm" style={{ marginTop: "1rem" }}>
            <div className="student-paymentField student-paymentField--full">
              <label>Select Enrolled Course</label>
              <select name="courseId" value={formData.courseId} onChange={handleChange} required>
                <option value="">Choose Course...</option>
                {myCourses.map((c) => (
                  <option key={c._id} value={c._id}>{c.courseName}</option>
                ))}
              </select>
            </div>

            <div className="student-paymentField student-paymentField--full">
              <label>Assignment Title</label>
              <input type="text" name="title" placeholder="e.g., Assignment 1: Basic UI Layout" value={formData.title} onChange={handleChange} required />
            </div>

            <div className="student-paymentField student-paymentField--full">
              <label>Repository / Project Link</label>
              <input type="url" name="repoUrl" placeholder="https://github.com" value={formData.repoUrl} onChange={handleChange} required />
            </div>

            <div className="student-paymentField student-paymentField--full">
              <label>Notes for Teacher</label>
              <input type="text" name="notes" placeholder="Optional notes..." value={formData.notes} onChange={handleChange} />
            </div>

            <button type="submit" className="student-submitBtn">Upload Task</button>
          </form>
        </div>

        {/* Right Column: Submission History / Status Ledger */}
        <div className="student-paymentCard" style={{ margin: 0, overflowY: "auto", maxHeight: "450px" }}>
          <h2 className="student-sectionTitle">Submission Records</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "1rem" }}>
            {loading ? (
              <p style={{ color: "var(--bt-muted)" }}>Loading records...</p>
            ) : submissions.length === 0 ? (
              <p style={{ color: "var(--bt-muted)", fontSize: "0.9rem" }}>No assignments uploaded yet.</p>
            ) : (
              submissions.map((sub) => (
                <div key={sub._id} className="student-sidebarFoot" style={{ margin: 0, padding: "1rem", background: "var(--bt-surface)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.9rem" }}>{sub.title}</strong>
                    <span className={`student-statusBadge student-statusBadge--${sub.status === "graded" ? "approved" : "pending"}`}>
                      {sub.status === "graded" ? `Grade: ${sub.grade}` : "Pending Review"}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.78rem", margin: "4px 0" }}>
                    🔗 <a href={sub.repoUrl} target="_blank" rel="noreferrer" style={{ color: "var(--bt-maroon)", textDecoration: "none" }}>View Repository</a>
                  </p>
                  {sub.feedback && (
                    <p style={{ fontSize: "0.8rem", margin: "6px 0 0 0", color: "var(--bt-muted)", borderLeft: "2px solid var(--bt-maroon)", paddingLeft: "8px", fontStyle: "italic" }}>
                      " {sub.feedback} "
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
  


// 🌟 DYNAMICALLY UPDATED: This replaces your old static placeholder panel perfectly
export function StudentCoursesPanel() {
  const navigate =useNavigate();
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get("/payment/student/my-courses");
        const rows = res.data?.data ?? res.data ?? [];
        setMyCourses(Array.isArray(rows) ? rows : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load active courses catalog.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <section className="student-panel">
      <header className="student-header">
        <div className="student-headerCopy">
          <h1>My Active Courses</h1>
          <p>Access your unlocked academy modules, schedules, and training resources.</p>
        </div>
      </header>

      {error && <p className="student-error" style={{ marginTop: "1rem" }}>{error}</p>}

      {loading ? (
        <p style={{ color: "var(--bt-muted)", marginTop: "1.5rem" }}>Loading courses…</p>
      ) : myCourses.length === 0 ? (
        <div className="student-paymentCard" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <p style={{ color: "var(--bt-muted)", margin: 0 }}>You are not enrolled in any active classes yet.</p>
        </div>
      ) : (
        <div className="student-coursesGrid">
          {myCourses.map((course) => (
            <div key={course._id} className="student-courseCard">
              <div>
                <div className="student-courseCardMeta">
                  <span className="student-statusBadge student-statusBadge--approved" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                    {course.courseCode}
                  </span>
                  <small style={{ color: "var(--bt-muted)", fontWeight: 600 }}>{course.programType}</small>
                </div>
                <h3 className="student-sectionTitle" style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>
                  {course.courseName}
                </h3>
                <p style={{ color: "var(--bt-muted)", fontSize: "0.88rem", lineHeight: 1.4, margin: "0 0 1.25rem 0" }}>
                  {course.description || "No course description information has been loaded yet."}
                </p>
              </div>

              <div style={{ borderTop: "1px solid var(--bt-border)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--bt-ink)", fontWeight: 600 }}>
                  ⏱ {course.courseDuration || "N/A"}
                </span>
                <button 
                  type="button" 
                  className="student-submitBtn" 
                  style={{ margin: 0, padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "0.85rem" }}
                  onClick={() => navigate(`../courses/${course._id}`)} 
                >
                  Enter Classroom
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
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
