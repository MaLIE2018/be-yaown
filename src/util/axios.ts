import axios from "axios";

export const AIPInstance = axios.create({
  baseURL: process.env.AIP_URL,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
    Authorization: `Token ${process.env.AIP_TOKEN}`,
  },
  timeout: 20000,
});
