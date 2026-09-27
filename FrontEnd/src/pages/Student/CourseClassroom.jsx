import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../service/axiosInstance";

function CourseClassroom() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClassroomDetails = async () => {
      try {
        setLoading(true);
        // Call backend API query route path to load full details
        const res = await api.get(`/course/detail/${courseId}`);
        const data = res.data?.data ?? res.data;
        setCourse(data);
        
        // Auto-select the very first lesson as default display node
        if (data?.modules?.[0]?.lessons?.[0]) {
          setActiveLesson(data.modules[0].lessons[0]);
        }
      } catch (err) {
        console.error("Classroom fetch error:", err);
        setError("Failed to stream syllabus materials layout.");
      } finally {
        setLoading(false);
      }
    };
    fetchClassroomDetails();
  }, [courseId]);

  if (loading) return <p style={{ color: "var(--bt-muted)", padding: "2rem" }}>Launching workspace connection...</p>;
  if (error || !course) return <p className="student-error" style={{ padding: "2rem" }}>{error || "Course registry not found."}</p>;

  return (
    <section className="student-panel">
      <header className="student-header" style={{ marginBottom: "1.5rem" }}>
        <div className="student-headerCopy">
          {/* Navigates cleanly back to the main grid view relative to the active route */}
          <Link to="../courses" style={{ color: "var(--bt-maroon)", fontSize: "0.85rem", textDecoration: "none", fontWeight: 700 }}>← Back to Catalog</Link>
          <h1 style={{ marginTop: "0.5rem", fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--bt-ink)" }}>{course.courseName}</h1>
          <p>Classroom view for batch tracking portal records.</p>
        </div>
      </header>

      <div className="classroom-layout">
        {/* Left Side: Dynamic Modules Sidebar Syllabus Checklists */}
        <aside className="classroom-sidebarCard">
          {course.modules?.map((mod, mIdx) => (
            <div key={mIdx} className="classroom-moduleBlock">
              <div className="classroom-moduleTitle">{mod.title}</div>
              {mod.lessons?.map((les, lIdx) => (
                <div 
                  key={lIdx} 
                  className={`classroom-lessonItem ${activeLesson?.name === les.name ? "active" : ""}`}
                  onClick={() => setActiveLesson(les)}
                >
                  <span style={{ marginRight: "0.4rem" }}>{les.type === "video" ? "▶" : "📄"}</span>
                  {les.name}
                </div>
              ))}
            </div>
          ))}
          {(!course.modules || course.modules.length === 0) && (
            <p style={{ color: "var(--bt-muted)", fontSize: "0.85rem" }}>No syllabus modules published yet.</p>
          )}
        </aside>

        {/* Right Side: Main Interactive Lesson View Screen Workspace */}
        <main className="classroom-viewerCard">
          {activeLesson ? (
            <div>
              <h2 className="student-sectionTitle" style={{ marginBottom: "0.5rem" }}>{activeLesson.name}</h2>
              <span className="student-courseBadge" style={{ fontSize: "0.75rem" }}>
                {activeLesson.type?.toUpperCase()} ({activeLesson.duration || "N/A"})
              </span>
              
              <div style={{ marginTop: "2rem", background: "var(--bt-surface)", borderRadius: "12px", height: "340px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--bt-border)" }}>
                {activeLesson.type === "video" ? (
                  <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                    <p style={{ color: "var(--bt-muted)", marginBottom: "0.5rem" }}>🎥 Live Video Player Container Frame:</p>
                    <code style={{ background: "rgba(0,0,0,0.05)", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.85rem" }}>{activeLesson.contentUrl || "Streaming Link Placeholder"}</code>
                  </div>
                ) : (
                  <div style={{ padding: "2rem", textAlign: "center" }}>
                    <p style={{ color: "var(--bt-muted)", lineHeight: 1.5 }}>{activeLesson.contentUrl || "📄 Reading Document/Resource Frame Context Viewer"}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p style={{ color: "var(--bt-muted)" }}>Select a topic module from the syllabus list layout to begin learning.</p>
          )}
        </main>
      </div>
    </section>
  );
}

export default CourseClassroom;
