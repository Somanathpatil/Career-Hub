import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Compass,
  BookOpen,
  Map,
  X,
  Loader2,
  Tag,
  Sparkles,
  RefreshCw,
  Globe,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { resolveUserId } from "../utils/auth";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [skillsCatalog, setSkillsCatalog] = useState([]);
  const [jobSkillsMap, setJobSkillsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [selectedJobForSkill, setSelectedJobForSkill] = useState(null);

  // Syncing states
  const [syncingSkillsJobs, setSyncingSkillsJobs] = useState(false);
  const [syncingDailyJobs, setSyncingDailyJobs] = useState(false);

  // New Job Form State
  const [newJob, setNewJob] = useState({
    jobTitle: "",
    company: "",
    location: "",
    salary: "",
    experience: "",
    jobType: "Full Time",
    source: "CareerHub",
    jobUrl: "",
  });
  const [submittingJob, setSubmittingJob] = useState(false);

  // Add Skill to Job State
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [requiredLevel, setRequiredLevel] = useState("INTERMEDIATE");
  const [submittingSkill, setSubmittingSkill] = useState(false);

  const fetchJobSkills = async (jobId) => {
    try {
      const res = await api.get(`/api/jobskill/job/${jobId}`);
      setJobSkillsMap((prev) => ({
        ...prev,
        [jobId]: Array.isArray(res.data) ? res.data : [],
      }));
    } catch (err) {
      console.error(`Failed to load skills for job ${jobId}:`, err);
    }
  };

  const fetchSkillsCatalog = async () => {
    try {
      const res = await api.get("/api/skills/");
      setSkillsCatalog(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load skills catalog:", err);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/jobs");
      const list = Array.isArray(res.data) ? res.data : [];
      setJobs(list);

      // Fetch skills for each job
      list.forEach((job) => {
        if (job.jobId) {
          fetchJobSkills(job.jobId);
        }
      });
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      toast.error("Failed to load jobs list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchSkillsCatalog();
  }, []);

  const handleSyncUserJobs = async () => {
    try {
      setSyncingSkillsJobs(true);
      const uid = await resolveUserId();
      const res = await api.post(`/api/jobs/sync-user/${uid}`);
      const added = res.data?.jobsAdded ?? 0;
      toast.success(
        res.data?.message ||
          `Synced ${added} real jobs matching your verified skills!`
      );
      await fetchJobs();
    } catch (err) {
      console.error("Failed to sync user jobs:", err);
      toast.error(
        err.response?.data?.message || "Failed to fetch jobs based on skills."
      );
    } finally {
      setSyncingSkillsJobs(false);
    }
  };

  const handleSyncDailyJobs = async () => {
    try {
      setSyncingDailyJobs(true);
      const res = await api.post("/api/jobs/sync-daily");
      const added = res.data?.jobsAdded ?? 0;
      toast.success(
        res.data?.message ||
          `Daily job update complete! Ingested ${added} real jobs.`
      );
      await fetchJobs();
    } catch (err) {
      console.error("Failed to sync daily jobs:", err);
      toast.error(
        err.response?.data?.message || "Failed to trigger daily sync."
      );
    } finally {
      setSyncingDailyJobs(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!newJob.jobTitle || !newJob.company) {
      toast.error("Please provide at least a Job Title and Company.");
      return;
    }

    try {
      setSubmittingJob(true);
      const payload = {
        ...newJob,
        salary: newJob.salary ? parseFloat(newJob.salary) : 0,
        experience: newJob.experience ? parseFloat(newJob.experience) : 0,
      };

      await api.post("/api/jobs/add", payload);
      toast.success("Job added successfully!");
      setShowAddModal(false);
      setNewJob({
        jobTitle: "",
        company: "",
        location: "",
        salary: "",
        experience: "",
        jobType: "Full Time",
        source: "CareerHub",
        jobUrl: "",
      });
      fetchJobs();
    } catch (err) {
      console.error("Failed to create job:", err);
      toast.error(err.response?.data?.message || "Failed to add job.");
    } finally {
      setSubmittingJob(false);
    }
  };

  const handleAddSkillToJob = async (e) => {
    e.preventDefault();
    if (!selectedSkillId || !selectedJobForSkill) {
      toast.error("Please select a skill.");
      return;
    }

    try {
      setSubmittingSkill(true);
      await api.post("/api/jobskill/add", {
        job: { jobId: selectedJobForSkill.jobId },
        skill: { skillId: parseInt(selectedSkillId, 10) },
        requiredLevel: requiredLevel,
      });

      toast.success("Skill attached to job!");
      setShowSkillModal(false);
      fetchJobSkills(selectedJobForSkill.jobId);
    } catch (err) {
      console.error("Failed to attach skill:", err);
      toast.error("Failed to attach skill to job.");
    } finally {
      setSubmittingSkill(false);
    }
  };

  const getSourceBadgeStyle = (source) => {
    const s = (source || "").toLowerCase();
    if (s.includes("linkedin")) {
      return "bg-blue-100 text-blue-800 border-blue-200 ring-1 ring-blue-500/10";
    }
    if (s.includes("naukri")) {
      return "bg-amber-100 text-amber-800 border-amber-200 ring-1 ring-amber-500/10";
    }
    if (s.includes("internshala")) {
      return "bg-teal-100 text-teal-800 border-teal-200 ring-1 ring-teal-500/10";
    }
    if (s.includes("indeed")) {
      return "bg-indigo-100 text-indigo-800 border-indigo-200 ring-1 ring-indigo-500/10";
    }
    if (s.includes("remotive")) {
      return "bg-violet-100 text-violet-800 border-violet-200 ring-1 ring-violet-500/10";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  // Distinct sources in loaded jobs for dynamic filter list
  const availableSources = Array.from(
    new Set(jobs.map((j) => j.source).filter(Boolean))
  );

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      (job.jobTitle && job.jobTitle.toLowerCase().includes(search.toLowerCase())) ||
      (job.company && job.company.toLowerCase().includes(search.toLowerCase())) ||
      (job.location && job.location.toLowerCase().includes(search.toLowerCase()));

    const matchesType =
      typeFilter === "ALL" ||
      (job.jobType && job.jobType.toLowerCase() === typeFilter.toLowerCase());

    const matchesSource =
      sourceFilter === "ALL" ||
      (job.source && job.source.toLowerCase() === sourceFilter.toLowerCase());

    return matchesSearch && matchesType && matchesSource;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Header Banner */}
        <section className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <BriefcaseBusiness size={14} />
              Real-World Job Opportunities
            </div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">
              Explore Real Career Openings
            </h1>
            <p className="mt-2 max-w-xl text-sm sm:text-base text-blue-100">
              Live roles fetched from <strong>LinkedIn</strong>, <strong>Naukri</strong>,{" "}
              <strong>Internshala</strong>, and <strong>Indeed</strong> matched directly
              to your skills (React.js, Java, Python & more).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleSyncUserJobs}
              disabled={syncingSkillsJobs}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 text-sm font-extrabold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400 disabled:opacity-50"
              title="Fetch fresh jobs matching your profile skills from top platforms"
            >
              {syncingSkillsJobs ? (
                <>
                  <Loader2 size={18} className="animate-spin text-slate-900" />
                  <span>Fetching for Your Skills...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} className="text-slate-900" />
                  <span>Sync for My Skills</span>
                </>
              )}
            </button>

            <button
              onClick={handleSyncDailyJobs}
              disabled={syncingDailyJobs}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/15 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-white/25 disabled:opacity-50"
              title="Trigger real-world job ingestion for React, Java, Python"
            >
              <RefreshCw
                size={16}
                className={syncingDailyJobs ? "animate-spin" : ""}
              />
              <span>Daily Sync</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-blue-700 shadow-md transition hover:bg-blue-50"
            >
              <Plus size={18} />
              Post Job
            </button>
          </div>
        </section>

        {/* Filters & Search Bar */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-center">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search title, company (e.g. React, Java, Python, Google)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm shadow-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Platform Source Filter */}
          <div className="relative">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-xs outline-none focus:border-blue-500"
            >
              <option value="ALL">All Platforms (All Sources)</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Naukri">Naukri</option>
              <option value="Internshala">Internshala</option>
              <option value="Indeed">Indeed</option>
              <option value="Remotive">Remotive</option>
              {availableSources
                .filter(
                  (s) =>
                    !["linkedin", "naukri", "internshala", "indeed", "remotive"].includes(
                      s.toLowerCase()
                    )
                )
                .map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
            </select>
          </div>

          {/* Job Type Filter */}
          <div className="relative flex items-center gap-2">
            <Filter size={17} className="text-slate-400 hidden lg:block" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-xs outline-none focus:border-blue-500"
            >
              <option value="ALL">All Employment Types</option>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Remote">Remote</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-3 text-blue-600" size={36} />
            <p className="text-sm font-medium">Loading opportunities...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <BriefcaseBusiness size={30} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No jobs found</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              No jobs matched your filter. Click <strong>"Sync for My Skills"</strong> above to
              automatically ingest real-world openings for your skillset from Naukri, LinkedIn, and Internshala!
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={handleSyncUserJobs}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                <Sparkles size={16} />
                Fetch Jobs for My Skills
              </button>
              <button
                onClick={() => {
                  setSearch("");
                  setTypeFilter("ALL");
                  setSourceFilter("ALL");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => {
              const skills = jobSkillsMap[job.jobId] || [];
              const rawUrl = job.jobUrl?.trim();
              const fullJobUrl = rawUrl
                ? rawUrl.startsWith("http")
                  ? rawUrl
                  : `https://${rawUrl}`
                : null;

              return (
                <div
                  key={job.jobId}
                  className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
                >
                  <div>
                    {/* Header: Type and Platform Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-block rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        {job.jobType || "Full Time"}
                      </span>

                      {job.source && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${getSourceBadgeStyle(
                            job.source
                          )}`}
                        >
                          <Globe size={11} />
                          {job.source}
                        </span>
                      )}
                    </div>

                    {/* Job Title */}
                    <h2 className="mt-3 text-xl font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition">
                      {job.jobTitle}
                    </h2>

                    {/* Company & Location */}
                    <div className="mt-3 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={15} className="text-slate-400" />
                        <span className="font-semibold text-slate-800">
                          {job.company}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={15} className="text-slate-400" />
                        <span>{job.location || "Remote / Unspecified"}</span>
                      </div>
                    </div>

                    {/* Metadata tags: Salary & Experience */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {job.salary != null && job.salary > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                          <DollarSign size={13} />
                          {job.salary.toLocaleString()} / yr
                        </span>
                      )}
                      {job.experience != null && (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-100">
                          <Clock size={13} />
                          {job.experience}{" "}
                          {job.experience === 1 ? "yr" : "yrs"} exp
                        </span>
                      )}
                    </div>

                    {/* Required Skills Section */}
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Required Skills ({skills.length})
                        </span>
                        <button
                          onClick={() => {
                            setSelectedJobForSkill(job);
                            setShowSkillModal(true);
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
                        >
                          <Plus size={13} /> Add Skill
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {skills.length > 0 ? (
                          skills.map((item, idx) => (
                            <span
                              key={item.id || idx}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700"
                            >
                              <Tag size={11} className="text-slate-400" />
                              {item.skill?.skillName}
                              <span className="text-[10px] text-blue-600 font-bold">
                                ({item.requiredLevel?.slice(0, 3)})
                              </span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            No skills tagged yet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Prominent Apply Button */}
                  <div className="mt-6 border-t border-slate-100 pt-4 space-y-2.5">
                    {/* Primary Apply Button */}
                    {fullJobUrl ? (
                      <a
                        href={fullJobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:from-emerald-700 hover:to-teal-700 transition"
                      >
                        <ExternalLink size={14} />
                        Apply on {job.source || "Official Portal"}
                      </a>
                    ) : (
                      <button
                        disabled
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-400 cursor-not-allowed"
                      >
                        Apply Link Not Available
                      </button>
                    )}

                    {/* Secondary Navigation Actions */}
                    <div className="grid grid-cols-3 gap-2">
                      <Link
                        to={`/job-recommendations?jobId=${job.jobId}`}
                        className="flex items-center justify-center gap-1 rounded-xl bg-blue-50 px-2.5 py-2 text-[11px] font-bold text-blue-700 transition hover:bg-blue-100"
                        title="Check your compatibility score"
                      >
                        <Compass size={13} />
                        Match Fit
                      </Link>

                      <Link
                        to={`/courses?jobId=${job.jobId}`}
                        className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                        title="Recommended courses to qualify"
                      >
                        <BookOpen size={13} className="text-emerald-600" />
                        Courses
                      </Link>

                      <Link
                        to={`/roadmap?jobId=${job.jobId}`}
                        className="flex items-center justify-center gap-1 rounded-xl bg-violet-50 px-2.5 py-2 text-[11px] font-bold text-violet-700 hover:bg-violet-100 transition"
                        title="Step-by-step career path"
                      >
                        <Map size={13} />
                        Roadmap
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                  <BriefcaseBusiness size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Post New Opportunity
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Java Backend Developer"
                  value={newJob.jobTitle}
                  onChange={(e) =>
                    setNewJob({ ...newJob, jobTitle: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google"
                    value={newJob.company}
                    onChange={(e) =>
                      setNewJob({ ...newJob, company: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. New York / Remote"
                    value={newJob.location}
                    onChange={(e) =>
                      setNewJob({ ...newJob, location: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Salary (USD / yr)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 120000"
                    value={newJob.salary}
                    onChange={(e) =>
                      setNewJob({ ...newJob, salary: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 3"
                    value={newJob.experience}
                    onChange={(e) =>
                      setNewJob({ ...newJob, experience: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Job Type
                  </label>
                  <select
                    value={newJob.jobType}
                    onChange={(e) =>
                      setNewJob({ ...newJob, jobType: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Remote">Remote</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Source (e.g. LinkedIn, Naukri)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LinkedIn"
                    value={newJob.source}
                    onChange={(e) =>
                      setNewJob({ ...newJob, source: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Job Link / Application URL *
                </label>
                <input
                  type="url"
                  placeholder="https://www.linkedin.com/jobs/view/..."
                  value={newJob.jobUrl}
                  onChange={(e) =>
                    setNewJob({ ...newJob, jobUrl: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
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
                  disabled={submittingJob}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingJob && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  Save Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attach Skill Modal */}
      {showSkillModal && selectedJobForSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Add Skill Requirement
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedJobForSkill.jobTitle} - {selectedJobForSkill.company}
                </p>
              </div>
              <button
                onClick={() => setShowSkillModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSkillToJob} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Select Skill *
                </label>
                <select
                  required
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose a skill --</option>
                  {skillsCatalog.map((s) => (
                    <option key={s.skillId} value={s.skillId}>
                      {s.skillName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Required Proficiency Level
                </label>
                <select
                  value={requiredLevel}
                  onChange={(e) => setRequiredLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSkillModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSkill || !selectedSkillId}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingSkill && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  Attach Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
