import axios from "axios";

const salesapi = axios.create({
  baseURL: "http://localhost:3000/dashboard/salesperson/",
  headers: {
    "Content-Type": "application/json",
  },
});

export default salesapi;
