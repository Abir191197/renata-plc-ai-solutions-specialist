"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Key,
  RotateCcw,
  FileText,
  ChevronRight,
  Clock,
  Building,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
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

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello. I am the internal HR Leave Policy Assistant for XYZ Company.\n\nYou can inquire about any leave rules, entitlement balances, application steps, or notice period conditions under Policy HR-POL-004 v2.0.\n\nHow may I assist you?",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
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
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: `Error: ${err.message || "An unexpected error occurred. Please try again."}`,
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
        text: "Hello. I am the internal HR Leave Policy Assistant for XYZ Company.\n\nYou can inquire about any leave rules, entitlement balances, application steps, or notice period conditions under Policy HR-POL-004 v2.0.\n\nHow may I assist you?",
        timestamp: "Just now",
      },
    ]);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      {/* LEFT SIDEBAR: Clean Corporate Document Browser */}
      <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 hidden md:flex">
        {/* Header */}
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white font-semibold text-xs tracking-wider">
              XYZ
            </div>
            <div>
              <h1 className="font-semibold text-sm text-slate-900 tracking-tight">XYZ Company</h1>
              <p className="text-xs text-slate-500">Employee Helpdesk Portal</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Document:</span>
              <span className="font-medium text-slate-900">HR-POL-004</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Version:</span>
              <span className="text-slate-700">2.0 (Effective Jan 2026)</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 text-[11px] text-slate-500">
              <span>Applies To:</span>
              <span>All Full-Time Staff</span>
            </div>
          </div>
        </div>

        {/* Section List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
            Policy Sections
          </div>
          {POLICY_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => sendMessage(sec.prompt)}
              className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100/80 transition-colors flex items-center justify-between group border border-transparent hover:border-slate-200"
            >
              <div className="pr-2">
                <div className="text-xs font-medium text-slate-800 group-hover:text-slate-950">
                  {sec.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{sec.desc}</div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 shrink-0" />
            </button>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded hover:bg-slate-200/60 transition-colors"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{savedKey ? "API Key Set" : "Configure Key"}</span>
          </button>
          <button
            onClick={resetChat}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 px-2 py-1.5 rounded hover:bg-slate-200/60 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN PANEL: Standard Corporate Helpdesk Chat */}
      <div className="flex-1 flex flex-col h-full bg-[#F8FAFC]">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Leave Policy Inquiries
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Internal Knowledge Base
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowKeyModal(true)}
              className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded border border-slate-200 hover:bg-slate-50 transition-colors md:hidden"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetChat}
              className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Clear Conversation
            </button>
          </div>
        </header>

        {/* Suggested Queries Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-2.5 shrink-0">
          <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-medium text-slate-400 shrink-0">Sample Queries:</span>
            <button
              onClick={() => sendMessage("Can I take 3 consecutive days of casual leave?")}
              className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-md transition-colors shrink-0"
            >
              Casual Leave Rule (Req 1)
            </button>
            <button
              onClick={() => sendMessage("Does XYZ Company offer study leave for master's degree exams?")}
              className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-md transition-colors shrink-0"
            >
              Study Leave Policy (Req 2)
            </button>
            <button
              onClick={() => sendMessage("How many leave days has Rahim taken and why is he absent?")}
              className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-md transition-colors shrink-0"
            >
              Colleague Record Request (Req 3)
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-3xl w-full mx-auto">
          {messages.map((m) => {
            const isUser = m.sender === "user";
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center space-x-2 mb-1 px-1 text-xs text-slate-400">
                  <span className="font-medium text-slate-600">
                    {isUser ? "You" : "HR Desk"}
                  </span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    isUser
                      ? "bg-slate-900 text-white font-normal"
                      : "bg-white text-slate-800 border border-slate-200 shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex flex-col items-start">
              <div className="text-xs text-slate-400 mb-1 px-1">HR Desk</div>
              <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-xs text-slate-500 shadow-sm flex items-center space-x-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></span>
                <span>Searching policy document...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-slate-200 bg-white shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 border border-slate-300 rounded-lg p-2 focus-within:border-slate-500 focus-within:ring-1 focus-within:ring-slate-500 transition-all bg-white">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Type a policy question (e.g. sick certificate requirements, paternity leave)..."
                disabled={loading}
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400 resize-none px-2 max-h-32"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white rounded-md px-3.5 py-2 transition-all flex items-center justify-center shrink-0 text-xs font-medium"
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                <span>Send</span>
              </button>
            </div>

            <div className="flex justify-between items-center mt-2 px-1 text-[11px] text-slate-400">
              <span>All responses are verified against Policy HR-POL-004. Press Enter to send.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluator API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-none z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg max-w-md w-full p-6 text-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Configure Gemini API Key</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              If running without a server-side <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded">.env.local</code>, enter a Google Gemini API key below. It will remain in this browser session.
            </p>

            <input
              type="password"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2.5 mb-4 text-slate-900 outline-none focus:border-slate-500"
            />

            <div className="flex items-center justify-end space-x-2 text-xs">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium"
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
