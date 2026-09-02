import axios from "axios";

export function createApiClient(baseURL) {
  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(
        "swipex_access_token"
      );

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  return client;
}