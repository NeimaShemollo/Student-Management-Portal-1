import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../service/axiosInstance";
import { useAuthContext } from "../../contexts/useAuthContext.jsx";
import { toStudentSlug } from "../Student/studentPath.js";
import "./CourseDetail.css"; // Stylesheet included below

function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { state } = useAuthContext();
  const user = state?.user;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State to track which syllabus module is collapsed/expanded
  const [expandedModule, setExpandedModule] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/course/detail/${courseId}`);
        setCourse(res.data?.data ?? res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load course specification data layers.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [courseId]);

  const handleCheckoutRedirect = (e) => {
    e.preventDefault();
    if (!user) {
      // If logged out, safely pipe them to account signup while holding selection parameters
      navigate("/register", {
        state: {
          fromCourseCheckout: true,
          autoSelectCourseId: courseId,
          autoSelectPrice: course?.coursePrice || 0
        }
      });
    } else {
      // If logged in, route cleanly straight into their checkout workspace portal tab
      const cleanStudentSlug = toStudentSlug(user?.fullName || user?.name || "student");
      navigate(`/student-dashboard/${cleanStudentSlug}/payments`, {
        state: {
          autoSelectCourseId: courseId,
          autoSelectPrice: course?.coursePrice || 0
        }
      });
    }
  };

  if (loading) return <div className="course-detail-loading"><p>Streaming catalog profiles...</p></div>;
  if (error || !course) return <div className="course-detail-error"><p>{error || "Course data not found."}</p></div>;

  const backendBaseURL = "http://localhost:5000";
  const thumbnailSrc = course.image ? `${backendBaseURL}/${course.image}` : "uploads/default-placeholder.png";

  return (
    <div className="course-detail-page">
      {/* 1. Header Banner Context Block */}
      <div className="course-detail-hero">
        <div className="course-detail-hero-content">
          <Link to="/courses" className="course-back-link">← Back to Catalog</Link>
          <span className="course-detail-badge">{course.programType || "Academy Module"}</span>
          <h1>{course.courseName}</h1>
          <p className="course-hero-sub">Master this curriculum under professional instruction. Batch reference code: <strong>{course.courseCode}</strong></p>
          
          <div className="course-hero-meta">
            <span>⏱️ <strong>Duration:</strong> {course.courseDuration || "N/A"}</span>
            <span>📦 <strong>Batch:</strong> {course.batchNumber || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* 2. Dual Column Structural Grid Wrapper */}
      <div className="course-detail-body-wrapper">
        
        {/* LEFT COLUMN: In-depth Descriptions, Syllabus & Teacher context */}
        <main className="course-detail-main-content">
          
          {/* About Section */}
          <section className="course-detail-section">
            <h2>About This Course</h2>
            <p className="course-description-text">
              {course.description || "No description overview information has been loaded yet for this track block module."}
            </p>
          </section>

          {/* Collapsible Syllabus Accordion Curriculum Map */}
          <section className="course-detail-section">
            <h2>Curriculum Syllabus Structure</h2>
            <p style={{ color: "#5c5260", marginBottom: '1rem', fontSize: '0.9rem' }}>Click on a module chapter row header block to expand its core lecture subjects:</p>
            
            <div className="course-syllabus-accordion">
              {course.modules && course.modules.length > 0 ? (
                course.modules.map((mod, mIdx) => (
                  <div key={mIdx} className={`syllabus-accordion-item ${expandedModule === mIdx ? "is-active" : ""}`}>
                    <button className="syllabus-accordion-header" onClick={() => setExpandedModule(expandedModule === mIdx ? -1 : mIdx)}>
                      <strong>{mod.title}</strong>
                      <span>{expandedModule === mIdx ? "▲" : "▼"}</span>
                    </button>
                    
                    {expandedModule === mIdx && (
                      <div className="syllabus-accordion-body">
                        {mod.lessons && mod.lessons.length > 0 ? (
                          <ul className="syllabus-lessons-list">
                            {mod.lessons.map((les, lIdx) => (
                              <li key={lIdx}>
                                <span>{les.type === "video" ? "🎥" : les.type === "quiz" ? "📝" : "📄"} {les.name}</span>
                                <small style={{ color: "#5c5260" }}>{les.duration || ""}</small>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="syllabus-empty-text">No lecture parameters configured for this chapter level yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="syllabus-empty-text">Syllabus structural details will be published shortly by your instructor.</p>
              )}
            </div>
          </section>
        </main>

        {/* RIGHT COLUMN: Floating Sticky Checkout Element Widget */}
        <aside className="course-detail-sticky-sidebar">
          <div className="course-checkout-card">
            <div className="course-card-image-box">
              <img src={thumbnailSrc} alt={course.courseName} />
            </div>
            
            <div className="course-checkout-card-body">
              <div className="course-price-tag">
                <small>Tuition Fee Cost:</small>
                <h3>ETB {course.coursePrice?.toLocaleString() || "0.00"}</h3>
              </div>

              <button className="course-enroll-cta-btn" onClick={handleCheckoutRedirect}>
                Register and Secure Spot ➔
              </button>

              <div className="course-card-guarantees">
                <p>✓ 100% Secure Portal Verification</p>
                <p>✓ Official Certificate of Training Completion</p>
                <p>✓ Direct Instructor Review Evaluations</p>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

export default CourseDetail;
