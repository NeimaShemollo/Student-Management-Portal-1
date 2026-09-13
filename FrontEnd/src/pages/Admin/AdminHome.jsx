import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from "recharts";

// Mock metrics data for your dashboard
const enrollmentData = [
  { name: "Jan", students: 120 },
  { name: "Feb", students: 210 },
  { name: "Mar", students: 450 },
  { name: "Apr", students: 380 },
  { name: "May", students: 590 },
  { name: "Jun", students: 820 },
];

const revenueData = [
  { course: "Web Dev", revenue: 4500 },
  { course: "UI/UX", revenue: 3200 },
  { course: "Data Sci", revenue: 5100 },
  { course: "DevOps", revenue: 2800 },
];

function AdminHome() {
  return (
    <div className="admin-page">
      {/* 1. Quick Stats Grid */}
      <section className="admin-stats" aria-label="Quick overview" style={{ padding: 0 }}>
        <article className="admin-statCard">
          <span>Total Students</span>
          <strong>820</strong>
        </article>
        <article className="admin-statCard">
          <span>Active Courses</span>
          <strong>14</strong>
        </article>
        <article className="admin-statCard">
          <span>Monthly Revenue</span>
          <strong>$15.6K</strong>
        </article>
      </section>

      {/* 2. Charts Layout Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        
        {/* Registration Area Chart */}
        <div className="admin-card">
          <h3>Student Registrations</h3>
          <div style={{ width: "100%", height: 260, fontSize: "0.85rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="maroonGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#780d31" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#780d31" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120,13,49,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "#5c5260" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#5c5260" }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: "#ffffff", borderRadius: "12px", border: "1px solid rgba(120,13,49,0.12)" }}
                  labelStyle={{ fontFamily: "Syne", fontWeight: 700, color: "#1a1216" }}
                />
                <Area type="monotone" dataKey="students" stroke="#780d31" strokeWidth={2.5} fillOpacity={1} fill="url(#maroonGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Revenue Bar Chart */}
        <div className="admin-card">
          <h3>Revenue by Track ($)</h3>
          <div style={{ width: "100%", height: 260, fontSize: "0.85rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120,13,49,0.06)" />
                <XAxis dataKey="course" tick={{ fill: "#5c5260" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#5c5260" }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: "rgba(120, 13, 49, 0.03)" }}
                  contentStyle={{ background: "#ffffff", borderRadius: "12px", border: "1px solid rgba(120,13,49,0.12)" }}
                />
                <Bar dataKey="revenue" fill="#780d31" radius={[8, 8, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminHome;
