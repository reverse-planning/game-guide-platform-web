import axios, { AxiosError } from "axios";
import { useSessionStore } from "@/stores/sessionSlice";

export const apiClient = axios.create();

let isHandling401 = false;

apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      useSessionStore.getState().resetSession();

      if (!isHandling401 && window.location.pathname.startsWith("/guides")) {
        isHandling401 = true;
        window.location.replace("/");
      }
    }
    return Promise.reject(err);
  },
);
