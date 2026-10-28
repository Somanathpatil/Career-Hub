import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  FileText,
  BookOpen,
  Map,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Compass,
  BotMessageSquare,
  Users,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { getUsername, resolveUserId } from "../utils/auth";
import api from "../api/api";

const Dashboard = () => {
  const username = getUsername();
  const [stats, setStats] = useState({
    jobsCount: 0,
    coursesCount: 0,
    roadmapsCount: 0,
    skillsCount: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const loadDashboardStats = async () => {
    try {
      const uid = await resolveUserId();
      const [jobsRes, coursesRes, roadmapsRes, skillsRes] = await Promise.allSettled([
        api.get("/api/jobs"),
        api.get("/api/course"),
        api.get(`/api/roadmaps/user/${uid}`),
        api.get(`/api/userskill/user/${uid}`),
      ]);

      setStats({
        jobsCount: jobsRes.status === "fulfilled" && Array.isArray(jobsRes.value.data) ? jobsRes.value.data.length : 0,
        coursesCount: coursesRes.status === "fulfilled" && Array.isArray(coursesRes.value.data) ? coursesRes.value.data.length : 0,
        roadmapsCount: roadmapsRes.status === "fulfilled" && Array.isArray(roadmapsRes.value.data) ? roadmapsRes.value.data.length : 0,
        skillsCount: skillsRes.status === "fulfilled" && Array.isArray(skillsRes.value.data) ? skillsRes.value.data.length : 0,
      });
    } catch (err) {
      console.error("Dashboard stats error:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const features = [
    {
      title: "Job Opportunities",
      description: "Explore tech openings and filter by salary, role, and skills.",
      icon: BriefcaseBusiness,
      link: "/jobs",
      color: "bg-blue-100 text-blue-700",
      label: "Browse jobs",
    },
    {
      title: "Job Fit & Skill Match",
      description: "Analyze how your current competencies match target jobs.",
      icon: Compass,
      link: "/job-recommendations",
      color: "bg-indigo-100 text-indigo-700",
      label: "Analyze match",
    },
    {
      title: "Resume Analyzer",
      description: "Extract skills and parse your PDF resume with Gemini AI.",
      icon: FileText,
      link: "/resume-analyzer",
      color: "bg-violet-100 text-violet-700",
      label: "Analyze resume",
    },
    {
      title: "Courses & Upskilling",
      description: "Find free courses to bridge specific skill gaps for any role.",
      icon: BookOpen,
      link: "/courses",
      color: "bg-emerald-100 text-emerald-700",
      label: "Explore courses",
    },
    {
      title: "Learning Roadmap",
      description: "Interactive step-by-step milestone path to career readiness.",
      icon: Map,
      link: "/roadmap",
      color: "bg-orange-100 text-orange-700",
      label: "View roadmaps",
    },
    {
      title: "Skills Management",
      description: "Manage your verified profile skills and explore skills catalog.",
      icon: Sparkles,
      link: "/skills",
      color: "bg-pink-100 text-pink-700",
      label: "Manage skills",
    },
    {
      title: "AI Career Coach",
      description: "Consult with Gemini AI on transitions, interview prep, and tech stacks.",
      icon: BotMessageSquare,
      link: "/ai-coach",
      color: "bg-purple-100 text-purple-700",
      label: "Chat with coach",
    },
    {
      title: "User Directory",
      description: "Inspect platform members, learners, and system administration.",
      icon: Users,
      link: "/users",
      color: "bg-slate-100 text-slate-700",
      label: "View members",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Welcome banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 p-6 text-white shadow-xl shadow-blue-900/10 sm:p-10">
          <div className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full border-[40px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 right-40 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold">
              <Sparkles size={15} />
              AI-Powered Career Intelligence Platform
            </div>

            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              Welcome back, {username}!
            </h1>

            <p className="mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-blue-100">
              Analyze your resume, discover role compatibility, close skill gaps
              with courses, and track step-by-step career milestones.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-bold text-blue-700 shadow-md transition hover:bg-blue-50"
              >
                Browse Jobs
                <ArrowUpRight size={17} />
              </Link>
              <Link
                to="/resume-analyzer"
                className="inline-flex items-center gap-2 rounded-2xl bg-white/15 border border-white/30 px-5 py-3 text-xs font-bold text-white hover:bg-white/25 transition"
              >
                Upload Resume
              </Link>
            </div>
          </div>
        </section>

        {/* Live Overview Metrics */}
        <section className="mt-9">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Live Platform Overview
              </h2>
              <p className="text-xs text-slate-500">
                Real-time tracking of your profile and opportunities
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <OverviewCard
              icon={<BriefcaseBusiness size={22} />}
              label="Active Jobs"
              value={loadingStats ? "..." : String(stats.jobsCount)}
              note="Open opportunities"
              color="text-blue-600 bg-blue-50"
              link="/jobs"
            />

            <OverviewCard
              icon={<Sparkles size={22} />}
              label="My Verified Skills"
              value={loadingStats ? "..." : String(stats.skillsCount)}
              note="On your profile"
              color="text-pink-600 bg-pink-50"
              link="/skills"
            />

            <OverviewCard
              icon={<BookOpen size={22} />}
              label="Courses Available"
              value={loadingStats ? "..." : String(stats.coursesCount)}
              note="Skill gap courses"
              color="text-emerald-600 bg-emerald-50"
              link="/courses"
            />

            <OverviewCard
              icon={<Map size={22} />}
              label="Learning Roadmaps"
              value={loadingStats ? "..." : String(stats.roadmapsCount)}
              note="Active career paths"
              color="text-violet-600 bg-violet-50"
              link="/roadmap"
            />
          </div>
        </section>

        {/* Features Modules */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Explore CareerHub Features
            </h2>
            <p className="text-xs text-slate-500">
              Everything you need to advance your tech career journey.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color}`}
                  >
                    <Icon size={24} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-1.5 flex-1 text-xs leading-5 text-slate-500">
                    {feature.description}
                  </p>

                  <Link
                    to={feature.link}
                    className="mt-4 inline-flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    {feature.label}
                    <ChevronRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        {/* Getting started Banner */}
        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="rounded-2xl bg-amber-50 p-3.5 text-amber-600 shrink-0">
              <Sparkles size={26} />
            </div>

            <div className="flex-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Optimize your career with AI Resume Analysis
              </h2>

              <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-6 text-slate-500">
                Upload your PDF resume to automatically parse your skills,
                experience, and projects with Gemini AI. Match with database skills,
                save them with proficiency levels, and unlock personalized job fit scores.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  to="/resume-analyzer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Analyze My Resume
                  <ArrowUpRight size={16} />
                </Link>
                <span className="text-slate-300">·</span>
                <Link
                  to="/ai-coach"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-800"
                >
                  Ask AI Career Coach
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-8 text-center text-xs font-medium text-slate-400">
          CareerHub © 2026 · AI-Powered Career Planning & Upskilling Ecosystem
        </footer>
      </main>
    </div>
  );
};

function OverviewCard({ icon, label, value, note, color, link }) {
  const content = (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-xs cursor-pointer">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <div className={`rounded-xl p-2.5 ${color}`}>{icon}</div>
      </div>
      <p className="mt-3 text-2xl font-black text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
}

export default Dashboard;
