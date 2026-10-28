import { jwtDecode } from "jwt-decode";
import api from "../api/api";

export const getToken = () => localStorage.getItem("token");

export const getUsername = () => {
  const stored = localStorage.getItem("username");
  if (stored) return stored;

  const token = getToken();
  if (token) {
    try {
      const decoded = jwtDecode(token);
      if (decoded?.sub) {
        localStorage.setItem("username", decoded.sub);
        return decoded.sub;
      }
    } catch (e) {
      console.error("Error decoding token:", e);
    }
  }
  return "Learner";
};

export const getStoredUserId = () => {
  const uid = localStorage.getItem("userId");
  return uid ? parseInt(uid, 10) : null;
};

export const resolveUserId = async () => {
  const cached = getStoredUserId();
  if (cached) return cached;

  const username = getUsername();
  try {
    const res = await api.get("/api/users");
    const users = Array.isArray(res.data) ? res.data : [];
    const matched = users.find(
      (u) =>
        (u.username && u.username.toLowerCase() === username.toLowerCase()) ||
        (u.email && u.email.toLowerCase() === username.toLowerCase())
    );

    if (matched && matched.userId) {
      localStorage.setItem("userId", String(matched.userId));
      return matched.userId;
    }

    if (users.length > 0 && users[0].userId) {
      localStorage.setItem("userId", String(users[0].userId));
      return users[0].userId;
    }
  } catch (err) {
    console.error("Could not resolve userId:", err);
  }

  return 1; // Fallback default userId
};

export const logout = (navigate) => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  if (navigate) {
    navigate("/");
  } else {
    window.location.href = "/";
  }
};
