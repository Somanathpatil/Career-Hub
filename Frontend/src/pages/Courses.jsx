import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Sparkles,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Star,
  Clock,
  CheckCircle,
  Tag,
  X,
  Loader2,
  AlertCircle,
  Play,
  RefreshCw,
  Calendar,
  Video,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { resolveUserId } from "../utils/auth";

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialJobId = searchParams.get("jobId");

  const [activeTab, setActiveTab] = useState(
    initialJobId ? "recommendations" : "catalog"
  );
  const [userId, setUserId] = useState(null);

  // Catalog State
  const [courses, setCourses] = useState([]);
  const [skillsCatalog, setSkillsCatalog] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [search, setSearch] = useState("");
  const [freeFilter, setFreeFilter] = useState("ALL");
  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSkillTagModal, setShowSkillTagModal] = useState(false);
  const [selectedCourseForSkill, setSelectedCourseForSkill] = useState(null);

  // 10-Day Sync State
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncingCourses, setSyncingCourses] = useState(false);

  // Recommendations State
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId || "");
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Add Course Form State
  const [newCourse, setNewCourse] = useState({
    title: "",
    provider: "",
    url: "",
    free: true,
    rating: 4.8,
    duration: "10 hours",
    description: "",
  });
  const [submittingCourse, setSubmittingCourse] = useState(false);

  // Tag Skill to Course State
  const [tagSkillId, setTagSkillId] = useState("");
  const [submittingSkillTag, setSubmittingSkillTag] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const res = await api.get("/api/course");
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load courses:", err);
      toast.error("Failed to load courses.");
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const res = await api.get("/api/course/sync-status");
      setSyncStatus(res.data);
    } catch (err) {
      console.debug("Could not load sync status:", err);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await api.get("/api/skills/");
      setSkillsCatalog(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load skills:", err);
    }
  };

  const fetchRecommendations = async (uid, jobId) => {
    if (!uid || !jobId) return;
    try {
      setLoadingRecommendations(true);
      const res = await api.get(`/api/recommendations/user/${uid}/job/${jobId}`);
      setRecommendations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch course recommendations:", err);
      toast.error("Failed to load course recommendations.");
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const fetchJobs = async (uid) => {
    try {
      const res = await api.get("/api/jobs");
      const list = Array.isArray(res.data) ? res.data : [];
      setJobs(list);

      const targetJobId =
        initialJobId || (list.length > 0 ? String(list[0].jobId) : "");
      if (targetJobId) {
        setSelectedJobId(targetJobId);
        fetchRecommendations(uid, targetJobId);
      }
    } catch (err) {
      console.error("Failed to load jobs for recommendations:", err);
    }
  };

  const init = async () => {
    const uid = await resolveUserId();
    setUserId(uid);
    fetchCourses();
    fetchSyncStatus();
    fetchSkills();
    fetchJobs(uid);
  };

  useEffect(() => {
    init();
  }, []);

  const handleJobChange = (jobId) => {
    setSelectedJobId(jobId);
    setSearchParams({ jobId });
    fetchRecommendations(userId, jobId);
  };

  const handleSyncCourses = async (force = false) => {
    try {
      setSyncingCourses(true);
      const res = await api.post(`/api/course/sync?force=${force}`);
      if (res.data?.synced) {
        toast.success(
          res.data?.message || "Upskilling courses updated successfully!"
        );
      } else {
        toast.info(res.data?.message || "10-day cycle active.");
      }
      await fetchCourses();
      await fetchSyncStatus();
      if (userId && selectedJobId) {
        await fetchRecommendations(userId, selectedJobId);
      }
    } catch (err) {
      console.error("Failed to sync courses:", err);
      toast.error(
        err.response?.data?.message || "Failed to update upskilling courses."
      );
    } finally {
      setSyncingCourses(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.provider) {
      toast.error("Title and Provider are required.");
      return;
    }

    try {
      setSubmittingCourse(true);
      const payload = {
        ...newCourse,
        rating: newCourse.rating ? parseFloat(newCourse.rating) : 0,
      };

      await api.post("/api/course/add", payload);
      toast.success("Course added successfully!");
      setShowAddModal(false);
      setNewCourse({
        title: "",
        provider: "",
        url: "",
        free: true,
        rating: 4.8,
        duration: "10 hours",
        description: "",
      });
      fetchCourses();
    } catch (err) {
      console.error("Failed to save course:", err);
      toast.error("Failed to create course.");
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleTagSkill = async (e) => {
    e.preventDefault();
    if (!tagSkillId || !selectedCourseForSkill) {
      toast.error("Please select a skill.");
      return;
    }

    try {
      setSubmittingSkillTag(true);
      await api.post("/api/courseskill/add", {
        course: { courseId: selectedCourseForSkill.courseId },
        skill: { skillId: parseInt(tagSkillId, 10) },
      });

      toast.success("Skill tagged to course!");
      setShowSkillTagModal(false);
    } catch (err) {
      console.error("Failed to tag skill:", err);
      toast.error("Failed to link skill with course.");
    } finally {
      setSubmittingSkillTag(false);
    }
  };

  const getProviderBadgeStyle = (provider) => {
    const p = (provider || "").toLowerCase();
    if (p.includes("youtube")) {
      return "bg-red-50 text-red-700 border-red-200 ring-1 ring-red-500/10";
    }
    if (p.includes("coursera")) {
      return "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/10";
    }
    if (p.includes("udemy")) {
      return "bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/10";
    }
    if (p.includes("freecodecamp")) {
      return "bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-500/10";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const isYouTubeCourse = (course) => {
    const url = (course?.url || "").toLowerCase();
    const provider = (course?.provider || "").toLowerCase();
    return (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      provider.includes("youtube")
    );
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      (c.title && c.title.toLowerCase().includes(search.toLowerCase())) ||
      (c.provider && c.provider.toLowerCase().includes(search.toLowerCase())) ||
      (c.description &&
        c.description.toLowerCase().includes(search.toLowerCase()));

    const matchesFree =
      freeFilter === "ALL" ||
      (freeFilter === "FREE" && c.free === true) ||
      (freeFilter === "PAID" && c.free === false);

    const matchesPlatform =
      platformFilter === "ALL" ||
      (platformFilter === "YOUTUBE" && isYouTubeCourse(c)) ||
      (platformFilter === "OTHER" && !isYouTubeCourse(c));

    return matchesSearch && matchesFree && matchesPlatform;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Banner with 10-day cycle indicator */}
        <section className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 p-6 sm:p-8 text-white shadow-xl shadow-teal-900/10">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                <BookOpen size={14} />
                Real Upskilling Courses
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-500/20 px-3 py-1 text-xs font-bold tracking-wider text-emerald-100">
                <Calendar size={13} />
                10-Day Refresh Cycle
              </span>
            </div>

            <h1 className="text-3xl font-extrabold sm:text-4xl">
              Upskilling Courses & Learning Hub
            </h1>
            <p className="mt-2 max-w-xl text-sm sm:text-base text-emerald-100">
              Authentic full-length tutorials from <strong>YouTube</strong> (freeCodeCamp, Bro Code,
              Telusko, Mosh) and top platforms curated by Gemini AI to close your skill gaps.
            </p>

            {/* Sync status info banner */}
            {syncStatus && (
              <div className="mt-3.5 inline-flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-1.5 text-xs text-emerald-50 backdrop-blur-xs border border-white/20">
                <Sparkles size={14} className="text-amber-300" />
                <span>
                  {syncStatus.daysSinceLastSync == null
                    ? "Courses fetched today. Next scheduled sync in 10 days."
                    : `Last fetched: ${syncStatus.daysSinceLastSync} day(s) ago · Next automatic sync in ${syncStatus.nextSyncInDays} day(s)`}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => handleSyncCourses(false)}
              disabled={syncingCourses}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 text-sm font-extrabold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400 disabled:opacity-50"
              title="Fetch fresh real courses from YouTube and other platforms via Gemini AI (10-day cycle)"
            >
              {syncingCourses ? (
                <>
                  <Loader2 size={18} className="animate-spin text-slate-900" />
                  <span>Curating Courses...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={17} className="text-slate-900" />
                  <span>Sync Upskilling Courses</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-emerald-800 shadow-md transition hover:bg-emerald-50"
            >
              <Plus size={18} />
              Add Course
            </button>
          </div>
        </section>

        {/* Tab Switcher */}
        <div className="mb-8 flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "catalog"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <BookOpen size={16} />
            All Courses Catalog ({courses.length})
          </button>

          <button
            onClick={() => setActiveTab("recommendations")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "recommendations"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Sparkles size={16} />
            Target Job Recommendations ({recommendations.length})
          </button>
        </div>

        {/* TAB 1: CATALOG */}
        {activeTab === "catalog" && (
          <div>
            {/* Search & Filter Bar */}
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-center">
              <div className="relative sm:col-span-2">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search courses by topic, channel, title (React, Java, Python)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm shadow-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-xs outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Platforms</option>
                  <option value="YOUTUBE">YouTube Only</option>
                  <option value="OTHER">Other Platforms (Coursera/Udemy)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Filter size={17} className="text-slate-400 hidden lg:block" />
                <select
                  value={freeFilter}
                  onChange={(e) => setFreeFilter(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-xs outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Pricing</option>
                  <option value="FREE">Free Courses Only</option>
                  <option value="PAID">Paid Courses</option>
                </select>
              </div>
            </div>

            {/* Courses Grid */}
            {loadingCourses ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2
                  className="animate-spin mb-3 text-emerald-600"
                  size={36}
                />
                <p className="text-sm font-medium">Loading course catalog...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                <BookOpen size={36} className="mx-auto mb-3 text-slate-400" />
                <h3 className="text-lg font-bold text-slate-900">
                  No courses found
                </h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Click <strong>"Sync Upskilling Courses"</strong> to ingest top-rated tutorials
                  from YouTube and developer platforms.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={() => handleSyncCourses(false)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    <RefreshCw size={14} /> Sync Courses
                  </button>
                  <button
                    onClick={() => {
                      setSearch("");
                      setFreeFilter("ALL");
                      setPlatformFilter("ALL");
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((c) => {
                  const isYt = isYouTubeCourse(c);
                  return (
                    <div
                      key={c.courseId}
                      className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl"
                    >
                      <div>
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-bold ${getProviderBadgeStyle(
                              c.provider
                            )}`}
                          >
                            {isYt ? (
                              <Video size={13} className="text-red-600" />
                            ) : (
                              <BookOpen size={13} />
                            )}
                            {c.provider || "Self-Paced"}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                              c.free
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {c.free ? "FREE" : "PAID"}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug">
                          {c.title}
                        </h3>

                        {/* Description */}
                        {c.description && (
                          <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                            {c.description}
                          </p>
                        )}

                        {/* Duration & Rating */}
                        <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-500">
                          {c.duration && (
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} className="text-slate-400" />
                              <span>{c.duration}</span>
                            </div>
                          )}
                          {c.rating != null && (
                            <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                              <Star
                                size={14}
                                className="fill-amber-400 text-amber-400"
                              />
                              <span>{c.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <button
                          onClick={() => {
                            setSelectedCourseForSkill(c);
                            setShowSkillTagModal(true);
                          }}
                          className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-700"
                        >
                          <Tag size={13} />
                          Link Skill
                        </button>

                        {c.url ? (
                          <a
                            href={
                              c.url.startsWith("http")
                                ? c.url
                                : `https://${c.url}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition shadow-xs ${
                              isYt
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                          >
                            {isYt ? (
                              <>
                                <Play size={13} className="fill-white" />
                                Watch on YouTube
                              </>
                            ) : (
                              <>
                                <span>Take Course</span>
                                <ExternalLink size={13} />
                              </>
                            )}
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            No URL provided
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RECOMMENDATIONS */}
        {activeTab === "recommendations" && (
          <div>
            {/* Target Job Picker */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Target Job For Skill-Gap Recommendations
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => handleJobChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                >
                  {jobs.map((job) => (
                    <option key={job.jobId} value={job.jobId}>
                      {job.jobTitle} - {job.company}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/roadmap?jobId=${selectedJobId}`}
                  className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition shrink-0"
                >
                  Generate Roadmap
                </Link>
              </div>
            </div>

            {loadingRecommendations ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2
                  className="animate-spin mb-3 text-emerald-600"
                  size={36}
                />
                <p className="text-sm font-medium">
                  Finding personalized courses...
                </p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  No courses needed or no matching courses found
                </h3>
                <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                  You either already meet the skill requirements for this role,
                  or no free courses are currently tagged for the missing skills.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Link
                    to="/skills"
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Check My Skills
                  </Link>
                  <button
                    onClick={() => setActiveTab("catalog")}
                    className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    Browse All Courses
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((rec, index) => {
                  const isYt =
                    rec.url?.toLowerCase().includes("youtube") ||
                    rec.provider?.toLowerCase().includes("youtube");

                  return (
                    <div
                      key={`${rec.courseId}-${rec.targetSkill}-${index}`}
                      className="flex flex-col justify-between rounded-3xl border border-emerald-200 bg-white p-6 shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div>
                        {/* Target Skill Badge */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                            <Tag size={12} />
                            Target: {rec.targetSkill}
                          </span>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 border border-emerald-200">
                            FREE
                          </span>
                        </div>

                        {/* Course Title */}
                        <h3 className="text-lg font-bold text-slate-900 leading-snug">
                          {rec.title}
                        </h3>

                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${getProviderBadgeStyle(
                              rec.provider
                            )}`}
                          >
                            {isYt && <Video size={11} className="text-red-600" />}
                            {rec.provider || "CareerHub Partner"}
                          </span>
                        </div>

                        {/* Reason */}
                        <div className="mt-3.5 rounded-xl bg-amber-50/70 p-3 border border-amber-200/60 text-xs font-medium text-amber-900 leading-relaxed">
                          <div className="flex items-center gap-1.5 font-bold text-amber-950 mb-1">
                            <AlertCircle size={13} /> Why this course:
                          </div>
                          {rec.reason}
                        </div>

                        {/* Metadata */}
                        <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-500">
                          {rec.duration && (
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} className="text-slate-400" />
                              <span>{rec.duration}</span>
                            </div>
                          )}
                          {rec.rating != null && (
                            <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                              <Star
                                size={14}
                                className="fill-amber-400 text-amber-400"
                              />
                              <span>{rec.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
                        {rec.url ? (
                          <a
                            href={
                              rec.url.startsWith("http")
                                ? rec.url
                                : `https://${rec.url}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold text-white transition shadow-xs ${
                              isYt
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                          >
                            {isYt ? (
                              <>
                                <Play size={13} className="fill-white" />
                                Watch on YouTube
                              </>
                            ) : (
                              <>
                                <span>Enroll Now</span>
                                <ExternalLink size={14} />
                              </>
                            )}
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Enrollment link coming soon
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                  <BookOpen size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Add Learning Course
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Spring Boot and Microservices"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Provider *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. YouTube, Coursera, Udemy"
                    value={newCourse.provider}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, provider: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15 hours"
                    value={newCourse.duration}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, duration: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Rating (0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={newCourse.rating}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, rating: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={newCourse.free}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, free: e.target.checked })
                      }
                      className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    Free Course
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Course URL
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={newCourse.url}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, url: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Briefly describe what students will learn..."
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCourse}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submittingCourse && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tag Skill Modal */}
      {showSkillTagModal && selectedCourseForSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Tag Skill to Course
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedCourseForSkill.title}
                </p>
              </div>
              <button
                onClick={() => setShowSkillTagModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTagSkill} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Which skill does this course teach? *
                </label>
                <select
                  required
                  value={tagSkillId}
                  onChange={(e) => setTagSkillId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose skill --</option>
                  {skillsCatalog.map((s) => (
                    <option key={s.skillId} value={s.skillId}>
                      {s.skillName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSkillTagModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSkillTag || !tagSkillId}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submittingSkillTag && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  Link Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
