"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { LiveHUD } from "@/components/LiveHUD";
import { 
  Radio, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Video, 
  WifiOff, 
  BellRing, 
  FileText, 
  Headphones, 
  Palette 
} from "lucide-react";

export default function Home() {
  const [meetingUrl, setMeetingUrl] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingUrl) return;

    setIsJoining(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/meetings/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meeting_url: meetingUrl,
          title: meetingTitle || "Live Architecture Review",
          user_id: "demo-user-123"
        })
      });
      if (res.ok) {
        setJoinSuccess(true);
      }
    } catch {
      // Local demo fallback
      setJoinSuccess(true);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/25 via-slate-950/0 to-slate-950 pointer-events-none" />

          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Value Prop & Join Form */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 mb-6">
                  <Sparkles className="h-3.5 w-3.5" />
                  Next-Gen Corporate & Academic Meeting Intelligence
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  Meet<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Mee</span>
                </h1>
                <p className="mt-4 text-xl font-medium text-slate-300 leading-snug">
                  Your autonomous meeting assistant that attends calls even when you go offline, whispers answers when mentors ask questions, and turns transcripts into multilingual podcasts & comics.
                </p>

                {/* Quick Join Meeting Form */}
                <form onSubmit={handleJoin} className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <Video className="h-4 w-4 text-blue-400" />
                    Paste Meeting Link to Dispatch Bot
                  </div>

                  <div className="space-y-3">
                    <input
                      type="url"
                      required
                      value={meetingUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      placeholder="https://zoom.us/j/..., https://meet.google.com/..., or Teams"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />

                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={meetingTitle}
                        onChange={(e) => setMeetingTitle(e.target.value)}
                        placeholder="Meeting Title (optional, e.g. Q3 Sprint Review)"
                        className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isJoining}
                        className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2 shrink-0"
                      >
                        {isJoining ? "Connecting..." : "Dispatch Bot"}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {joinSuccess && (
                    <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300 flex items-center gap-2">
                      <Radio className="h-4 w-4 animate-pulse" />
                      MeetMee AI Assistant dispatched! The bot is joining the audio room.
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Bot records on secure cloud infrastructure — persists if you lose Wi-Fi.</span>
                  </div>
                </form>
              </div>

              {/* Right Column: Live Interactive HUD Demo */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                  Live HUD Companion Demo
                </div>
                <LiveHUD meetingTitle={meetingTitle || "Architecture Review & Q3 Sprint"} />
              </div>

            </div>
          </div>
        </section>

        {/* 6 Non-Negotiable Features Grid */}
        <section className="py-16 border-t border-slate-800 bg-slate-900/30">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Core Non-Negotiable Features
              </h2>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-white">
                Everything Corporate Employees & Students Need
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Feature 1 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-slate-700 transition-all">
                <div className="h-10 w-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4">
                  <WifiOff className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">1. Offline-Resilient Bot Attendance</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Paste a link to Zoom, Meet, or Teams. The bot joins and records even if your computer goes to sleep or you lose internet.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-slate-700 transition-all">
                <div className="h-10 w-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-4">
                  <BellRing className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">2. Real-Time Name Alerts</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Phonetic matching alerts you immediately with sound chimes and visual pulses when a mentor or host addresses you directly.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-slate-700 transition-all">
                <div className="h-10 w-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">3. Post-Meeting Email Summaries</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Delivers hint-style notes, concept anchors, and an action item matrix straight to your email within 60s of meeting end.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-slate-700 transition-all">
                <div className="h-10 w-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-4">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">4. Context-Aware Q&A Pop-up</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  When a mentor asks a question, MeetMee streams a grounded 2-bullet suggested answer with citations in under 2 seconds.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-slate-700 transition-all">
                <div className="h-10 w-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4">
                  <Headphones className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">5. Multilingual Podcasts</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Converts transcripts into a 2-host conversational podcast (NotebookLM style) narrated in your mother tongue with music stems.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-slate-700 transition-all">
                <div className="h-10 w-10 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center mb-4">
                  <Palette className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">6. 4-Panel Visual Comic Strips</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Transforms dry discussions into a visual comic strip storyboard with character speech bubbles and downloadable PNG exports.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>MeetMee Meeting Intelligence Platform • Open Source on <a href="https://github.com/PR-ds/MeetMee.git" className="text-blue-400 hover:underline">GitHub</a></p>
      </footer>
    </div>
  );
}
