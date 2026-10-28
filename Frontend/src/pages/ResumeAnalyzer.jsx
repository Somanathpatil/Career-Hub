import { useState } from "react";
import {
    UploadCloud,
    FileText,
    Mail,
    BriefcaseBusiness,
    GraduationCap,
    FolderKanban,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    X,
    LoaderCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { resolveUserId } from "../utils/auth";

export default function ResumeAnalyzer() {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [matching, setMatching] = useState(false);
    const [savingSkills, setSavingSkills] = useState(false);
    const [skillsSaved, setSkillsSaved] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [matchedSkills, setMatchedSkills] = useState([]);
    const [unmatchedSkills, setUnmatchedSkills] = useState([]);
    const [skillLevels, setSkillLevels] = useState({});
    const [error, setError] = useState("");

    const selectFile = (selectedFile) => {
        setError("");
        setAnalysis(null);
        setMatchedSkills([]);
        setUnmatchedSkills([]);

        if (!selectedFile) return;

        if (selectedFile.type !== "application/pdf") {
            setFile(null);
            setError("Please select a PDF file.");
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setFile(null);
            setError("The PDF must be smaller than 5 MB.");
            return;
        }

        setFile(selectedFile);
    };

    const analyzeResume = async () => {
        if (!file) {
            toast.error("Please select a PDF resume first.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const formData = new FormData();
            formData.append("file", file);

            const response = await api.post(
                "/api/resume/analyze",
                formData
            );

            setAnalysis(response.data);
            toast.success("Resume analyzed successfully!");

            const skills = response.data?.skills;

            if (Array.isArray(skills) && skills.length > 0) {
                matchSkills(skills); // Run separately; don't block the analysis spinner
            }
        } catch (err) {
            console.error("Resume analysis error:", err);

            const message =
                err.code === "ECONNABORTED"
                    ? "Resume analysis timed out (90s). The Gemini API took too long to respond. Please check your network or API quota."
                    : err.response?.data?.message ||
                    err.message ||
                    "Unable to analyze the resume. Please check your Gemini API key or quota.";
            setError(message);
            toast.error(message, { autoClose: 8000 });
        } finally {
            setLoading(false);
        }
    };

    const matchSkills = async (skills) => {
        try {
            setMatching(true);

            const response = await api.post(
                "/api/resume/match-skills",
                skills
            );

            const matched = response.data?.matchedSkills || [];
            setMatchedSkills(matched);
            setUnmatchedSkills(response.data?.unmatchedSkills || []);

            const initialLevels = {};
            matched.forEach((s) => {
                initialLevels[s.skillId] = "INTERMEDIATE";
            });
            setSkillLevels(initialLevels);
        } catch (err) {
            console.error("Skill matching failed:", err);
            toast.error(
                "Resume analyzed, but matching skills with the database failed."
            );
        } finally {
            setMatching(false);
        }
    };

    const handleSaveSkillsToProfile = async () => {
        if (!matchedSkills.length) return;
        try {
            setSavingSkills(true);
            const uid = await resolveUserId();
            const payloadSkills = matchedSkills.map((s) => ({
                skillId: s.skillId,
                level: skillLevels[s.skillId] || "INTERMEDIATE",
            }));

            const res = await api.post("/api/resume/save-skills", {
                uid: uid,
                skill: payloadSkills,
            });

            setSkillsSaved(true);
            toast.success(res.data?.message || "Matched skills saved to profile!");
        } catch (err) {
            console.error("Failed to save skills:", err);
            toast.error(err.response?.data?.message || "Failed to save skills to profile.");
        } finally {
            setSavingSkills(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
                {/* Header Banner */}
                <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 text-white shadow-xl shadow-blue-900/10 sm:p-8">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                        <Sparkles size={14} />
                        Gemini AI Resume Intelligence
                    </div>

                    <h1 className="text-3xl font-extrabold sm:text-4xl">
                        AI Resume Analyzer & Skill Extractor
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-blue-100 sm:text-base">
                        Upload your PDF resume. Gemini extracts your profile, experience,
                        education, and maps your competencies directly to your CareerHub skills.
                    </p>
                </section>

                {/* Upload Card */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragging(false);
                            if (e.dataTransfer.files?.[0]) {
                                selectFile(e.dataTransfer.files[0]);
                            }
                        }}
                        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
                            dragging
                                ? "border-blue-500 bg-blue-50/50"
                                : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                        }`}
                    >
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                            <UploadCloud size={32} />
                        </div>

                        <p className="text-base font-bold text-slate-800">
                            Drag and drop your resume PDF here
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Supports PDF up to 5 MB
                        </p>

                        <label className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700">
                            Browse File
                            <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        selectFile(e.target.files[0]);
                                    }
                                }}
                            />
                        </label>
                    </div>

                    {file && (
                        <div className="mt-5 flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
                            <div className="flex items-center gap-3">
                                <FileText className="text-blue-600" size={24} />
                                <div>
                                    <p className="text-sm font-bold text-slate-900">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setFile(null)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-blue-100 hover:text-slate-700"
                            >
                                <X size={19} />
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-bold">Resume Analysis Failed</p>
                                <p className="mt-0.5 text-xs text-red-600 leading-relaxed">{error}</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={analyzeResume}
                        disabled={!file || loading}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <LoaderCircle className="animate-spin" size={20} />
                                Analyzing resume with Gemini AI...
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                Analyze Resume
                            </>
                        )}
                    </button>
                </div>

                {/* Analysis Results Display */}
                {analysis && (
                    <div className="mt-10 space-y-8 animate-in fade-in duration-200">
                        {/* Profile Summary Card */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                            <h2 className="text-2xl font-extrabold text-slate-900">
                                {analysis.candidateName || "Candidate Profile"}
                            </h2>

                            {analysis.email && (
                                <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                                    <Mail size={14} className="text-blue-600" />
                                    <span>{analysis.email}</span>
                                </div>
                            )}

                            {analysis.summary && (
                                <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 border border-slate-100">
                                    {analysis.summary}
                                </p>
                            )}
                        </div>

                        {/* Extracted Skills Section */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">
                                        Extracted Competencies & Skills
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Skills extracted by Gemini AI from your resume
                                    </p>
                                </div>

                                {matchedSkills.length > 0 && !skillsSaved && (
                                    <button
                                        onClick={handleSaveSkillsToProfile}
                                        disabled={savingSkills}
                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        {savingSkills ? (
                                            <LoaderCircle size={14} className="animate-spin" />
                                        ) : (
                                            <CheckCircle2 size={14} />
                                        )}
                                        Save Matched Skills to Profile
                                    </button>
                                )}

                                {skillsSaved && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                                        <CheckCircle2 size={14} />
                                        Saved to Profile
                                    </span>
                                )}
                            </div>

                            {/* Raw extracted skills */}
                            <div className="mb-6">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    All Identified Skills ({analysis.skills?.length || 0})
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.skills?.map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Matched vs Unmatched */}
                            {matching ? (
                                <div className="flex items-center gap-2 text-xs text-blue-600 py-4">
                                    <LoaderCircle className="animate-spin" size={16} />
                                    <span>Matching skills with database catalog...</span>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 mt-6 pt-6 border-t border-slate-100">
                                    {/* Matched with database */}
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-1.5">
                                            <CheckCircle2 size={15} />
                                            Platform Catalog Matches ({matchedSkills.length})
                                        </h4>
                                        {matchedSkills.length === 0 ? (
                                            <p className="text-xs text-slate-400 italic">
                                                No direct catalog matches.
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {matchedSkills.map((s) => (
                                                    <div
                                                        key={s.skillId}
                                                        className="flex items-center justify-between rounded-xl bg-emerald-50/70 p-3 border border-emerald-100"
                                                    >
                                                        <span className="text-xs font-bold text-emerald-950">
                                                            {s.skillName}
                                                        </span>
                                                        <select
                                                            value={skillLevels[s.skillId] || "INTERMEDIATE"}
                                                            onChange={(e) =>
                                                                setSkillLevels({
                                                                    ...skillLevels,
                                                                    [s.skillId]: e.target.value,
                                                                })
                                                            }
                                                            className="rounded-lg border border-emerald-200 bg-white px-2 py-1 text-[11px] font-bold text-emerald-800 outline-none"
                                                        >
                                                            <option value="BEGINNER">Beginner</option>
                                                            <option value="INTERMEDIATE">Intermediate</option>
                                                            <option value="ADVANCED">Advanced</option>
                                                            <option value="EXPERT">Expert</option>
                                                        </select>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Unmatched */}
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                                            Unmatched / Custom Skills ({unmatchedSkills.length})
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {unmatchedSkills.map((u, idx) => (
                                                <span
                                                    key={idx}
                                                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                                                >
                                                    {u}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Experience, Education & Projects */}
                        <div className="grid gap-6 md:grid-cols-3">
                            {/* Experience */}
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 text-blue-700">
                                    <BriefcaseBusiness size={18} />
                                    <h3 className="font-bold text-sm">Experience</h3>
                                </div>
                                <ul className="space-y-3">
                                    {analysis.experience?.length ? (
                                        analysis.experience.map((exp, idx) => (
                                            <li
                                                key={idx}
                                                className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100"
                                            >
                                                {exp}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-xs text-slate-400 italic">None detected.</li>
                                    )}
                                </ul>
                            </div>

                            {/* Education */}
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 text-indigo-700">
                                    <GraduationCap size={18} />
                                    <h3 className="font-bold text-sm">Education</h3>
                                </div>
                                <ul className="space-y-3">
                                    {analysis.education?.length ? (
                                        analysis.education.map((edu, idx) => (
                                            <li
                                                key={idx}
                                                className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100"
                                            >
                                                {edu}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-xs text-slate-400 italic">None detected.</li>
                                    )}
                                </ul>
                            </div>

                            {/* Projects */}
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 text-purple-700">
                                    <FolderKanban size={18} />
                                    <h3 className="font-bold text-sm">Projects</h3>
                                </div>
                                <ul className="space-y-3">
                                    {analysis.projects?.length ? (
                                        analysis.projects.map((proj, idx) => (
                                            <li
                                                key={idx}
                                                className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100"
                                            >
                                                {proj}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-xs text-slate-400 italic">None detected.</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Next Steps CTA */}
                        <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h4 className="text-lg font-bold">What to do next?</h4>
                                <p className="text-xs text-slate-300 mt-1 max-w-lg">
                                    Now that your resume is parsed, compare your competencies against
                                    target jobs or check recommended learning pathways.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <Link
                                    to="/job-recommendations"
                                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                                >
                                    Check Job Compatibility
                                </Link>
                                <Link
                                    to="/courses"
                                    className="rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
                                >
                                    View Courses
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
