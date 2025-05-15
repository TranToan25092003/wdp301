import axios from "axios";

const customFetch = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

// Remove the interceptor since we're now passing the token directly in the components
export { customFetch };
