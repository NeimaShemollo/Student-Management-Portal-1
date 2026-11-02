import { api } from "./axiosInstance.js";

export const register = (formData) => {
  return api.post("/user/register", formData,);
};


export const registerStaff = (staffData) => {
  return api.post("/user/register-staff", staffData,
  );
};
 

export const getStudents = () => {
  return api.get("/user/students-list",
  );
};

export const getInstructors = () => {
  return api.get("/user/instructors-list",
  );
};
export const updateUserStatus =(id,statusData) =>{
  return api.patch(`/user/user/status/${id}`,statusData)
}
export const updateInstructorStatus =(id,statusData) => {
  return api.patch(`/user/instructor/status/${id}`,statusData)
}
