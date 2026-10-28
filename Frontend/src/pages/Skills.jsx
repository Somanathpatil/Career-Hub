import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Plus,
  Search,
  CheckCircle2,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { resolveUserId } from "../utils/auth";

export default function Skills() {
  const [userId, setUserId] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [masterSkills, setMasterSkills] = useState([]);
  const [loadingUserSkills, setLoadingUserSkills] = useState(true);
  const [loadingMasterSkills, setLoadingMasterSkills] = useState(true);

  const [searchMaster, setSearchMaster] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");

  // Add to Profile Modal
  const [showAddUserSkillModal, setShowAddUserSkillModal] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("INTERMEDIATE");
  const [submittingUserSkill, setSubmittingUserSkill] = useState(false);

  // Create New Skill in Catalog Modal
  const [showCreateSkillModal, setShowCreateSkillModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [submittingNewSkill, setSubmittingNewSkill] = useState(false);

  const fetchUserSkills = async (uid) => {
    if (!uid) return;
    try {
      setLoadingUserSkills(true);
      const res = await api.get(`/api/userskill/user/${uid}`);
      setUserSkills(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load user skills:", err);
      toast.error("Failed to load your profile skills.");
    } finally {
      setLoadingUserSkills(false);
    }
  };

  const fetchMasterSkills = async () => {
    try {
      setLoadingMasterSkills(true);
      const res = await api.get("/api/skills/");
      setMasterSkills(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load master skills:", err);
    } finally {
      setLoadingMasterSkills(false);
    }
  };

  const init = async () => {
    const uid = await resolveUserId();
    setUserId(uid);
    fetchUserSkills(uid);
    fetchMasterSkills();
  };

  useEffect(() => {
    init();
  }, []);

  const handleAddUserSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkillId || !userId) {
      toast.error("Please select a skill.");
      return;
    }

    try {
      setSubmittingUserSkill(true);
      await api.post("/api/userskill/add", {
        user: { userId },
        skill: { skillId: parseInt(selectedSkillId, 10) },
        level: selectedLevel,
      });

      toast.success("Skill added to your profile!");
      setShowAddUserSkillModal(false);
      setSelectedSkillId("");
      fetchUserSkills(userId);
    } catch (err) {
      console.error("Failed to add user skill:", err);
      toast.error("Failed to add skill to profile.");
    } finally {
      setSubmittingUserSkill(false);
    }
  };

  const handleCreateMasterSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) {
      toast.error("Please enter a skill name.");
      return;
    }

    try {
      setSubmittingNewSkill(true);
      const res = await api.post("/api/skills/add", {
        skillName: newSkillName.trim(),
      });

      toast.success(`Skill "${newSkillName.trim()}" created!`);
      setShowCreateSkillModal(false);
      setNewSkillName("");

      await fetchMasterSkills();

      // Optionally auto-open add to user skill
      if (res.data?.skillId) {
        setSelectedSkillId(String(res.data.skillId));
        setShowAddUserSkillModal(true);
      }
    } catch (err) {
      console.error("Failed to create skill:", err);
      toast.error("Failed to create skill.");
    } finally {
      setSubmittingNewSkill(false);
    }
  };

  const userSkillIds = new Set(
    userSkills.map((us) => us.skill?.skillId).filter(Boolean)
  );

  const getLevelBadgeClass = (level) => {
    switch ((level || "").toUpperCase()) {
      case "EXPERT":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "ADVANCED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "INTERMEDIATE":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  const filteredUserSkills = userSkills.filter((us) => {
    if (levelFilter === "ALL") return true;
    return (
      (us.level || "").toUpperCase() === levelFilter.toUpperCase()
    );
  });

  const filteredMasterSkills = masterSkills.filter((s) =>
    (s.skillName || "").toLowerCase().includes(searchMaster.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Banner */}
        <section className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={14} />
              Skill Identity & Matrix
            </div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">
              My Skills & Knowledge Base
            </h1>
            <p className="mt-2 max-w-xl text-sm sm:text-base text-blue-100">
              Manage your verified competencies, declare your proficiency
              levels, and explore the skills directory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/resume-analyzer"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/15 border border-white/30 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/25 transition"
            >
              <FileText size={15} />
              Extract from Resume
            </Link>

            <button
              onClick={() => setShowAddUserSkillModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-xs font-bold text-blue-700 shadow-md hover:bg-blue-50 transition"
            >
              <Plus size={16} />
              Add Skill to Profile
            </button>
          </div>
        </section>

        {/* SECTION 1: MY PROFILE SKILLS */}
        <section className="mb-12">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                My Profile Skills ({userSkills.length})
              </h2>
              <p className="text-xs text-slate-500">
                Skills currently evaluated for job matching and recommendations
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Filter Level:</span>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs outline-none focus:border-blue-500"
              >
                <option value="ALL">All Levels</option>
                <option value="EXPERT">Expert</option>
                <option value="ADVANCED">Advanced</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="BEGINNER">Beginner</option>
              </select>
            </div>
          </div>

          {loadingUserSkills ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="animate-spin mb-3 text-blue-600" size={32} />
              <p className="text-sm font-medium">Loading your profile skills...</p>
            </div>
          ) : userSkills.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xs">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Sparkles size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                No skills on your profile yet
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Add skills manually or scan your resume to automatically match
                and save your verified skills.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={() => setShowAddUserSkillModal(true)}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Add Manually
                </button>
                <Link
                  to="/resume-analyzer"
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Scan Resume
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredUserSkills.map((us) => (
                <div
                  key={us.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:shadow-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0 font-bold text-sm">
                      {us.skill?.skillName?.slice(0, 2).toUpperCase() || "SK"}
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate font-bold text-slate-900 text-sm">
                        {us.skill?.skillName}
                      </h4>
                      <span
                        className={`inline-block mt-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${getLevelBadgeClass(
                          us.level
                        )}`}
                      >
                        {us.level || "BEGINNER"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (us.skill?.skillId) {
                        setSelectedSkillId(String(us.skill.skillId));
                        setSelectedLevel(us.level || "INTERMEDIATE");
                        setShowAddUserSkillModal(true);
                      }
                    }}
                    title="Change level"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-xs font-semibold"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 2: MASTER SKILLS DIRECTORY */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Skills Catalog Directory
              </h2>
              <p className="text-xs text-slate-500">
                Explore all skills recognized by CareerHub
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchMaster}
                  onChange={(e) => setSearchMaster(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <button
                onClick={() => setShowCreateSkillModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shrink-0"
              >
                <Plus size={14} />
                New Skill
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {loadingMasterSkills ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-4">
                <Loader2 size={16} className="animate-spin" />
                Loading catalog...
              </div>
            ) : filteredMasterSkills.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">
                No matching skills in catalog.
              </p>
            ) : (
              filteredMasterSkills.map((s) => {
                const alreadyOnProfile = userSkillIds.has(s.skillId);

                return (
                  <div
                    key={s.skillId}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                      alreadyOnProfile
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300"
                    }`}
                  >
                    <span>{s.skillName}</span>
                    {alreadyOnProfile ? (
                      <CheckCircle2 size={13} className="text-emerald-600" />
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedSkillId(String(s.skillId));
                          setShowAddUserSkillModal(true);
                        }}
                        title="Add to my profile"
                        className="rounded-md bg-white border border-slate-200 p-0.5 text-blue-600 hover:bg-blue-50"
                      >
                        <Plus size={12} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* Add Skill to Profile Modal */}
      {showAddUserSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Add Skill to My Profile
              </h3>
              <button
                onClick={() => setShowAddUserSkillModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUserSkill} className="mt-4 space-y-4">
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
                  <option value="">-- Choose skill --</option>
                  {masterSkills.map((s) => (
                    <option key={s.skillId} value={s.skillId}>
                      {s.skillName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Proficiency Level *
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="BEGINNER">Beginner (1/4)</option>
                  <option value="INTERMEDIATE">Intermediate (2/4)</option>
                  <option value="ADVANCED">Advanced (3/4)</option>
                  <option value="EXPERT">Expert (4/4)</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserSkillModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingUserSkill || !selectedSkillId}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingUserSkill && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  Save to Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Master Skill Modal */}
      {showCreateSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Create New Catalog Skill
              </h3>
              <button
                onClick={() => setShowCreateSkillModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMasterSkill} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Skill Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kubernetes, TypeScript, Kafka"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateSkillModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNewSkill || !newSkillName.trim()}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {submittingNewSkill && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  Create Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
