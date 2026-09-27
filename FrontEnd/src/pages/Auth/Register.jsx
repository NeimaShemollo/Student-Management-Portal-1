import { useState } from "react";
import "./Register.css";
import { register } from "../../service/userService.js";
import { useNavigate, Link } from "react-router-dom";

const initialFormData = {
  fullName: "",
  emailAddress: "",
  phone: "",
  birthDate: "",
  gender: "",
  academicBackground: "", // 🌟 Populated dynamically via the dropdown selection now!
  password: "",
  confirmPassword: "",
};

function Register({ onRegisterSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, ...payload } = formData;

    setLoading(true);
    try {
      const response = await register(payload);
      
      if (onRegisterSuccess) {
        onRegisterSuccess(response.data);
      } else {
        setSuccessMessage("✓ Registration successful! Redirecting you to login...");
        setFormData(initialFormData);

        setTimeout(() => {
          navigate("/login");
        }, 3000); 
      } 
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <span className="register-eyebrow">Student Portal</span>
        <h2>Create your account</h2>
        <p className="register-subtitle">
          It only takes a couple of minutes to get started
        </p>

        {successMessage && (
          <p className="register-success" style={{ color: "#28a745", background: "#f4fdf6", border: "1px solid #d4edda", padding: "10px", borderRadius: "8px", fontWeight: "600", textAlign: "center" }}>
            {successMessage}
          </p>
        )}
        
        {error && <p className="register-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="register-formSection">
            <div className="register-sectionTitle">Personal details</div>
            <div className="register-formGrid">
              <div className="register-inputGroup register-fullWidth">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="register-inputGroup">
                <label>Birth Date</label>
                <input
                  type="date"
                  name="birthDate"
                  max="2010-12-31"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="register-inputGroup">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

               
              <div className="register-inputGroup register-fullWidth">
                <label>Academic Background</label>
                <select
                  name="academicBackground"
                  value={formData.academicBackground}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", background: "#fff", fontSize: "0.95rem" }}
                >
                  <option value="" disabled>
                    -- Select your education background level --
                  </option>
                  <option value="High School">High School Graduate</option>
                  <option value="Diploma">Diploma Student / Graduate</option>
                  <option value="Bachelor">Bachelor's Degree Graduate</option>
                  <option value="Master">Master's Degree Graduate</option>
                  <option value="PhD">PhD / Doctorate Level</option>
                  <option value="Other">Other Qualifications</option>
                </select>
              </div>
            </div>
          </div>

          <div className="register-formSection">
            <div className="register-sectionTitle">Contact</div>
            <div className="register-formGrid">
              <div className="register-inputGroup">
                <label>Email</label>
                <input
                  type="email"
                  name="emailAddress"
                  placeholder="@gmail.com"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="register-inputGroup">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="09xxxxxxxx"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

                    <div className="register-formSection">
            <div className="register-sectionTitle">Account security</div>
            <div className="register-formGrid">
              
              {/* 🌟 UPDATED: Main Password Field Wrapper Container */}
              <div className="register-inputGroup">
                <label>Password</label>
                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    type={showPassword ? "text" : "password"} // 💡 Dynamic mutation
                    name="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", paddingRight: "40px" }} // Added right padding so text doesn't hide behind the button
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      padding: 0
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* 🌟 UPDATED: Confirm Password Field Wrapper Container */}
              <div className="register-inputGroup">
                <label>Confirm Password</label>
                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"} // 💡 Dynamic mutation
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      padding: 0
                    }}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

            </div>
          </div>


          <button type="submit" className="register-submit" disabled={loading || successMessage}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="register-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
