import { useState } from "react";
import {
  BotMessageSquare,
  Sparkles,
  Send,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  UserRound,
  Lightbulb,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { getUsername } from "../utils/auth";

export default function AICoach() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: `Hello ${getUsername()}! I am your AI Career Coach powered by Gemini. Ask me anything about career transitions, required skills, interview preparation, salary negotiation, or resume improvements. How can I guide you today?`,
    },
  ]);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const samplePrompts = [
    "How do I prepare for Senior Java & Spring Boot developer interviews?",
    "What are the top 5 high-demand cloud and backend skills in 2026?",
    "How can I transition into an AI/ML Engineer role from web development?",
    "Give me tips to optimize my resume for technical ATS filters.",
  ];

  const handleSend = async (userPromptText) => {
    const query = userPromptText || prompt;
    if (!query.trim()) return;

    const userMessage = { role: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await api.post("/api/ai/career-guidance", {
        prompt: query,
      });

      const guidance =
        res.data?.guidance || "I could not generate career advice at this time.";

      setMessages((prev) => [...prev, { role: "ai", text: guidance }]);
    } catch (err) {
      console.error("AI career guidance failed:", err);
      const errMsg =
        err.response?.data?.message ||
        "Failed to generate guidance from AI. Please try again.";
      toast.error(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `⚠️ Error: ${errMsg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("Advice copied to clipboard!");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        role: "ai",
        text: `Conversation cleared. What other career guidance do you need, ${getUsername()}?`,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <main className="mx-auto flex-1 w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 flex flex-col">
        {/* Banner */}
        <section className="mb-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-900/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                <BotMessageSquare size={14} />
                AI Career Consultant
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">
                Gemini AI Career Coach
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-blue-100 max-w-lg">
                Get tailored guidance on job roadmaps, tech stacks, career
                transitions, and interview strategies.
              </p>
            </div>

            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition self-start sm:self-center"
            >
              <RotateCcw size={14} />
              Reset Chat
            </button>
          </div>
        </section>

        {/* Suggested Prompts */}
        <div className="mb-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Lightbulb size={13} className="text-amber-500" />
            Quick Prompts
          </p>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                disabled={loading}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 transition shadow-2xs text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 space-y-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs overflow-y-auto min-h-[380px] max-h-[600px]">
          {messages.map((m, idx) => {
            const isAI = m.role === "ai";

            return (
              <div
                key={idx}
                className={`flex gap-3 sm:gap-4 ${
                  isAI ? "items-start" : "items-start flex-row-reverse"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-2xl shrink-0 ${
                    isAI
                      ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-slate-800 text-white"
                  }`}
                >
                  {isAI ? <Sparkles size={18} /> : <UserRound size={18} />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`group relative max-w-2xl rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                    isAI
                      ? "bg-slate-50 text-slate-800 border border-slate-100"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  <div className="whitespace-pre-wrap font-normal">
                    {m.text}
                  </div>

                  {isAI && (
                    <button
                      onClick={() => handleCopy(m.text, idx)}
                      title="Copy response"
                      className="mt-3 flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-blue-600 transition"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check size={12} className="text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white animate-pulse">
                <Sparkles size={18} />
              </div>
              <div className="rounded-2xl bg-slate-50 px-5 py-3.5 border border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Loader2 size={16} className="animate-spin text-blue-600" />
                Gemini is crafting career guidance...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mt-4 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask your AI Career Coach anything (e.g. skills gap advice, interview questions)..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm shadow-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            <span className="hidden sm:inline">Ask Coach</span>
          </button>
        </form>
      </main>
    </div>
  );
}
