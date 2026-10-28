import { useState } from "react";
import { Link } from "react-router-dom";
import {
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/api";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post("/api/users/register", {
        username,
        email,
        phone,
        password,
      });

      toast.success(
        typeof res.data === "string"
          ? res.data
          : "Registration successful!"
      );

      setUsername("");
      setEmail("");
      setPhone("");
      setPassword("");
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          (typeof error.response?.data === "string"
            ? error.response.data
            : "Something went wrong. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      label: "Username",
      type: "text",
      value: username,
      setter: setUsername,
      placeholder: "Enter your username",
      icon: UserRound,
      autoComplete: "username",
    },
    {
      label: "Email address",
      type: "email",
      value: email,
      setter: setEmail,
      placeholder: "Enter your email",
      icon: Mail,
      autoComplete: "email",
    },
    {
      label: "Phone number",
      type: "tel",
      value: phone,
      setter: setPhone,
      placeholder: "Enter your phone number",
      icon: Phone,
      autoComplete: "tel",
    },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 sm:px-6">
      {/* Background image */}
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/careerhub-background.png')",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-slate-950/50" />

      {/* Decorative glow */}
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
      <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-violet-500/25 blur-3xl" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Branding */}
        {/* <Link
          to="/"
          className="mb-7 flex items-center justify-center gap-3 text-white"
        >
          <div className="rounded-xl bg-blue-500/20 p-3 ring-1 ring-white/20">
            <BriefcaseBusiness
              size={30}
              className="text-blue-300"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Career<span className="text-blue-400">Hub</span>
            </h1>
            <p className="text-sm text-slate-200">
              Your career, your future.
            </p>
          </div>
        </Link> */}

        {/* Glass card */}
        <div className="rounded-3xl border border-white/25 bg-white/15 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:py-4 sm:px-9">
          <div className="mb-4 text-center">


            <h2 className="text-3xl font-bold text-white">
              Create Account
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-200">
              Join CareerHub and take the next step in your career.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map((field) => {
              const Icon = field.icon;

              return (
                <div key={field.label}>
                  <label className="mb-2 block text-sm font-medium text-white">
                    {field.label}
                  </label>

                  <div className="relative">
                    <Icon
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-100"
                    />

                    <input
                      type={field.type}
                      value={field.value}
                      onChange={(e) =>
                        field.setter(e.target.value)
                      }
                      placeholder={field.placeholder}
                      autoComplete={field.autoComplete}
                      required
                      className="w-full rounded-xl border border-white/30 bg-white/10 py-2 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-300 focus:border-blue-300 focus:bg-white/15 focus:ring-2 focus:ring-blue-400/40"
                    />
                  </div>
                </div>
              );
            })}

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-100"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-white/30 bg-white/10 py-2 pl-12 pr-12 text-white outline-none transition placeholder:text-slate-300 focus:border-blue-300 focus:bg-white/15 focus:ring-2 focus:ring-blue-400/40"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-200 transition hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2 font-semibold text-white shadow-lg shadow-blue-950/30 transition duration-200 hover:-translate-y-0.5 hover:from-blue-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}

              {!loading && (
                <ArrowRight
                  size={19}
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/20" />
            <span className="text-xs text-slate-300">
              ALREADY A MEMBER?
            </span>
            <div className="h-px flex-1 bg-white/20" />
          </div>

          <p className="text-center text-sm text-slate-200">
            Already have an account?{" "}
            <Link
              to="/"
              className="font-semibold text-blue-300 transition hover:text-white hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
