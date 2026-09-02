import axios from "axios";
import { createApiClient } from "./http";
import { normalizeUser } from "../utils/normalizers";

const AUTH_URL =
  import.meta.env.VITE_AUTH_API_BASE_URL ||
  "http://127.0.0.1:5001/api/v1";

const authApi = createApiClient(
  `${AUTH_URL}/auth`
);


export const authService = {

  // ==========================================================
  // REGISTER
  // ==========================================================

  register: async (payload) => {

    const response =
      await authApi.post(
        "/register",
        payload
      );

    return {
      ...response.data,

      user:
        response.data.user
          ? normalizeUser(
              response.data.user
            )
          : null,
    };
  },


  // ==========================================================
  // LOGIN
  // ==========================================================

  login: async (
    email,
    password
  ) => {

    const response =
      await authApi.post(
        "/login",
        {
          email,
          password,
        }
      );

    const data =
      response.data;


    if (data.access_token) {

      localStorage.setItem(
        "swipex_access_token",
        data.access_token
      );

    }


    if (data.refresh_token) {

      localStorage.setItem(
        "swipex_refresh_token",
        data.refresh_token
      );

    }


    return {
      ...data,

      user:
        data.user
          ? normalizeUser(data.user)
          : null,
    };
  },


  // ==========================================================
  // CURRENT USER
  // ==========================================================

  getMe: async () => {

    const response =
      await authApi.get("/me");

    return {
      ...response.data,

      user:
        response.data.user
          ? normalizeUser(
              response.data.user
            )
          : null,
    };
  },


  // ==========================================================
  // UPDATE PROFILE
  // ==========================================================

  updateProfile: async (
    payload
  ) => {

    const response =
      await authApi.put(
        "/me",
        {
          name:
            payload.name,

          email:
            payload.email,

          phone:
            payload.phone,

          location:
            payload.location,

          role:
            payload.role,

          experience:
            payload.experience,

          preferredSalary:
            payload.preferredSalary,

          bio:
            payload.bio,

          skills:
            Array.isArray(
              payload.skills
            )
              ? payload.skills
              : [],
        }
      );


    return {
      ...response.data,

      user:
        response.data.user
          ? normalizeUser(
              response.data.user
            )
          : null,
    };
  },


  // ==========================================================
  // CHANGE PASSWORD
  // ==========================================================

  changePassword: async (
    current_password,
    new_password
  ) => {

    const response =
      await authApi.put(
        "/change-password",
        {
          current_password,
          new_password,
        }
      );

    return response.data;
  },


  // ==========================================================
  // FORGOT PASSWORD
  // ==========================================================

  forgotPassword: async (
    email
  ) => {

    const response =
      await authApi.post(
        "/forgot-password",
        {
          email,
        }
      );

    return response.data;
  },


  // ==========================================================
  // RESET PASSWORD
  // ==========================================================

  resetPassword: async (
    token,
    new_password
  ) => {

    const response =
      await authApi.post(
        "/reset-password",
        {
          token,
          new_password,
        }
      );

    return response.data;
  },


  // ==========================================================
  // REFRESH TOKEN
  // ==========================================================

  refresh: async () => {

    const refreshToken =
      localStorage.getItem(
        "swipex_refresh_token"
      );


    if (!refreshToken) {

      throw new Error(
        "No refresh token available"
      );

    }


    const response =
      await axios.post(
        `${AUTH_URL}/auth/refresh`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${refreshToken}`,
          },
        }
      );


    const newAccessToken =
      response.data.access_token;


    localStorage.setItem(
      "swipex_access_token",
      newAccessToken
    );


    return response.data;
  },


  // ==========================================================
  // LOGOUT
  // ==========================================================

  logout: async () => {

    try {

      const response =
        await authApi.post(
          "/logout"
        );

      return response.data;

    } finally {

      localStorage.removeItem(
        "swipex_access_token"
      );

      localStorage.removeItem(
        "swipex_refresh_token"
      );

    }
  },


  // ==========================================================
  // GOOGLE LOGIN
  // ==========================================================

  googleLoginRedirect: () => {

    window.location.href =
      `${AUTH_URL}/auth/google`;

  },

};


export default authService;