import { api } from "./axiosInstance.js";

export const getCourses = async () => {
  // UPDATED: changed from /courses to /course/view
  return await api.get("/course/view"); 
};

export const assignCourseToInstructor = async (instructorId, courseId) => {
  return await api.patch(`/users/assign-course`, { instructorId, courseId });
};