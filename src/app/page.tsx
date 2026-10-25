"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Key, ShieldAlert, BookOpen, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Welcome to the Renata HR Leave Policy Assistant. You can ask any question regarding XYZ Company's Leave Policy (HR-POL-004), including leave entitlements, approval workflows, and rules. How can I help you today?",
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
        text: `Error: ${err.message || "Something went wrong."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        text: "Welcome to the Renata HR Leave Policy Assistant. You can ask any question regarding XYZ Company's Leave Policy (HR-POL-004), including leave entitlements, approval workflows, and rules. How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-[#00569B] text-white px-6 py-4 shadow-sm border-b border-blue-900/40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xl tracking-wider border border-white/20">
              R
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-semibold tracking-tight">RENATA PLC</h1>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-800/80 text-blue-100 font-medium border border-blue-700">
                  HR Portal
                </span>
              </div>
              <p className="text-xs text-blue-100/80">Leave Policy Knowledge Assistant (HR-POL-004 v2.0)</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowKeyModal(true)}
              className="text-xs flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors border border-white/20 text-white"
              title="Configure API Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{savedKey ? "API Key Configured" : "Custom API Key"}</span>
            </button>
            <button
              onClick={resetChat}
              className="text-xs flex items-center space-x-1 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors border border-white/20 text-white"
              title="Reset conversation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 flex flex-col overflow-hidden">
        {/* Assessment Requirements Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 mb-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Assessment Test Prompts</span>
            <span className="text-[11px] text-slate-400 font-normal">Click any button to test live</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => sendMessage("Can I take 3 consecutive days of casual leave?")}
              className="text-left text-xs p-2.5 rounded-lg border border-slate-200 hover:border-[#00569B] bg-slate-50/70 hover:bg-blue-50/40 transition-all flex items-start space-x-2 text-slate-700"
            >
              <BookOpen className="w-4 h-4 text-[#00569B] mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-slate-900 block">Req 1: Policy Answer & Citation</span>
                <span className="text-slate-500 text-[11px]">"Can I take 3 days casual leave?"</span>
              </div>
            </button>

            <button
              onClick={() => sendMessage("Does XYZ Company offer study leave for master's degree exams?")}
              className="text-left text-xs p-2.5 rounded-lg border border-slate-200 hover:border-amber-500 bg-slate-50/70 hover:bg-amber-50/40 transition-all flex items-start space-x-2 text-slate-700"
            >
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-slate-900 block">Req 2: Policy Absence Fallback</span>
                <span className="text-slate-500 text-[11px]">"Does company offer study leave?"</span>
              </div>
            </button>

            <button
              onClick={() => sendMessage("How many leave days has Rahim taken and why is he absent?")}
              className="text-left text-xs p-2.5 rounded-lg border border-slate-200 hover:border-rose-500 bg-slate-50/70 hover:bg-rose-50/40 transition-all flex items-start space-x-2 text-slate-700"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-slate-900 block">Req 3: Privacy Data Protection</span>
                <span className="text-slate-500 text-[11px]">"How many leaves has Rahim taken?"</span>
              </div>
            </button>
          </div>
        </div>

        {/* Chat Message List */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-4 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === "user";
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center space-x-2 mb-1 px-1">
                  <span className="text-xs font-medium text-slate-500">
                    {isUser ? "You" : "Renata HR Assistant"}
                  </span>
                  <span className="text-[11px] text-slate-400">{m.timestamp}</span>
                </div>
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? "bg-[#00569B] text-white rounded-br-none"
                      : "bg-slate-100 text-slate-800 border border-slate-200/80 rounded-bl-none whitespace-pre-line"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex flex-col items-start">
              <div className="text-xs font-medium text-slate-500 mb-1 px-1">Renata HR Assistant</div>
              <div className="bg-slate-100 border border-slate-200 rounded-xl rounded-bl-none px-4 py-3 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#00569B] animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-[#00569B] animate-pulse delay-150"></div>
                <div className="w-2 h-2 rounded-full bg-[#00569B] animate-pulse delay-300"></div>
                <span className="text-xs text-slate-500 ml-2">Consulting HR policy...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="mt-3">
          <div className="flex items-center space-x-2 bg-white border border-slate-300 rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-[#00569B] focus-within:border-transparent transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask an HR leave policy question (e.g., notice period leave, sick absence rule)..."
              disabled={loading}
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="bg-[#00569B] hover:bg-blue-800 disabled:opacity-40 text-white rounded-lg p-2 transition-all flex items-center justify-center shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 text-center">
            Replies are strictly grounded in XYZ Company Leave Policy (HR-POL-004). Individual employee records are strictly confidential.
          </p>
        </div>
      </main>

      {/* API Key Modal for Evaluators */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-1 flex items-center space-x-2">
              <Key className="w-4 h-4 text-[#00569B]" />
              <span>Configure Gemini API Key</span>
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              If running this app without a configured server <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">.env.local</code> file, you can paste your own Google Gemini API key below. It stays in your browser's local memory.
            </p>

            <input
              type="password"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 mb-4 outline-none focus:ring-2 focus:ring-[#00569B]"
            />

            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-xs px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="text-xs px-4 py-2 rounded-lg bg-[#00569B] hover:bg-blue-800 text-white font-medium"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
