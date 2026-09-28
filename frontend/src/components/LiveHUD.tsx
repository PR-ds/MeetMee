"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  HelpCircle, 
  Copy, 
  Check, 
  Sparkles, 
  Volume2, 
  ExternalLink,
  Send,
  Radio
} from "lucide-react";

interface LiveHUDProps {
  meetingId?: string;
  meetingTitle?: string;
}

export function LiveHUD({ 
  meetingId = "demo-meeting-123", 
  meetingTitle = "Sprint Architecture & Q3 Review" 
}: LiveHUDProps) {
  const [copied, setCopied] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [activeAlert, setActiveAlert] = useState<string | null>(
    "Alex! Could you clarify our p95 streaming latency SLA?"
  );
  const [suggestedAnswer, setSuggestedAnswer] = useState<string>(
    "120ms p95 latency on streaming Deepgram audio chunks. Target was finalized during the architecture sync."
  );
  const [citation, setCitation] = useState<string>("Mentioned by Lead Architect at 12:40");
  const [simulatedInput, setSimulatedInput] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  // Play audio chime simulation
  const triggerChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(528, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // AudioContext not allowed without gesture
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestedAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedInput.trim()) return;

    setIsSimulating(true);
    setPulse(true);
    triggerChime();

    try {
      const res = await fetch("http://localhost:8000/api/v1/meetings/demo-meeting-123/simulate-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meeting_id: meetingId,
          question: simulatedInput,
          speaker_name: "Mentor (Prof. Harrison)"
        })
      });
      const data = await res.json();
      setActiveAlert(simulatedInput);
      setSuggestedAnswer(data.suggested_answer || "Context derived: Sub-2-second target agreed for real-time mentor Q&A HUD.");
      setCitation("Live context match from meeting transcript");
    } catch {
      // Local fallback
      setActiveAlert(simulatedInput);
      setSuggestedAnswer("120ms p95 latency. Discussed at minute 14:15 during Architecture review.");
      setCitation("Local context match");
    } finally {
      setIsSimulating(false);
      setSimulatedInput("");
      setTimeout(() => setPulse(false), 3000);
    }
  };

  return (
    <div className={`w-full max-w-lg rounded-2xl border border-blue-500/40 bg-slate-900/95 p-5 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 ${pulse ? 'ring-4 ring-blue-500/60 shadow-blue-500/30' : ''}`}>
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            MeetMee Live HUD
          </span>
        </div>
        <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-400">
          Always-on-Top
        </span>
      </div>

      <div className="mt-3 text-xs text-slate-400">
        Active Meeting: <span className="font-medium text-slate-200">{meetingTitle}</span>
      </div>

      {/* Real-time Alert Box */}
      {activeAlert && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5">
          <div className="flex items-center gap-2 text-amber-400">
            <Bell className="h-4 w-4 animate-bounce" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Mentor Addressed You Directly
            </span>
          </div>
          <p className="mt-1.5 text-sm font-medium text-amber-100">
            &ldquo;{activeAlert}&rdquo;
          </p>
        </div>
      )}

      {/* Suggested Answer Card */}
      <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-950/40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-400">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Context-Aware Suggested Answer
            </span>
          </div>
          <span className="text-[11px] text-blue-300/80 bg-blue-900/50 px-2 py-0.5 rounded-full border border-blue-500/20">
            94% Confidence
          </span>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-slate-100">
          {suggestedAnswer}
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-blue-900/50 pt-2 text-xs text-slate-400">
          <span className="text-[11px] italic text-slate-400">{citation}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-500 active:scale-95"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Answer"}
          </button>
        </div>
      </div>

      {/* Interactive Simulation Form */}
      <form onSubmit={handleSimulateQuestion} className="mt-4 border-t border-slate-800 pt-3">
        <div className="text-[11px] font-medium text-slate-400 mb-1.5">
          🧪 Simulate Live Mentor Question:
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={simulatedInput}
            onChange={(e) => setSimulatedInput(e.target.value)}
            placeholder="e.g. Alex, what is the database schema plan?"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSimulating}
            className="flex items-center gap-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
          >
            <Send className="h-3 w-3" />
            Test
          </button>
        </div>
      </form>
    </div>
  );
}
