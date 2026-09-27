import { NavLink, Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../../contexts/useAuthContext.jsx";
import { getStudentDashboardPath, toStudentSlug } from "./studentPath.js";
// import StudentPayments from "./StudentPayments.jsx";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react"; // Added missing state imports
import { api } from "../../service/axiosInstance"; // Added API instance import
import "./StudentDashboard.css";
import {formatPaymentStatus,getCourseIdDisplay,getMyPayments,paymentStatusClass,submitPayment,} from "../../service/paymentService.js"

const navItems = [
  { to: ".", label: "Dashboard", end: true },
  { to: "assignments", label: "Assignments", end: false },
  { to: "courses", label: "Courses", end: false },
  { to: "payments", label: "Payments", end: false },
  { to: "settings", label: "Settings", end: false },
  
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
  const { state } = useAuthContext();
  const user = state?.user;

  // React State Trackers for dynamic analytics injection
  const [metrics, setMetrics] = useState({ enrolledCount: "0 Courses", taskCompletion: "0 / 0", attendanceRate: "0 %" });
  const [curveData, setCurveData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveDashboardAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get("/payment/dashboard-overview");
        
        if (res.data?.success) {
          setMetrics(res.data.metrics);
          setCurveData(res.data.learningCurve);
        }
      } catch (err) {
        console.error("Failed to load live metric telemetry:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveDashboardAnalytics();
  }, []);

  const stats = [
    { label: "Enrolled Programs", value: metrics.enrolledCount, icon: "📚", color: "#eef2f7" },
    { label: "Tasks Completed", value: metrics.taskCompletion, icon: "✅", color: "#eef7ed" },
    { label: "Attendance Rate", value: metrics.attendanceRate, icon: "🎯", color: "#fdf7ee" },
  ];

  const mockDeadlines = [
    { title: "React State Handling Lab", course: "Full-Stack Web Dev", due: "In 2 days", urgency: "high" },
    { title: "Python OOP Inheritance Script", course: "Python Masters", due: "In 5 days", urgency: "medium" },
  ];

  if (loading) {
    return <p style={{ padding: "2rem", color: "var(--bt-muted)" }}>Synchronizing dashboard control indicators...</p>;
  }

  return (
    <section className="student-panel">
      <header className="student-header" style={{ marginBottom: "1.75rem" }}>
        <div className="student-headerCopy">
          <h1>Welcome Back, {user?.fullName || user?.name || "Student"} 👋</h1>
          <p>Your workspace controls are completely active and synchronized with the academy database.</p>
        </div>
      </header>

      {/* Metrics Row Blocks - Render Live Database Counts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "20px" }}>
        {stats.map((stat, i) => (
          <div key={i} className="student-paymentCard" style={{ margin: 0, padding: "1.25rem", background: "#fff", display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ fontSize: "2rem", padding: "10px", background: stat.color, borderRadius: "10px" }}>{stat.icon}</div>
            <div>
              <small style={{ color: "var(--bt-muted)", fontWeight: "600", fontSize: "0.85rem" }}>{stat.label}</small>
              <h3 style={{ margin: "2px 0 0 0", fontSize: "1.4rem", color: "var(--bt-ink)" }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="student-gridWrapper" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        
        {/* Live Learning Analytics Chart Graphic Box */}
        <div className="student-chartCard" style={{ margin: 0, padding: "1.5rem" }}>
          <h2 className="student-sectionTitle" style={{ marginBottom: "1rem" }}>Overall Learning Curve (%)</h2>
          <div className="student-chartContainer" style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              {/* Uses curveData fetched directly out of MongoDB collection fields! */}
              <AreaChart data={curveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

        {/* Task Notification Feed Panel */}
        <div className="student-paymentCard" style={{ margin: 0, padding: "1.5rem" }}>
          <h2 className="student-sectionTitle" style={{ marginBottom: "1rem" }}>Action Needed</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "1rem" }}>
            {mockDeadlines.map((task, i) => (
              <div key={i} style={{ padding: "12px", borderLeft: `4px solid ${task.urgency === "high" ? "#dc3545" : "#ffc107"}`, background: "var(--bt-surface)", borderRadius: "0 6px 6px 0" }}>
                <strong style={{ display: "block", fontSize: "0.9rem", color: "var(--bt-ink)" }}>{task.title}</strong>
                <span style={{ fontSize: "0.8rem", color: "var(--bt-muted)" }}>{task.course}</span>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "0.78rem" }}>
                  <span style={{ color: task.urgency === "high" ? "#dc3545" : "#b58100", fontWeight: "600" }}>⏰ {task.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

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
        const courseRes = await api.get("/payment/student/my-courses");
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
  const { state } = useAuthContext();
  const user = state?.user;

  // Form input hook state trackers
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  // Preference switches hook trackers
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation fields do not match.");
      return;
    }

    try {
      setUpdating(true);
      
      const payload = { currentPassword, newPassword };
      // Connects to your standard /users/update-password backend security profile endpoints 
      const res = await api.put("/users/update-password", payload); 
      
      setMessage(res.data?.message || "Security credentials updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update security credentials.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <section className="student-panel">
      {/* Settings Top Heading Banner Layout */}
      <header className="student-header" style={{ marginBottom: "1.75rem" }}>
        <div className="student-headerCopy">
          <h1>Account Settings</h1>
          <p>Manage your profile personalization, password credentials, and system portal preferences.</p>
        </div>
      </header>

      {message && <p className="student-success" style={{ color: "#28a745", fontWeight: "600", marginBottom: "1rem" }}>✓ {message}</p>}
      {error && <p className="student-error" style={{ color: "#780d31", fontWeight: "600", marginBottom: "1rem" }}>⚠️ {error}</p>}

      <div className="student-gridWrapper" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", alignItems: "start" }}>
        
        {/* LEFT COLUMN: Identity Profile Context Card & Dashboard Interface Switches */}
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          
          {/* Identity Snapshot Card */}
          <div className="student-paymentCard" style={{ margin: 0, padding: "1.5rem", background: "#fff" }}>
            <h2 className="student-sectionTitle" style={{ marginBottom: "1.25rem" }}>Personal Information</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <small style={{ color: "var(--bt-muted)", fontWeight: "600", fontSize: "0.8rem", display: "block" }}>Full Name</small>
                <strong style={{ fontSize: "1.1rem", color: "var(--bt-ink)" }}>{user?.fullName || user?.name || "Active Student"}</strong>
              </div>
              <div style={{ marginTop: "5px" }}>
                <small style={{ color: "var(--bt-muted)", fontWeight: "600", fontSize: "0.8rem", display: "block" }}>Email Address</small>
                <span style={{ fontSize: "1rem", color: "var(--bt-ink)" }}>{user?.emailAddress || user?.email || "N/A"}</span>
              </div>
              <div style={{ marginTop: "5px" }}>
                <small style={{ color: "var(--bt-muted)", fontWeight: "600", fontSize: "0.8rem", display: "block" }}>User Account Role</small>
                <span className="student-statusBadge student-statusBadge--approved" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", display: "inline-block", marginTop: "4px" }}>
                  {user?.role ? user.role.toUpperCase() : "STUDENT"}
                </span>
              </div>
            </div>
          </div>

          {/* Application Preferences Card */}
          <div className="student-paymentCard" style={{ margin: 0, padding: "1.5rem", background: "#fff" }}>
            <h2 className="student-sectionTitle" style={{ marginBottom: "1.25rem" }}>Portal Preferences</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "0.95rem", color: "var(--bt-ink)" }}>Email Notifications</strong>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--bt-muted)" }}>Receive grading alerts and deadline tags.</p>
                </div>
                <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} style={{ width: "20px", height: "20px", cursor: "pointer" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--bt-border)", paddingTop: "12px" }}>
                <div>
                  <strong style={{ fontSize: "0.95rem", color: "var(--bt-ink)" }}>Dark Interface Mode</strong>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--bt-muted)" }}>Toggle workspace layout illumination parameters.</p>
                </div>
                <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} style={{ width: "20px", height: "20px", cursor: "pointer" }} />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Secure Account Password Configuration Update Form */}
        <div className="student-paymentCard" style={{ margin: 0, padding: "1.5rem", background: "#fff" }}>
          <h2 className="student-sectionTitle" style={{ marginBottom: "1rem" }}>Update Password</h2>
          <form onSubmit={handlePasswordUpdate} className="student-paymentForm" style={{ marginTop: "1rem" }}>
            
            <div className="student-paymentField student-paymentField--full">
              <label style={{ fontWeight: "600", fontSize: "0.85rem" }}>Current Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)} 
              />
            </div>

            <div className="student-paymentField student-paymentField--full">
              <label style={{ fontWeight: "600", fontSize: "0.85rem" }}>New Secure Password</label>
              <input 
                type="password" 
                placeholder="Minimum 6 characters" 
                required 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} 
                minLength={6}
              />
            </div>

            <div className="student-paymentField student-paymentField--full">
              <label style={{ fontWeight: "600", fontSize: "0.85rem" }}>Confirm New Password</label>
              <input 
                type="password" 
                placeholder="Re-type new password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />
            </div>

            <button type="submit" className="student-submitBtn" disabled={updating} style={{ marginTop: "1rem" }}>
              {updating ? "Saving Credentials..." : "Update Security Settings"}
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}



export function StudentPayments() {
  const emptyForm = {
  courseId: "",
  coursePrice: "",
  amount: "",
  paymentMethod: "Transfer",
  paymentType: "full",
  transactionId: "",
};
  const [payments, setPayments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]); // Holds courses from backend
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState(emptyForm);

  const loadPayments = async () => {
    const res = await getMyPayments();
    const rows = res.data?.data ?? [];
    setPayments(Array.isArray(rows) ? rows : []);
  };

  useEffect(() => {
    let cancelled = false;

    // 1. Fetch user payments
    getMyPayments()
      .then((res) => {
        if (cancelled) return;
        const rows = res.data?.data ?? [];
        setPayments(Array.isArray(rows) ? rows : []);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.message || err.message || "Unable to load payment history.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // 2. Fetch courses list to populate dropdown
    api.get("/course/view")
      .then((res) => {
        if (cancelled) return;
        const rows = res.data?.data ?? res.data ?? [];
        setAvailableCourses(Array.isArray(rows) ? rows : []);
      })
      .catch((err) => {
        console.error("Failed to load courses for selection", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If student changes Course selection, find the course and autofill data
    if (name === "courseSelect") {
      const selectedCourse = availableCourses.find((c) => c._id === value);
      if (selectedCourse) {
        setFormData((prev) => ({
          ...prev,
          courseId: selectedCourse._id,
          coursePrice: selectedCourse.price || selectedCourse.coursePrice || selectedCourse.courseDuration || "", 
          amount: prev.paymentType === "full" ? (selectedCourse.price || selectedCourse.coursePrice || "") : prev.amount
        }));
      } else {
        // Reset fields if they select the empty option
        setFormData((prev) => ({ ...prev, courseId: "", coursePrice: "", amount: "" }));
      }
      return;
    }

    setFormData((prev) => {
      if (name === "paymentMethod" && value === "Cash") {
        return { ...prev, paymentMethod: value, transactionId: "" };
      }
      if (name === "paymentType" && value === "full") {
        return { ...prev, paymentType: value, amount: prev.coursePrice };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const paymentData = {
        courseId: formData.courseId.trim(),
        coursePrice: formData.coursePrice,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        paymentType: formData.paymentType,
      };

      if (formData.paymentMethod === "Transfer") {
        paymentData.transactionId = formData.transactionId.trim();
      }

      const res = await submitPayment(paymentData);
      setMessage(res.data?.message || "Payment submitted successfully. Waiting for admin approval.");
      setFormData(emptyForm);
      await loadPayments();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to submit payment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Payment History Table Section */}
      <div className="student-paymentCard">
        <h2 className="student-sectionTitle">Payment History</h2>
        {loading && <p className="student-status">Loading your payments…</p>}
        {!loading && payments.length === 0 && <p className="student-status">No payments submitted yet.</p>}
        {!loading && payments.length > 0 && (
          <div className="student-tableWrap">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Course ID</th>
                  <th>Course Price</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Transaction ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{getCourseIdDisplay(payment.courseId)}</td>
                    <td>{payment.coursePrice}</td>
                    <td>{payment.amount}</td>
                    <td>{payment.paymentMethod}</td>
                    <td>{payment.transactionId}</td>
                    <td>
                      <span className={`student-statusBadge student-statusBadge--${paymentStatusClass(payment.status)}`}>
                        {formatPaymentStatus(payment.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit Payment Form Section */}
      <div className="student-paymentCard">
        <h2 className="student-sectionTitle">Submit Payment</h2>
        {message && <p className="student-success">{message}</p>}
        {error && <p className="student-error">{error}</p>}
        <form className="student-paymentForm" onSubmit={handleSubmit}>
          
          {/* Course Dropdown */}
          <div className="student-paymentField">
            <label htmlFor="courseSelect">Select Course</label>
            <select
              id="courseSelect"
              name="courseSelect"
              value={formData.courseId}
              onChange={handleChange}
              required
            >
              <option value="">-- Select a Course --</option>
              {availableCourses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseName || course.name ||"Unnamed Course"} ({course.courseCode || "No Code"})
                </option>
              ))}
            </select>
          </div>

          {/* Auto-populated Course ID Field */}
          <div className="student-paymentField">
            <label htmlFor="courseId">Course ID</label>
            <input
              id="courseId"
              type="text"
              name="courseId"
              value={formData.courseId}
              readOnly
              placeholder="Select a course above"
              required
            />
          </div>

          {/* Auto-populated Course Price Field */}
          <div className="student-paymentField">
            <label htmlFor="coursePrice">Course Price</label>
            <input
              id="coursePrice"
              type="number"
              name="coursePrice"
              value={formData.coursePrice}
              readOnly
              placeholder="0.00"
              required
            />
          </div>

          {/* Fixed Amount to Pay Field (Resolved cutoff error) */}
          <div className="student-paymentField">
            <label htmlFor="amount">Amount to Pay</label>
            <input
              id="amount"
              type="number"
              name="amount"
              min="1"
              step="any"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Payment Method Field */}
          <div className="student-paymentField">
            <label htmlFor="paymentMethod">Payment Method</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="Transfer">Transfer</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
          
          {/* Payment Type Field */}
          <div className="student-paymentField">
            <label htmlFor="paymentType">Payment Type</label>
            <select
              id="paymentType"
              name="paymentType"
              value={formData.paymentType}
              onChange={handleChange}
              required
            >
              <option value="full">Full Payment</option>
              <option value="partial">Partial Payment</option>
            </select>
          </div>

          {/* Conditional Transaction ID Field */}
          {formData.paymentMethod === "Transfer" && (
            <div className="student-paymentField student-paymentField--full">
              <label htmlFor="transactionId">Transaction ID</label>
              <input
                id="transactionId"
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                required
                minLength={5}
              />
            </div>
          )}
          
          {/* Submit Button */}
          <button className="student-submitBtn" type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Payment"}
          </button>
        </form>
      </div>
    </>
  );
}

function StudentDashboard() {
  const { studentName } = useParams();
  const location = useLocation();
  const { state } = useAuthContext();
  const user = state?.user;
  const studentFullName = user?.fullName || user?.name || "";
  const expectedSlug = studentFullName ? toStudentSlug(studentFullName) : "";


  if (location.state?.autoSelectCourseId) {
    // Allows clean passage straight into the inner workspace layout pane
  } else if (expectedSlug && studentName !== expectedSlug) {
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
          <strong>{studentFullName || "Student"}</strong>
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
