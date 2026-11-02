import { api } from "./axiosInstance.js";

export const login = (emailAddress, password) => {
  return api.post("/auth/login", {
    emailAddress,
    password,
  });
};

export const logout = () => {
  return api.post("/auth/logout");
};


export const checkAdmin = () => {
  return api.get("/user/view");
};

export const forgotPassword = (emailAddress) => {
  return api.post("/auth/forgot-password", { emailAddress });
};

export const refresh = () => {
  return api.post("/auth/refresh-access-token");
};

export const updatePassword = (payload) => {
  return api.put("/auth/newPassword", payload);
};
;




