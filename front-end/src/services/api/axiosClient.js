import axios from "axios";

// axios instance with base config
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // get the token from sessionStorage
    const token = sessionStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    if (response) {
      switch (response.status) {
        case 401:
          console.error("Authentication failed. Token expired or invalid");
          sessionStorage.removeItem("auth_token");
          sessionStorage.removeItem("user_data");

          if (!window.location.pathname.includes("/teacher-login")) {
            window.location.href = "/teacher-login";
          }
          break;

        case 403:
          console.error("Access forbidden. No Permission");
          break;

        case 404:
          console.error("Resource Not Found");
          break;

        case 422:
          console.error("Validation failed : ", response.data.errors);
          break;
        
        case 500:
            console.error("Server error");
            break;
        
        default:
            console.error('Error : ', response.status);
      }
    }else{
        console.error('Please check your connection');
      }
      return Promise.reject(error);
  }
);

export default axiosClient;
