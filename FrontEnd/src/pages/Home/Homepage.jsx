import { Link } from "react-router-dom";
import { BookOpen, Code2, Hammer, TrendingUp, ArrowRight } from "lucide-react";
import SiteNav from "../../components/common/SiteNav.jsx";
import "./Homepage.css";

const learningSteps = [
  {
    title: "Learn",
    text: "Start with clear lessons from expert instructors that build real foundations.",
    Icon: BookOpen,
  },
  {
    title: "Practice",
    text: "Apply every concept through guided exercises and hands-on coding challenges.",
    Icon: Code2,
  },
  {
    title: "Build",
    text: "Ship portfolio projects that mirror real workplace problems and workflows.",
    Icon: Hammer,
  },
  {
    title: "Grow",
    text: "Level up with feedback, community support, and career-ready skills.",
    Icon: TrendingUp,
  },
];

function Homepage() {
  return (
    <div className="landing">
      <SiteNav />

      <section className="hero">
        <div className="heroBg" aria-hidden="true" />

        <div className="heroInner">
          <div className="heroCopy">
            <p className="brandMark">Bright tech</p>
            <h1>
              Master Your Future with{" "}
              <em className="heroTitleAccent">Bright tech</em>
            </h1>
            <p className="heroText">
              Empowering ambitious minds with world-class education. Discover
              rigorous programs, expert faculty, and a community dedicated to
              your professional growth.
            </p>

            <div className="heroCtas">
              <Link to="/courses" className="btnPrimary btnLg">
                Explore Courses
              </Link>
              <Link to="/register" className="btnSecondary btnLg">
                Get Started
              </Link>
            </div>
          </div>

          <div className="heroVisual">
            <div className="heroFrame">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                alt="Students collaborating on technology projects"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        className="learnExperience"
        aria-labelledby="learn-experience-title"
      >
        <div className="learnExperienceInner">
          <header className="learnExperienceHeader">
            <p className="learnExperienceEyebrow">How learning works</p>
            <h2 id="learn-experience-title">
              The Bright tech learning experience
            </h2>
            <p className="learnExperienceLead">
              A clear path from first lesson to lasting growth—so every student
              knows what comes next.
            </p>
          </header>

          <ol className="learnPath">
            {learningSteps.map((step, index) => (
              <li key={step.title} className="learnStep">
                <div className="learnStepIcon" aria-hidden="true">
                  <step.Icon size={28} strokeWidth={2} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                {index < learningSteps.length - 1 && (
                  <span className="learnStepArrow" aria-hidden="true">
                    <ArrowRight size={20} strokeWidth={2.25} />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

export default Homepage;
