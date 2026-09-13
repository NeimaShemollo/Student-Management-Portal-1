import { Link, NavLink } from "react-router-dom";
import "./SiteNav.css";

function SiteNav() {
  return (
    <nav className="site-nav">
      <Link to="/" className="site-brand">
        Bright <span className="site-brandAccent">tech</span>
      </Link>

      <ul className="site-navLinks">
        <li>
          <NavLink to="/" end>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/courses">Courses</NavLink>
        </li>
        <li>
          <NavLink to="/about">About</NavLink>
        </li>
      </ul>

      <div className="site-navActions">
        <Link to="/login" className="site-btnGhost">
          Log in
        </Link>
           
        <Link to="/register" className="site-btnPrimary">
          Sign up
        </Link>
      </div>
    </nav>
  );
}

export default SiteNav;
