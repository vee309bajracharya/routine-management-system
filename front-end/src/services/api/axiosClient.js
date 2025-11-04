import axios from "axios";

// axios instance with base config
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // get the token from sessionStorage or localStorage
    const token = sessionStorage.getItem("auth_token") || localStorage.getItem('auth_token');
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

    // Network Error
    if(!error.response){
      console.error("Network Error", error.message);
      error.userMessage = "Network Error. Please check your connection.";
      return Promise.reject(error);
    }

    // server respond with error
    const { response } = error;
    const status = response.status;

    switch (status){

      case 400:
        error.userMessage = "Invalid request. Please check your inout";
        break;
      
      case 401:
        { sessionStorage.clear();
        localStorage.clear();
        error.userMessage = "Unauthorized access. Please login again.";

        // redirect to login page
        const currentPath = window.location.pathname;
        if(!currentPath.includes('login')){
          const loginRoute = currentPath.includes('admin') ? '/admin-login' : '/teacher-login';

          setTimeout(()=>{
            window.location.href = loginRoute;
          },1000);
        }
        break; }

      case 403:
        error.userMessage = "Forbidden - No Permission";
        break;

      case 404:
        error.userMessage = 'Resource not found';
        break;
      
      case 422:
        error.userMessage = 'Validation error. Please check your input.';
        break;

      case 429:
        error.userMessage = 'Too many requests. Please try again later.';
        break;
      
      case 500:
        error.userMessage = 'Server error. Please try again later.';
        break;
      
      default:
        error.userMessage = response.data.message || 'An error occurred. Please try again.';  
    }
    return Promise.reject(error);

  }
);

export default axiosClient;
