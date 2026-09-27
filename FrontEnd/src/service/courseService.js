import { api } from "./axiosInstance.js";

export const getCourses = async () => {
  // UPDATED: changed from /courses to /course/view
  return await api.get("/course/view"); 
};

//  CORRECT OPTION A
export const assignCourseToInstructor = async (instructorId, courseId) => {
  return await api.post("/course/assign-course", { instructorId, courseId });
};

