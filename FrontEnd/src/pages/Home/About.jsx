import { Link } from "react-router-dom";
import SiteNav from "../../components/common/SiteNav.jsx";
import "./About.css";

function About() {
  return (
    <div className="about-page">
      <SiteNav />

      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About Us</h1>
          <p>Learn. Build. Grow.</p>
          <p>
            We provide practical programming courses to help students build
            real-world skills and become confident developers.
          </p>
        </div>
      </section>

      <section className="about-section">
        <div className="about-text">
          <h2>Who We Are</h2>
          <p>
            We are an online learning platform focused on programming and
            software development. Our goal is to make technology education
            simple, practical, and accessible to everyone.
          </p>
          <p>
            Our courses are designed for beginners and students who want to
            improve their programming skills through practical lessons and
            projects.
          </p>
        </div>

        <div className="about-box">
          <h3>Our Mission</h3>
          <p>
            To help students learn programming skills and prepare themselves
            for real-world opportunities in technology.
          </p>
        </div>
      </section>

      <section className="about-courses">
        <h2>What We Teach</h2>
        <div className="about-course-container">
          <div className="about-course-card">
            <div className="about-icon">JS</div>
            <h3>JavaScript</h3>
            <p>
              Learn JavaScript fundamentals and build interactive web
              applications.
            </p>
          </div>
          <div className="about-course-card">
            <div className="about-icon">FS</div>
            <h3>Full Stack Development</h3>
            <p>
              Learn frontend and backend development using modern technologies.
            </p>
          </div>
          <div className="about-course-card">
            <div className="about-icon">PY</div>
            <h3>Python</h3>
            <p>Learn Python programming and develop practical applications.</p>
          </div>
        </div>
      </section>

      <section className="why-us">
        <h2>Why Choose Us?</h2>
        <div className="why-container">
          <div className="why-card">
            <h3>Practical Learning</h3>
            <p>Learn by building projects instead of only studying theory.</p>
          </div>
          <div className="why-card">
            <h3>Beginner Friendly</h3>
            <p>
              Our lessons are designed to be easy to understand, even for
              beginners.
            </p>
          </div>
          <div className="why-card">
            <h3>Real Projects</h3>
            <p>
              Build projects that help you develop useful programming
              experience.
            </p>
          </div>
          <div className="why-card">
            <h3>Career Focused</h3>
            <p>
              Develop skills that can help you prepare for a career in
              technology.
            </p>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <h2>Start Learning Today</h2>
        <p>Choose a course and start building your programming skills.</p>
        <Link to="/courses" className="about-cta-link">
          Explore Courses
        </Link>
      </section>
    </div>
  );
}

export default About;
