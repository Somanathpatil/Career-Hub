import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import api from "../api/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post("/api/users/login", {
        username: email,
        password,
      });

      const data = response.data;
      const token = typeof data === "string" ? data : (data?.jwt || data?.token);

      if (!token || token === "Fail") {
        toast.error("Invalid credentials. Please check your username and password.");
        return;
      }

      localStorage.setItem("token", token);

      let currentUsername = email;
      try {
        const decoded = jwtDecode(token);
        if (decoded?.sub) {
          currentUsername = decoded.sub;
        }
      } catch (err) {
        console.warn("JWT decode error:", err);
      }
      localStorage.setItem("username", currentUsername);

      // Attempt to resolve userId
      try {
        const usersRes = await api.get("/api/users");
        const usersList = Array.isArray(usersRes.data) ? usersRes.data : [];
        const matched = usersList.find(
          (u) =>
            (u.username && u.username.toLowerCase() === currentUsername.toLowerCase()) ||
            (u.email && u.email.toLowerCase() === email.toLowerCase())
        );
        if (matched && matched.userId) {
          localStorage.setItem("userId", String(matched.userId));
        } else if (usersList.length > 0 && usersList[0].userId) {
          localStorage.setItem("userId", String(usersList[0].userId));
        }
      } catch (uErr) {
        console.warn("Could not prefetch userId:", uErr);
      }

      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      toast.error(
        error.response?.data?.message ||
          (typeof error.response?.data === "string"
            ? error.response.data
            : "Invalid email or password.")
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/70 bg-white/15 py-4 pl-12 pr-12 text-white outline-none transition placeholder:text-white/90 focus:border-blue-400 focus:bg-white/25 focus:ring-2 focus:ring-blue-400/30";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 px-4 py-8 sm:px-6">
      {/* Same background as Register */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/careerhub-background.png')",
        }}
      />

      <div className="absolute inset-0 bg-slate-950/15" />



      {/* Login glass card */}
      <section className="relative z-10 my-10 w-full max-w-lg rounded-[2rem] border border-white/80 bg-white/35 px-6 py-9 shadow-2xl shadow-slate-900/20 backdrop-blur-xl sm:px-10 sm:py-11">
        <header className="mb-9 text-center">


          <h2 className="text-4xl font-bold text-slate-950">
            Welcome Back
          </h2>

          <p className="mt-2 text-slate-900">
            Login to continue your career journey.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Email
            </label>

            <div className="relative">
              <Mail
                size={21}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
              />

              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                autoComplete="email"
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Password
            </label>

            <div className="relative">
              <LockKeyhole
                size={21}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
              />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                autoComplete="current-password"
                required
                className={inputClass}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-blue-100"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-3 rounded-full bg-blue-600 px-5 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-400/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}

            {!loading && (
              <ArrowRight
                size={23}
                className="transition-transform group-hover:translate-x-1"
              />
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-slate-900 sm:text-base">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-bold text-blue-700 hover:text-blue-900 hover:underline"
          >
            Register
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
