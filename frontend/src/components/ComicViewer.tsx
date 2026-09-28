"use client";

import React from "react";
import { Image as ImageIcon, Sparkles, Download, MessageSquareQuote } from "lucide-react";

export function ComicViewer() {
  const panels = [
    {
      num: 1,
      tag: "1. The Dilemma",
      character: "Alex (Developer)",
      dialogue: "“My laptop battery died and Wi-Fi dropped mid-presentation!”",
      visual: "Stressed developer in an office staring at a loading spinner on an offline screen.",
      gradient: "from-rose-950/40 to-slate-900",
      accent: "text-rose-400 border-rose-500/30"
    },
    {
      num: 2,
      tag: "2. The Brainstorm",
      character: "Sarah (Architect)",
      dialogue: "“MeetMee's autonomous cloud bot stays connected even when you disconnect.”",
      visual: "Engineers mapping out an event-driven bot infrastructure on a glowing digital board.",
      gradient: "from-amber-950/40 to-slate-900",
      accent: "text-amber-400 border-amber-500/30"
    },
    {
      num: 3,
      tag: "3. The Breakthrough",
      character: "Prof. Harrison (Mentor)",
      dialogue: "“Alex, what was our agreed streaming latency benchmark?”",
      visual: "Mentor asking question while Alex's floating HUD instantly pops up with 120ms p95 answer.",
      gradient: "from-blue-950/40 to-slate-900",
      accent: "text-blue-400 border-blue-500/30"
    },
    {
      num: 4,
      tag: "4. The Victory",
      character: "The Team",
      dialogue: "“Meeting adjourned! Summaries emailed, podcast generated, and action items locked.”",
      visual: "Satisfied team receiving instant hint-style notes and listening to dual-host podcast.",
      gradient: "from-emerald-950/40 to-slate-900",
      accent: "text-emerald-400 border-emerald-500/30"
    }
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            4-Panel Visual Comic Strip Summary
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Key meeting narrative distilled into a storyboard with AI-generated scenes & speech bubbles
          </p>
        </div>

        <button
          onClick={() => alert("Downloading Comic Strip as PNG...")}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
        >
          <Download className="h-3.5 w-3.5" />
          Export Comic (PNG)
        </button>
      </div>

      {/* 4 Comic Panels Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {panels.map((panel) => (
          <div
            key={panel.num}
            className={`flex flex-col justify-between rounded-xl border bg-gradient-to-b ${panel.gradient} ${panel.accent} p-4 transition-transform hover:-translate-y-1`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Panel #{panel.num}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${panel.accent}`}>
                  {panel.tag}
                </span>
              </div>

              {/* Visual Scene Box */}
              <div className="mt-3 flex h-32 flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-center">
                <ImageIcon className="h-6 w-6 text-slate-500 mb-1.5" />
                <p className="text-[11px] text-slate-400 italic leading-snug">
                  {panel.visual}
                </p>
              </div>

              {/* Speech Bubble */}
              <div className="mt-3 relative rounded-xl bg-slate-950 border border-slate-700/80 p-3 shadow-md">
                <div className="text-[10px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <MessageSquareQuote className="h-3 w-3 text-blue-400" />
                  {panel.character}
                </div>
                <p className="text-xs text-white font-medium leading-relaxed">
                  {panel.dialogue}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
