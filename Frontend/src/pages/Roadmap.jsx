import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Map,
  CheckCircle2,
  Plus,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Loader2,
  BriefcaseBusiness,
  PartyPopper,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { resolveUserId } from "../utils/auth";

export default function Roadmap() {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get("jobId");

  const [userId, setUserId] = useState(null);
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(null);
  const [steps, setSteps] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true);
  const [loadingSteps, setLoadingSteps] = useState(false);

  // Generate Modal State
  const [jobs, setJobs] = useState([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateJobId, setGenerateJobId] = useState(initialJobId || "");
  const [generating, setGenerating] = useState(false);

  const loadRoadmapDetails = async (roadmapId) => {
    if (!roadmapId) return;
    try {
      setLoadingSteps(true);
      const [stepsRes, progressRes] = await Promise.all([
        api.get(`/api/roadmaps/${roadmapId}/steps`),
        api.get(`/api/roadmaps/${roadmapId}/progress`),
      ]);

      setSteps(Array.isArray(stepsRes.data) ? stepsRes.data : []);
      setProgress(progressRes.data);
    } catch (err) {
      console.error(`Failed to load details for roadmap ${roadmapId}:`, err);
      toast.error("Failed to load roadmap details.");
    } finally {
      setLoadingSteps(false);
    }
  };

  const fetchRoadmaps = async (uid) => {
    try {
      setLoadingRoadmaps(true);
      const res = await api.get(`/api/roadmaps/user/${uid}`);
      const list = Array.isArray(res.data) ? res.data : [];
      setRoadmaps(list);

      if (list.length > 0) {
        const first = list[0];
        setSelectedRoadmapId(first.roadmapId);
        loadRoadmapDetails(first.roadmapId);
      } else if (initialJobId) {
        setShowGenerateModal(true);
        setGenerateJobId(initialJobId);
      }
    } catch (err) {
      console.error("Failed to load user roadmaps:", err);
      toast.error("Failed to load roadmaps.");
    } finally {
      setLoadingRoadmaps(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get("/api/jobs");
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
  };

  const init = async () => {
    const uid = await resolveUserId();
    setUserId(uid);
    fetchRoadmaps(uid);
    fetchJobs();
  };

  useEffect(() => {
    init();
  }, []);

  const handleSelectRoadmap = (roadmapId) => {
    setSelectedRoadmapId(roadmapId);
    loadRoadmapDetails(roadmapId);
  };

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    if (!generateJobId || !userId) {
      toast.error("Please select a target job.");
      return;
    }

    try {
      setGenerating(true);
      const res = await api.post(
        `/api/roadmaps/generate/${userId}/${generateJobId}`
      );
      toast.success("Learning roadmap generated successfully!");
      setShowGenerateModal(false);

      const newRoadmap = res.data;
      await fetchRoadmaps(userId);
      if (newRoadmap?.roadmapId) {
        setSelectedRoadmapId(newRoadmap.roadmapId);
        loadRoadmapDetails(newRoadmap.roadmapId);
      }
    } catch (err) {
      console.error("Failed to generate roadmap:", err);
      toast.error(
        err.response?.data?.message || "Failed to generate roadmap."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleStep = async (step) => {
    const isCompleted = step.status === "COMPLETED";
    try {
      if (isCompleted) {
        await api.put(`/api/roadmaps/steps/${step.stepId}/reopen`);
        toast.info("Step marked as in progress.");
      } else {
        await api.put(`/api/roadmaps/steps/${step.stepId}/complete`);
        toast.success("Step completed! Great progress! 🎉");
      }

      // Reload steps and progress
      loadRoadmapDetails(selectedRoadmapId);
    } catch (err) {
      console.error("Failed to update step status:", err);
      toast.error("Could not update step status.");
    }
  };

  const selectedRoadmap = roadmaps.find(
    (r) => r.roadmapId === selectedRoadmapId
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Banner */}
        <section className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-violet-700 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shadow-xl shadow-purple-900/10">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <Map size={14} />
              Career Navigation
            </div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">
              Personalized Learning Roadmaps
            </h1>
            <p className="mt-2 max-w-xl text-sm sm:text-base text-purple-100">
              Follow step-by-step milestones to master required skills, track your
              progress, and unlock your target job qualification.
            </p>
          </div>

          <button
            onClick={() => setShowGenerateModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-violet-800 shadow-md transition hover:bg-violet-50 shrink-0"
          >
            <Plus size={18} />
            Generate New Roadmap
          </button>
        </section>

        {loadingRoadmaps ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-3 text-violet-600" size={36} />
            <p className="text-sm font-medium">Loading your career roadmaps...</p>
          </div>
        ) : roadmaps.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Map size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No roadmaps generated yet
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              Select a target job opportunity to automatically generate an
              actionable, step-by-step learning journey.
            </p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-violet-700 shadow-xs"
            >
              <Plus size={16} />
              Generate First Roadmap
            </button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left Column: Roadmaps List */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Your Roadmaps ({roadmaps.length})
                </h3>
              </div>

              {roadmaps.map((r) => {
                const isSelected = r.roadmapId === selectedRoadmapId;

                return (
                  <div
                    key={r.roadmapId}
                    onClick={() => handleSelectRoadmap(r.roadmapId)}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      isSelected
                        ? "border-violet-500 bg-violet-50/60 shadow-md ring-2 ring-violet-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {r.title || `Roadmap #${r.roadmapId}`}
                      </h4>
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                          r.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {r.status || "IN PROGRESS"}
                      </span>
                    </div>

                    {r.job && (
                      <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                        <BriefcaseBusiness size={12} />
                        {r.job.company}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between text-xs font-semibold text-violet-700">
                      <span>View milestones</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Selected Roadmap Details & Steps */}
            <div className="lg:col-span-8">
              {loadingSteps ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 rounded-3xl border border-slate-200 bg-white">
                  <Loader2 className="animate-spin mb-3 text-violet-600" size={32} />
                  <p className="text-sm font-medium">Loading steps...</p>
                </div>
              ) : selectedRoadmap ? (
                <div className="space-y-6">
                  {/* Overview Card */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="rounded-md bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">
                          Target Goal
                        </span>
                        <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
                          {selectedRoadmap.title}
                        </h2>
                        {selectedRoadmap.job && (
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            Role: {selectedRoadmap.job.jobTitle} at{" "}
                            {selectedRoadmap.job.company}
                          </p>
                        )}
                      </div>

                      {progress && (
                        <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                          <div className="text-right">
                            <span className="block text-2xl font-black text-violet-700">
                              {progress.progressPercentage}%
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 uppercase">
                              {progress.completedSteps} / {progress.totalSteps} Steps
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {progress && (
                      <div className="mt-6">
                        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-emerald-500 transition-all duration-500"
                            style={{ width: `${progress.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Completion Alert */}
                    {progress?.progressPercentage === 100 && (
                      <div className="mt-5 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800 border border-emerald-200">
                        <PartyPopper size={24} className="text-emerald-600 shrink-0" />
                        <div>
                          <h4 className="font-bold text-sm">
                            Congratulations! Roadmap 100% Completed!
                          </h4>
                          <p className="text-xs text-emerald-700">
                            You have mastered all the milestone skills required
                            for this target job.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Steps Timeline */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                      Learning Milestones ({steps.length})
                    </h3>

                    {steps.length === 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 text-sm">
                        No steps generated for this roadmap.
                      </div>
                    ) : (
                      steps.map((step, idx) => {
                        const isDone = step.status === "COMPLETED";

                        return (
                          <div
                            key={step.stepId}
                            className={`flex flex-col sm:flex-row items-start gap-4 rounded-3xl border p-5 transition ${
                              isDone
                                ? "border-emerald-200 bg-emerald-50/30"
                                : "border-slate-200 bg-white shadow-xs hover:border-slate-300"
                            }`}
                          >
                            {/* Step Order Badge */}
                            <div className="flex items-center gap-3 shrink-0">
                              <button
                                onClick={() => handleToggleStep(step)}
                                title={
                                  isDone
                                    ? "Click to reopen milestone"
                                    : "Click to complete milestone"
                                }
                                className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                                  isDone
                                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                    : "border-2 border-slate-300 bg-slate-50 text-slate-400 hover:border-violet-500 hover:text-violet-600"
                                }`}
                              >
                                {isDone ? (
                                  <CheckCircle2 size={20} />
                                ) : (
                                  <span className="font-extrabold text-sm">
                                    {step.stepOrder || idx + 1}
                                  </span>
                                )}
                              </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="rounded-lg bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-800">
                                  {step.skill?.skillName || "Skill"}
                                </span>
                                <span
                                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                    isDone
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {step.status}
                                </span>
                              </div>

                              <p
                                className={`text-sm font-semibold leading-relaxed ${
                                  isDone
                                    ? "text-slate-500 line-through"
                                    : "text-slate-800"
                                }`}
                              >
                                {step.description}
                              </p>

                              {/* Course Recommendation if available */}
                              {step.course && (
                                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shrink-0">
                                      <BookOpen size={16} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate text-xs font-bold text-slate-900">
                                        {step.course.title}
                                      </p>
                                      <p className="text-[11px] text-slate-500">
                                        {step.course.provider} ·{" "}
                                        {step.course.duration || "Self-Paced"}
                                      </p>
                                    </div>
                                  </div>

                                  {step.course.url && (
                                    <a
                                      href={
                                        step.course.url.startsWith("http")
                                          ? step.course.url
                                          : `https://${step.course.url}`
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center justify-center gap-1 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 shrink-0"
                                    >
                                      Take Course
                                      <ExternalLink size={12} />
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Status Button Action */}
                            <div className="shrink-0 self-end sm:self-center">
                              <button
                                onClick={() => handleToggleStep(step)}
                                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                                  isDone
                                    ? "border border-slate-200 text-slate-500 hover:bg-slate-100"
                                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                                }`}
                              >
                                {isDone ? (
                                  <>
                                    <RotateCcw size={13} /> Reopen
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 size={13} /> Complete
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </main>

      {/* Generate Roadmap Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
                  <Map size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Generate Roadmap
                </h3>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <AlertCircle size={19} />
              </button>
            </div>

            <form onSubmit={handleGenerateRoadmap} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Target Job Opportunity *
                </label>
                <select
                  required
                  value={generateJobId}
                  onChange={(e) => setGenerateJobId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-500"
                >
                  <option value="">-- Choose target role --</option>
                  {jobs.map((job) => (
                    <option key={job.jobId} value={job.jobId}>
                      {job.jobTitle} - {job.company}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  We'll compare your profile skills with this job's requirements
                  and generate tailored milestones and recommended courses.
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating || !generateJobId}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {generating && <Loader2 size={14} className="animate-spin" />}
                  Generate Roadmap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
