import { useState } from "react"; // 🌟 1. Added state tracking capabilities
import { Link, NavLink } from "react-router-dom";
import "./SiteNav.css";

function SiteNav() {
  // 🌟 2. TRACKER: Toggles the mobile menu slide drawer open or closed
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="site-nav">
      <Link to="/" className="site-brand" onClick={() => setMenuOpen(false)}>
        Bright <span className="site-brandAccent">tech</span>
      </Link>

      {/* 🌟 3. THE MOBILE HAMBURGER BUTTON: Visible ONLY on small viewports */}
      <button 
        className={`site-navToggle ${menuOpen ? "is-active" : ""}`} 
        onClick={toggleMenu}
        aria-label="Toggle Navigation Menu"
      >
        <span className="navToggle-bar"></span>
        <span className="navToggle-bar"></span>
        <span className="navToggle-bar"></span>
      </button>

      {/* 🌟 4. THE CORE LINKS CONTAINER: Appends an 'open' class based on menuOpen state */}
      <div className={`site-navContent ${menuOpen ? "mobile-open" : ""}`}>
        <ul className="site-navLinks">
          <li>
            <NavLink to="/" end onClick={() => setMenuOpen(false)}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/courses" onClick={() => setMenuOpen(false)}>
              Courses
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" onClick={() => setMenuOpen(false)}>
              About
            </NavLink>
          </li>
        </ul>

        <div className="site-navActions">
          <Link to="/login" onClick={() => setMenuOpen(false)} className="site-btnGhost">
            Log in
          </Link>
          <Link to="/register" onClick={() => setMenuOpen(false)} className="site-btnPrimary">
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default SiteNav;
