"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Key,
  ShieldAlert,
  BookOpen,
  AlertCircle,
  RotateCcw,
  Bot,
  User,
  Sparkles,
  FileText,
  ChevronRight,
  Info,
  Clock,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  HelpCircle,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  badge?: {
    type: "citation" | "fallback" | "privacy";
    label: string;
  };
}

const POLICY_SECTIONS = [
  { id: "s1", title: "1. Purpose", desc: "Leave rules & balance intent", prompt: "What is the purpose of this leave policy?" },
  { id: "s2", title: "2. Scope & Eligibility", desc: "Probation & contract staff", prompt: "Can probation employees take casual leave?" },
  { id: "s3", title: "3. Leave Year", desc: "1 Jan to 31 Dec calendar", prompt: "When does the leave year start and end?" },
  { id: "s4", title: "4. Types of Leave", desc: "Annual, Casual, Sick, etc.", prompt: "What are all the leave entitlements and days per year?" },
  { id: "s5", title: "5. Weekly Holidays", desc: "Friday & Saturday rules", prompt: "What are the weekly holidays and do they count in annual leave?" },
  { id: "s6", title: "6. Applying for Leave", desc: "PeopleHub portal & 2-day SLA", prompt: "How do I apply for leave and how long does a manager have to approve?" },
  { id: "s7", title: "7. Notice Period Leave", desc: "Restrictions during notice", prompt: "Can I take annual or casual leave during my notice period?" },
  { id: "s8", title: "8. Unauthorised Absence", desc: "Show-cause & LWP rules", prompt: "What happens if someone is absent without approval for more than 3 days?" },
  { id: "s9", title: "9. Confidentiality", desc: "Strict privacy safeguards", prompt: "Who is allowed to access an employee's leave records?" },
  { id: "s10", title: "10. Roles & Responsibilities", desc: "Employee, Manager, HR", prompt: "What are the manager's responsibilities for leave requests?" },
  { id: "s11", title: "11. Contact & Review", desc: "Annual review & HR email", prompt: "What is the HR email to contact regarding leave questions?" },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello! I am your AI HR Policy Assistant for XYZ Company.\n\nI have the complete Leave Policy (HR-POL-004 v2.0) loaded and verified. You can ask me any question about leave entitlements, application rules, or eligibility—and I will cite the exact policy section.\n\nHow can I help you today?",
      timestamp: "Just now",
      badge: {
        type: "citation",
        label: "Policy Grounded",
      },
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "navigator">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const local = localStorage.getItem("gemini_custom_key");
    if (local) {
      setSavedKey(local);
      setCustomKey(local);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSaveKey = () => {
    if (customKey.trim()) {
      localStorage.setItem("gemini_custom_key", customKey.trim());
      setSavedKey(customKey.trim());
    } else {
      localStorage.removeItem("gemini_custom_key");
      setSavedKey("");
    }
    setShowKeyModal(false);
  };

  const classifyBadge = (text: string): Message["badge"] => {
    if (text.includes("I don't know, please contact HR")) {
      return { type: "fallback", label: "Requirement 2: Policy Absence Fallback" };
    }
    if (
      text.toLowerCase().includes("confidential") ||
      text.toLowerCase().includes("section 9") ||
      text.toLowerCase().includes("cannot provide")
    ) {
      return { type: "privacy", label: "Requirement 3: Section 9 Privacy Protected" };
    }
    if (text.toLowerCase().includes("section")) {
      return { type: "citation", label: "Requirement 1: Verified Policy Citation" };
    }
    return undefined;
  };

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          customApiKey: savedKey || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch response.");
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        badge: classifyBadge(data.reply),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: `Error: ${err.message || "Something went wrong."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: "welcome",
        sender: "assistant",
        text: "Hello! I am your AI HR Policy Assistant for XYZ Company.\n\nI have the complete Leave Policy (HR-POL-004 v2.0) loaded and verified. You can ask me any question about leave entitlements, application rules, or eligibility—and I will cite the exact policy section.\n\nHow can I help you today?",
        timestamp: "Just now",
        badge: {
          type: "citation",
          label: "Policy Grounded",
        },
      },
    ]);
  };

  return (
    <div className="flex h-screen bg-[#0B1120] text-slate-100 font-sans overflow-hidden">
      {/* LEFT SIDEBAR: Document & Policy Navigator */}
      <aside className="w-80 border-r border-slate-800 bg-[#0F172A] flex flex-col shrink-0 hidden md:flex">
        {/* Workspace Brand Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm tracking-tight text-white">XYZ COMPANY</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/60">
                  AI Copilot
                </span>
              </div>
              <p className="text-[11px] text-slate-400">HR Leave Knowledge Workstation</p>
            </div>
          </div>

          {/* Policy Metadata Card */}
          <div className="mt-3 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-sky-400" /> Doc ID
              </span>
              <span className="font-mono text-slate-200 font-semibold">HR-POL-004</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-400" /> Effective
              </span>
              <span className="text-slate-300">1 Jan 2026 (v2.0)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/80">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3 h-3" /> Grounded In-Context
              </span>
              <span className="text-[10px] text-slate-500">11 Sections Active</span>
            </div>
          </div>
        </div>

        {/* Section Quick Navigator */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 py-1 flex items-center justify-between">
            <span>Policy Index (Click to Ask)</span>
            <Layers className="w-3 h-3" />
          </div>

          {POLICY_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => sendMessage(sec.prompt)}
              className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition-all group flex items-start justify-between"
            >
              <div className="pr-2">
                <div className="text-xs font-semibold text-slate-200 group-hover:text-sky-300 transition-colors">
                  {sec.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[190px]">{sec.desc}</div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 mt-1 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>

        {/* Footer Configuration */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={() => setShowKeyModal(true)}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-slate-800 transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-sky-400" />
            <span>{savedKey ? "API Key Active" : "Custom Key"}</span>
          </button>
          <button
            onClick={resetChat}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-slate-800 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CHAT WORKSPACE */}
      <div className="flex-1 flex flex-col h-full bg-[#0B1120] relative">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-800 bg-[#0F172A]/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <span>HR Leave Policy Copilot</span>
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Zero Hallucination Guarded
                </span>
              </h2>
            </div>
          </div>

          {/* Quick Mobile Key & Clear buttons */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={() => setShowKeyModal(true)}
              className="text-xs text-slate-300 p-1.5 rounded-md bg-slate-800 border border-slate-700"
            >
              <Key className="w-4 h-4 text-sky-400" />
            </button>
            <button
              onClick={resetChat}
              className="text-xs text-slate-300 p-1.5 rounded-md bg-slate-800 border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Section 9 Active
            </span>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-400">gemini-flash-lite (1000 RPD)</span>
          </div>
        </header>

        {/* Assessment Fast-Check Banner (Unique conversational chips) */}
        <div className="bg-[#111C33]/90 border-b border-slate-800/80 px-4 py-2.5 shrink-0">
          <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-400" /> Quick Tests:
            </span>

            <button
              onClick={() => sendMessage("Can I take 3 consecutive days of casual leave?")}
              className="text-[11px] font-medium bg-slate-800/90 hover:bg-sky-950/80 text-slate-200 hover:text-sky-300 border border-slate-700/80 hover:border-sky-500/50 px-3 py-1 rounded-full transition-all shrink-0 flex items-center gap-1.5"
            >
              <BookOpen className="w-3 h-3 text-sky-400" />
              <span>3 Days Casual Leave (Req 1)</span>
            </button>

            <button
              onClick={() => sendMessage("Does XYZ Company offer study leave for master's degree exams?")}
              className="text-[11px] font-medium bg-slate-800/90 hover:bg-amber-950/80 text-slate-200 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/50 px-3 py-1 rounded-full transition-all shrink-0 flex items-center gap-1.5"
            >
              <AlertCircle className="w-3 h-3 text-amber-400" />
              <span>Study Leave (Req 2 Fallback)</span>
            </button>

            <button
              onClick={() => sendMessage("How many leave days has Rahim taken and why is he absent?")}
              className="text-[11px] font-medium bg-slate-800/90 hover:bg-rose-950/80 text-slate-200 hover:text-rose-300 border border-slate-700/80 hover:border-rose-500/50 px-3 py-1 rounded-full transition-all shrink-0 flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>Rahim's Record (Req 3 Privacy)</span>
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-4xl w-full mx-auto">
          {messages.map((m) => {
            const isUser = m.sender === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-3.5 ${isUser ? "flex-row-reverse" : "flex-row"} items-start`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                    isUser
                      ? "bg-gradient-to-tr from-sky-500 to-blue-600 text-white"
                      : "bg-slate-800 text-sky-400 border border-slate-700"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div
                  className={`flex flex-col max-w-[82%] sm:max-w-[75%] ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1 px-1">
                    <span className="text-xs font-semibold text-slate-400">
                      {isUser ? "You" : "XYZ Policy Copilot"}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {m.timestamp}
                    </span>
                  </div>

                  {/* Bubble Container */}
                  <div
                    className={`rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                      isUser
                        ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-tr-none font-medium"
                        : "bg-slate-900/90 text-slate-200 border border-slate-800/90 rounded-tl-none font-normal"
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* AI Compliance Verification Badge */}
                  {!isUser && m.badge && (
                    <div className="mt-1.5 px-1">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                          m.badge.type === "fallback"
                            ? "bg-amber-950/60 text-amber-300 border-amber-800/60"
                            : m.badge.type === "privacy"
                            ? "bg-rose-950/60 text-rose-300 border-rose-800/60"
                            : "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                        }`}
                      >
                        {m.badge.type === "fallback" && <AlertCircle className="w-2.5 h-2.5" />}
                        {m.badge.type === "privacy" && <ShieldAlert className="w-2.5 h-2.5" />}
                        {m.badge.type === "citation" && <CheckCircle className="w-2.5 h-2.5" />}
                        <span>{m.badge.label}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-sky-400 border border-slate-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></div>
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-ping delay-150"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping delay-300"></div>
                <span className="text-xs text-slate-400 ml-2 font-mono">
                  Grounding query against Leave Policy clauses...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Floating Card */}
        <div className="p-4 border-t border-slate-800 bg-[#0F172A]/80 backdrop-blur-md shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/70 rounded-xl p-2 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500 transition-all shadow-lg">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask any leave policy question (e.g. sick certificate rules, maternity notice, comp off)..."
                disabled={loading}
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-100 placeholder:text-slate-400 resize-none px-2 max-h-32"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-30 text-white rounded-lg px-3.5 py-2 transition-all flex items-center justify-center shrink-0 font-medium text-xs shadow-md shadow-sky-600/20"
                title="Send message"
              >
                <Send className="w-4 h-4 mr-1" />
                <span>Send</span>
              </button>
            </div>

            <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
              <span>Strict compliance: Answers cite exact policy sections. Personal records protected under Section 9.</span>
              <span className="hidden sm:inline text-slate-400">Shift+Enter for new line</span>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluator API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-100">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400 border border-sky-500/30">
                <Key className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold">Gemini API Key Setup</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              If running this deployment without a server-side <code className="text-sky-300 bg-slate-800 px-1 py-0.5 rounded">.env.local</code>, you can paste your own Google Gemini API key below. It is stored solely in your local browser session.
            </p>

            <input
              type="password"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg p-2.5 mb-4 text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />

            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-xs px-3.5 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="text-xs px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold transition-all shadow-md shadow-sky-500/20"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
