import { api } from "./axiosInstance.js";

export const getCourses = async () => {
  return await api.get("/courses");
};

export const assignCourseToInstructor = async (instructorId, courseId) => {
  return await api.patch(`/users/assign-course`, { instructorId, courseId });
};