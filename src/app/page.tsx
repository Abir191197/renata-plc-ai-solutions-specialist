"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Key,
  RotateCcw,
  FileText,
  ChevronRight,
  Shield,
  Bot,
  User,
  Sparkles,
  BookmarkCheck,
  Check,
  Copy,
  Info,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  citation?: string;
  content: string;
}

const POLICY_SECTIONS = [
  { id: "s1", title: "1. Purpose", desc: "Objectives of the leave policy", prompt: "What is the purpose of this leave policy?" },
  { id: "s2", title: "2. Scope & Eligibility", desc: "Probation & contract staff", prompt: "Can probation employees take casual leave?" },
  { id: "s3", title: "3. Leave Year", desc: "1 Jan to 31 Dec calendar", prompt: "When does the leave year start and end?" },
  { id: "s4", title: "4. Types of Leave", desc: "Annual, Casual, Sick rules", prompt: "What are all the leave entitlements and days per year?" },
  { id: "s5", title: "5. Weekly Holidays", desc: "Friday & Saturday rules", prompt: "What are the weekly holidays and do they count in annual leave?" },
  { id: "s6", title: "6. Applying for Leave", desc: "PeopleHub portal & 2-day SLA", prompt: "How do I apply for leave and how long does a manager have to approve?" },
  { id: "s7", title: "7. Notice Period Leave", desc: "Restrictions during notice", prompt: "Can I take annual or casual leave during my notice period?" },
  { id: "s8", title: "8. Unauthorised Absence", desc: "Show-cause & LWP rules", prompt: "What happens if someone is absent without approval for more than 3 days?" },
  { id: "s9", title: "9. Confidentiality", desc: "Strict privacy safeguards", prompt: "Who is allowed to access an employee's leave records?" },
  { id: "s10", title: "10. Roles & Responsibilities", desc: "Employee, Manager, HR", prompt: "What are the manager's responsibilities for leave requests?" },
  { id: "s11", title: "11. Contact & Review", desc: "Annual review & HR email", prompt: "What is the HR email to contact regarding leave questions?" },
];

function extractCitation(rawText: string): { content: string; citation?: string } {
  // Look for patterns like "Reference: Section X...", "(Section X...)", "According to Section X..."
  const lines = rawText.split("\n");
  const lastLine = lines[lines.length - 1].trim();

  if (lastLine.toLowerCase().startsWith("reference:") || lastLine.toLowerCase().startsWith("source:")) {
    const citation = lastLine.replace(/^(reference:|source:)/i, "").trim();
    const content = lines.slice(0, lines.length - 1).join("\n").trim();
    return { content, citation };
  }

  // Also check if citation is in parentheses at the very end
  const match = rawText.match(/\((Section\s+[\d\.\w\(\)]+[^)]*)\)\.?\s*$/i);
  if (match) {
    const citation = match[1];
    return { content: rawText, citation };
  }

  return { content: rawText };
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello. I am your HR Policy Assistant for XYZ Company.\n\nI can answer questions regarding our Leave Policy (HR-POL-004 v2.0), including leave entitlements, application rules, and approval timelines. Every answer is verified against the official policy.\n\nHow may I help you today?",
      content: "Hello. I am your HR Policy Assistant for XYZ Company.\n\nI can answer questions regarding our Leave Policy (HR-POL-004 v2.0), including leave entitlements, application rules, and approval timelines. Every answer is verified against the official policy.\n\nHow may I help you today?",
      timestamp: "Just now",
      citation: "HR-POL-004 v2.0",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      content: text,
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

      const { content, citation } = extractCitation(data.reply);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: data.reply,
        content,
        citation,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: `Error: ${err.message || "An unexpected error occurred. Please try again."}`,
        content: `Error: ${err.message || "An unexpected error occurred. Please try again."}`,
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
        text: "Hello. I am your HR Policy Assistant for XYZ Company.\n\nI can answer questions regarding our Leave Policy (HR-POL-004 v2.0), including leave entitlements, application rules, and approval timelines. Every answer is verified against the official policy.\n\nHow may I help you today?",
        content: "Hello. I am your HR Policy Assistant for XYZ Company.\n\nI can answer questions regarding our Leave Policy (HR-POL-004 v2.0), including leave entitlements, application rules, and approval timelines. Every answer is verified against the official policy.\n\nHow may I help you today?",
        timestamp: "Just now",
        citation: "HR-POL-004 v2.0",
      },
    ]);
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-slate-800 font-sans overflow-hidden">
      {/* LEFT SIDEBAR: Corporate Index */}
      <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 hidden md:flex">
        {/* Brand */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <Bot className="w-5 h-5 text-slate-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-slate-900 tracking-tight">XYZ Company</span>
                <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                  Bot Desk
                </span>
              </div>
              <p className="text-xs text-slate-400">HR Leave Knowledge Base</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Policy:</span>
              <span className="font-mono text-slate-800 font-medium">HR-POL-004</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Effective:</span>
              <span className="text-slate-700">1 Jan 2026 (v2.0)</span>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <Shield className="w-3 h-3" /> Section 9 Active
              </span>
              <span>11 Sections Indexed</span>
            </div>
          </div>
        </div>

        {/* Policy Index List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
            Browse Policy Sections
          </div>
          {POLICY_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => sendMessage(sec.prompt)}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-between group border border-transparent hover:border-slate-200"
            >
              <div className="pr-2">
                <div className="text-xs font-semibold text-slate-700 group-hover:text-slate-950 transition-colors">
                  {sec.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[190px]">{sec.desc}</div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-700 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-slate-500" />
            <span>{savedKey ? "API Key Configured" : "Custom Key"}</span>
          </button>
          <button
            onClick={resetChat}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN PANEL: Clean Professional Bot Chat */}
      <div className="flex-1 flex flex-col h-full bg-[#F9FAFB]">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                HR Policy Bot Desk
              </h2>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 hidden sm:inline">
              Verified Ground Truth
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowKeyModal(true)}
              className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors md:hidden"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetChat}
              className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors font-medium flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Reset Chat</span>
            </button>
          </div>
        </header>

        {/* Suggested Queries Bar */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/80 px-6 py-2.5 shrink-0">
          <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0">Quick Test:</span>
            <button
              onClick={() => sendMessage("Can I take 3 consecutive days of casual leave?")}
              className="text-xs bg-slate-100/80 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full transition-colors shrink-0 font-medium"
            >
              3 Days Casual Leave (Req 1)
            </button>
            <button
              onClick={() => sendMessage("Does XYZ Company offer study leave for master's degree exams?")}
              className="text-xs bg-slate-100/80 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full transition-colors shrink-0 font-medium"
            >
              Study Leave Policy (Req 2)
            </button>
            <button
              onClick={() => sendMessage("How many leave days has Rahim taken and why is he absent?")}
              className="text-xs bg-slate-100/80 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full transition-colors shrink-0 font-medium"
            >
              Rahim's Record Inquiry (Req 3)
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 max-w-3xl w-full mx-auto">
          {messages.map((m) => {
            const isUser = m.sender === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} items-start`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-semibold shadow-sm ${
                    isUser
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-700 border border-slate-200"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-slate-700" />}
                </div>

                {/* Message Content Container */}
                <div
                  className={`flex flex-col max-w-[85%] ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1 px-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-700">
                      {isUser ? "You" : "HR Policy Bot"}
                    </span>
                    <span>•</span>
                    <span>{m.timestamp}</span>
                  </div>

                  {/* Bubble */}
                  <div
                    className={`rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-line shadow-sm relative group ${
                      isUser
                        ? "bg-slate-900 text-white rounded-tr-none font-normal"
                        : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-none font-normal"
                    }`}
                  >
                    {m.content}

                    {/* Dedicated Section Citation Card (clean, professional highlight) */}
                    {!isUser && m.citation && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <BookmarkCheck className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-[11px] text-slate-400">Reference:</span>
                          <span className="text-slate-800 font-semibold">{m.citation}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(m.id, m.text)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700 p-1"
                          title="Copy response"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing State */}
          {loading && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-white text-slate-700 border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4 text-slate-600" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-500 shadow-sm flex items-center space-x-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse delay-100"></span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse delay-200"></span>
                <span className="ml-2 font-medium text-slate-600">Consulting Policy HR-POL-004...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 border border-slate-200 rounded-2xl p-2 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all bg-slate-50/50">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask an HR policy question (e.g. sick certificate rules, maternity leave notice)..."
                disabled={loading}
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400 resize-none px-2 max-h-32 py-1"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white rounded-xl px-4 py-2 transition-all flex items-center justify-center shrink-0 text-xs font-semibold shadow-sm"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                <span>Send</span>
              </button>
            </div>

            <div className="flex justify-between items-center mt-2 px-1 text-[11px] text-slate-400">
              <span>Answers cite official policy sections. Colleague records protected under Section 9.</span>
              <span className="hidden sm:inline">Press Enter to send</span>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluator API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-none z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full p-6 text-slate-800">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <Key className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Configure Gemini API Key</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              If running without a server-side <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded">.env.local</code>, enter a Google Gemini API key below. It will remain in this browser session.
            </p>

            <input
              type="password"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl p-2.5 mb-4 text-slate-900 outline-none focus:border-slate-500"
            />

            <div className="flex items-center justify-end space-x-2 text-xs">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
