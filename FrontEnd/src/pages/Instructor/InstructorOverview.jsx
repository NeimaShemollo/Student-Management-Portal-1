import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from "recharts";

// Mock data tracking active registrations vs student course completions
const courseAnalyticsData = [
  { course: "Web Dev", enrolled: 45, completed: 12 },
  { course: "UI/UX", enrolled: 30, completed: 8 },
  { course: "Data Sci", enrolled: 25, completed: 5 },
  { course: "DevOps", enrolled: 18, completed: 3 },
];

export function InstructorOverview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
      
      {/* 1. Statistics Summary Row (Moves inside individual component view) */}
      <section className="instructor-stats" aria-label="Instructor overview" style={{ padding: 0 }}>
        <article className="instructor-statCard">
          <span>Total Students</span>
          <strong>118</strong>
        </article>
        <article className="instructor-statCard">
          <span>Assigned Tracks</span>
          <strong>4</strong>
        </article>
        <article className="instructor-statCard">
          <span>Pending Submissions</span>
          <strong>24</strong>
        </article>
      </section>

      {/* 2. Responsive Dashboard Split Grid Container */}
      <div className="instructor-gridWrapper">
        
        {/* Left Card Area: Bar Chart Metrics Visualizer */}
        <div className="instructor-chartCard">
          <h2 className="instructor-sectionTitle">Enrollment & Completions</h2>
          <div className="instructor-chartContainer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseAnalyticsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120,13,49,0.06)" />
                <XAxis dataKey="course" tick={{ fill: "#5c5260" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#5c5260" }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: "rgba(120, 13, 49, 0.02)" }}
                  contentStyle={{ background: "#ffffff", borderRadius: "12px", border: "1px solid var(--bt-border)" }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                {/* Active students bar utilizing theme maroon colors */}
                <Bar name="Active Students" dataKey="enrolled" fill="#780d31" radius={[4,4,0,0]} maxBarSize={25} />
                {/* Completed students bar tracking dark neutral text frames */}
                <Bar name="Completed" dataKey="completed" fill="#5c5260" opacity={0.4} radius={0} maxBarSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Card Area: Real-Time Action Grading Log */}
        <div className="instructor-chartCard">
          <h2 className="instructor-sectionTitle">Grading Pipeline Queue</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
            <div className="instructor-sidebarFoot" style={{ margin: 0, padding: "0.85rem 1rem", background: "var(--bt-maroon-soft)" }}>
              <strong style={{ fontSize: "0.85rem" }}>Web Development — Assignment #2</strong>
              <p style={{ fontSize: "0.78rem", margin: 0 }}>14 submissions waiting for review</p>
            </div>
            <div className="instructor-sidebarFoot" style={{ margin: 0, padding: "0.85rem 1rem", background: "transparent" }}>
              <strong style={{ fontSize: "0.85rem", color: "var(--bt-ink)" }}>UI/UX Design — Final Project</strong>
              <p style={{ fontSize: "0.78rem", margin: 0 }}>10 submissions waiting for review</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
