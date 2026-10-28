import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Compass,
  BriefcaseBusiness,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Map,
  Sparkles,
  ArrowRight,
  Loader2,
  RefreshCw,
  ExternalLink,
  Globe,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { resolveUserId } from "../utils/auth";

export default function JobMatching() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialJobId = searchParams.get("jobId");

  const [userId, setUserId] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId || "");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loadingSelected, setLoadingSelected] = useState(false);

  // All jobs ranking state
  const [allMatches, setAllMatches] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);

  const loadMatchForJob = async (uid, jobId) => {
    if (!uid || !jobId) return;
    try {
      setLoadingSelected(true);
      const res = await api.get(`/api/jobmatch/user/${uid}/job/${jobId}`);
      setSelectedMatch(res.data);
    } catch (err) {
      console.error(`Failed to calculate match for job ${jobId}:`, err);
      toast.error("Could not calculate job match score.");
    } finally {
      setLoadingSelected(false);
    }
  };

  const calculateAllMatches = async (uid, jobList) => {
    try {
      setLoadingAll(true);
      const promises = jobList.map(async (job) => {
        try {
          const res = await api.get(`/api/jobmatch/user/${uid}/job/${job.jobId}`);
          return {
            ...job,
            matchResult: res.data,
            score: res.data?.matchScoure ?? res.data?.matchScore ?? 0,
          };
        } catch {
          return { ...job, matchResult: null, score: 0 };
        }
      });

      const results = await Promise.all(promises);
      results.sort((a, b) => b.score - a.score);
      setAllMatches(results);
    } catch (err) {
      console.error("Failed calculating all matches:", err);
    } finally {
      setLoadingAll(false);
    }
  };

  const fetchJobs = async (uid) => {
    try {
      const res = await api.get("/api/jobs");
      const list = Array.isArray(res.data) ? res.data : [];
      setJobs(list);

      const targetJobId = initialJobId || (list.length > 0 ? String(list[0].jobId) : "");
      if (targetJobId) {
        setSelectedJobId(targetJobId);
        loadMatchForJob(uid, targetJobId);
      }

      // Pre-calculate all matches for ranking
      if (list.length > 0) {
        calculateAllMatches(uid, list);
      }
    } catch (err) {
      console.error("Failed to load jobs for matching:", err);
      toast.error("Failed to load jobs.");
    }
  };

  const init = async () => {
    const uid = await resolveUserId();
    setUserId(uid);
    fetchJobs(uid);
  };

  useEffect(() => {
    init();
  }, []);

  const handleSelectJob = (jobId) => {
    setSelectedJobId(jobId);
    setSearchParams({ jobId });
    loadMatchForJob(userId, jobId);
  };

  const score =
    selectedMatch?.matchScoure ?? selectedMatch?.matchScore ?? 0;

  const getScoreColor = (val) => {
    if (val >= 70) return "text-emerald-600 bg-emerald-50 border-emerald-200 ring-emerald-500/20";
    if (val >= 40) return "text-amber-600 bg-amber-50 border-amber-200 ring-amber-500/20";
    return "text-rose-600 bg-rose-50 border-rose-200 ring-rose-500/20";
  };

  const getScoreBadgeColor = (val) => {
    if (val >= 70) return "bg-emerald-500";
    if (val >= 40) return "bg-amber-500";
    return "bg-rose-500";
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

  const selectedJobDetails = jobs.find(
    (j) => String(j.jobId) === String(selectedJobId)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Banner */}
        <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-900/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                <Compass size={14} />
                Skill Compatibility Engine
              </div>
              <h1 className="text-3xl font-extrabold sm:text-4xl">
                Job Fit & Skill Gap Analyzer
              </h1>
              <p className="mt-2 max-w-xl text-sm sm:text-base text-blue-100">
                Compare your current verified skills with required job competencies.
                Uncover your match score, missing skills, and skill level gaps.
              </p>
            </div>

            <Link
              to="/skills"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/15 border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/25 transition shrink-0"
            >
              <Sparkles size={16} />
              Update My Skills
            </Link>
          </div>
        </section>

        {/* Job Selection Dropdown */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Target Job To Analyze
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => handleSelectJob(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
            >
              {jobs.map((job) => (
                <option key={job.jobId} value={job.jobId}>
                  {job.jobTitle} - {job.company} ({job.location || "Remote"})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              loadMatchForJob(userId, selectedJobId);
              calculateAllMatches(userId, jobs);
            }}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shrink-0"
          >
            <RefreshCw size={15} />
            Re-calculate
          </button>
        </div>

        {/* Selected Job Analysis Card */}
        {loadingSelected ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-3 text-blue-600" size={36} />
            <p className="text-sm font-medium">Analyzing job compatibility...</p>
          </div>
        ) : selectedMatch ? (
          <div className="space-y-8">
            {/* Score & Overview Header Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
                      <BriefcaseBusiness size={15} />
                      {selectedJobDetails?.company || "Company"} · {selectedJobDetails?.location || "Location"}
                    </span>
                    {selectedJobDetails?.source && (
                      <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getSourceBadgeStyle(selectedJobDetails.source)}`}>
                        <Globe size={11} />
                        {selectedJobDetails.source}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {selectedMatch.title || selectedJobDetails?.jobTitle}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500 max-w-xl">
                    Based on your profile skills, here is your compatibility
                    breakdown for this role.
                  </p>
                </div>

                {/* Match Score Display */}
                <div className={`flex items-center gap-5 rounded-2xl border p-5 ${getScoreColor(score)} ring-4`}>
                  <div className="text-center">
                    <div className="text-4xl sm:text-5xl font-black tracking-tight">
                      {Math.round(score)}%
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Match Score
                    </span>
                  </div>

                  <div className="h-12 w-px bg-current opacity-20" />

                  <div className="text-xs space-y-1">
                    <div className="font-bold">
                      {score >= 70
                        ? "Great match!"
                        : score >= 40
                        ? "Moderate match"
                        : "Skills needed"}
                    </div>
                    <p className="opacity-80 max-w-32 leading-tight">
                      {score >= 70
                        ? "You meet most requirements."
                        : score >= 40
                        ? "Take courses to close gaps."
                        : "Follow the roadmap to prepare."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
                {selectedJobDetails?.jobUrl && (
                  <a
                    href={
                      selectedJobDetails.jobUrl.startsWith("http")
                        ? selectedJobDetails.jobUrl
                        : `https://${selectedJobDetails.jobUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:from-emerald-700 hover:to-teal-700 transition"
                  >
                    <ExternalLink size={16} />
                    Apply on {selectedJobDetails.source || "Official Portal"}
                  </a>
                )}

                <Link
                  to={`/courses?jobId=${selectedJobId}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  <BookOpen size={16} className="text-emerald-600" />
                  View Recommended Courses
                </Link>

                <Link
                  to={`/roadmap?jobId=${selectedJobId}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
                >
                  <Map size={16} />
                  Generate Learning Roadmap
                </Link>

                <Link
                  to="/skills"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Sparkles size={16} className="text-blue-600" />
                  Add More Skills
                </Link>
              </div>
            </div>

            {/* Skills Breakdown Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Matched Skills */}
              <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-2.5 pb-4 border-b border-emerald-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={19} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-950">
                      Matched Skills
                    </h3>
                    <p className="text-xs text-emerald-700">
                      You meet or exceed expectations
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  {selectedMatch.matchingSkills &&
                  selectedMatch.matchingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedMatch.matchingSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-100"
                        >
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-4">
                      No matching skills found for this role yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Skill Gaps */}
              <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-2.5 pb-4 border-b border-amber-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <TrendingUp size={19} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-amber-950">
                      Skill Level Gaps
                    </h3>
                    <p className="text-xs text-amber-700">
                      Level up your existing proficiency
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  {selectedMatch.skillGaps &&
                  selectedMatch.skillGaps.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedMatch.skillGaps.map((gap, idx) => (
                        <li
                          key={idx}
                          className="rounded-xl bg-amber-50 p-2.5 text-xs font-semibold text-amber-900 border border-amber-100"
                        >
                          {gap}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-4">
                      No skill level gaps detected!
                    </p>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-2.5 pb-4 border-b border-rose-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                    <AlertCircle size={19} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-rose-950">
                      Missing Skills
                    </h3>
                    <p className="text-xs text-rose-700">
                      Required skills not on your profile
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  {selectedMatch.missingSkills &&
                  selectedMatch.missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedMatch.missingSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800 border border-rose-100"
                        >
                          <AlertCircle size={13} className="text-rose-600" />
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-4">
                      Great job! No missing skills for this role.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Opportunities Fit Leaderboard */}
            <section className="mt-12">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Opportunity Match Leaderboard
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ranked by your profile compatibility
                  </p>
                </div>
                {loadingAll && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Loader2 size={13} className="animate-spin" />
                    Updating rankings...
                  </span>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {allMatches.map((item) => {
                  const isSelected = String(item.jobId) === String(selectedJobId);
                  return (
                    <div
                      key={item.jobId}
                      onClick={() => handleSelectJob(String(item.jobId))}
                      className={`cursor-pointer rounded-2xl border p-4 transition ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="truncate font-bold text-slate-900 text-sm">
                            {item.jobTitle}
                          </h4>
                          <p className="truncate text-xs text-slate-500">
                            {item.company} · {item.location || "Remote"}
                          </p>
                          {item.source && (
                            <span className={`mt-1.5 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getSourceBadgeStyle(
                              item.source
                            )}`}>
                              <Globe size={10} />
                              {item.source}
                            </span>
                          )}
                        </div>
                        <span
                          className={`shrink-0 rounded-lg px-2 py-1 text-xs font-extrabold text-white ${getScoreBadgeColor(
                            item.score
                          )}`}
                        >
                          {Math.round(item.score)}%
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                        <span>
                          {item.matchResult?.matchingSkills?.length || 0} matched
                        </span>
                        <div className="flex items-center gap-2">
                          {item.jobUrl && (
                            <a
                              href={
                                item.jobUrl.startsWith("http")
                                  ? item.jobUrl
                                  : `https://${item.jobUrl}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                              title={`Apply directly on ${item.source || "portal"}`}
                            >
                              Apply <ExternalLink size={10} />
                            </a>
                          )}
                          <span className="text-blue-600 font-bold flex items-center gap-0.5">
                            Fit <ArrowRight size={11} />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <Compass size={36} className="mx-auto mb-3 text-slate-400" />
            <h3 className="text-base font-bold text-slate-800">
              Select a job to view match analysis
            </h3>
          </div>
        )}
      </main>
    </div>
  );
}
