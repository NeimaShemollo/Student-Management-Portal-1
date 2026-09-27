import { useState } from "react"
import "./RegisterStaff.css"
import { registerStaff } from "../../service/userService.js"

function RegisterStaff() {
    const [message,setMessage] =useState("")
    const [error,setError] =useState("")
    const [formData,setFormData]=useState({
        fullName:"",
        emailAddress:"",
        phone:"",
        birthDate:"",
        gender:"male",
        academicBackground:"",
        selectSupportType:"Online",
        role:"instructor",
    })

    const handleChange =(e) => {
        setFormData({
            ...formData,
            [e.target.name]:e.target.value,
        })
    }
    const handleSubmit =async (e) =>{
        e.preventDefault();
        setMessage("")
        setError("")
        try {
            const res = await registerStaff(formData)
            setMessage(res.data?.message || "Staff registered successfully!")
            setFormData({
        fullName:"",
        emailAddress:"",
        phone:"",
        birthDate:"",
        gender:"male",
        academicBackground:"",
        selectSupportType:"Online",
        role:"instructor",
            })
            console.log(res.data)
        } catch (error) {
            setError(error.response?.data?.message || error.message || "Registration failed")
        }
    }
  return (
    <div className="register-staff-container">
        <h2>Register User</h2>
        {message && <p className="register-staff-success" style={{ color:"green" }}>{message}</p>}
        {error && <p className="register-staff-error" style={{ color:"red" }}>{error}</p>}
        <form className="register-staff-form" onSubmit={handleSubmit}>
         <div className="register-staff-field">
            <label>Full Name:</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
         </div>
          <div className="register-staff-field">
            <label>Email Address:</label>
            <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleChange} required />
         </div>
          <div className="register-staff-field">
            <label>Phone:</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+251..." required />
         </div>
          <div className="register-staff-field">
            <label>Birth Date:</label>
            <input type="date" name="birthDate" max="2010-12-31" value={formData.birthDate} onChange={handleChange} required />
         </div>
         <div className="register-staff-field">
            <label>Gender:</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>

            </select>
         </div>
          <div className="register-staff-field">
            <label>Academic Background:</label>
            <select 
    name="academicBackground" 
    value={formData.academicBackground} 
    onChange={handleChange}
    required
  >
    <option value="">Select Academic Background</option>
    <option value="High School">High School</option>
    <option value="Diploma">Diploma</option>
    <option value="Bachelor">Bachelor's Degree</option>
    <option value="Master">Master's Degree</option>
    <option value="Other">Other</option>
  </select>
         </div>
          <div className="register-staff-field">
            <label>Support Type:</label>
            <select name="selectSupportType" value={formData.selectSupportType} onChange={handleChange}>
                <option value="Online">Online</option>
                <option value="In-person">In-Person</option>
                <option value="Both">Online & In-Person</option>
                
            </select>
         </div>
         <div className="register-staff-field">
            <label>Role:</label>
            <select name="role" value={formData.role} onChange={handleChange}>
                <option value="instructor">Instructor</option>
                <option value="student">Student</option>
            </select>
         </div>
          
         <button className="register-staff-submit" type="submit">Add New User</button>
        </form>

    </div>
  )
}

export default RegisterStaff