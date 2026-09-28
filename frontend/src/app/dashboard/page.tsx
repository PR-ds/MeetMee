"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HintNotesViewer } from "@/components/HintNotesViewer";
import { PodcastPlayer } from "@/components/PodcastPlayer";
import { ComicViewer } from "@/components/ComicViewer";
import { 
  FileText, 
  Headphones, 
  Palette, 
  Video, 
  Clock, 
  Calendar, 
  CheckCircle2 
} from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"notes" | "podcast" | "comic">("notes");
  const [selectedMeeting, setSelectedMeeting] = useState({
    id: "demo-meeting-123",
    title: "Sprint Architecture & Q3 Review",
    date: "September 28, 2026",
    duration: "45 mins",
    platform: "Google Meet"
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Meetings & Intelligence Hub
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Browse recorded sessions, hint-style notes, multilingual podcasts, and visual comic strips.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Bot Status: Cloud Active
            </span>
          </div>
        </div>

        {/* Selected Meeting Context Banner */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{selectedMeeting.title}</h2>
                <span className="rounded bg-blue-500/20 text-blue-300 text-[10px] font-semibold px-2 py-0.5 border border-blue-500/30">
                  {selectedMeeting.platform}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {selectedMeeting.date}</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {selectedMeeting.duration}</span>
              </div>
            </div>
          </div>

          {/* Artifact Tabs Selector */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "notes"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Hint Notes
            </button>
            <button
              onClick={() => setActiveTab("podcast")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "podcast"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Headphones className="h-3.5 w-3.5" />
              Podcast
            </button>
            <button
              onClick={() => setActiveTab("comic")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "comic"
                  ? "bg-pink-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              Comic Strip
            </button>
          </div>
        </div>

        {/* Tab Views */}
        <div className="mt-6">
          {activeTab === "notes" && (
            <HintNotesViewer meetingId={selectedMeeting.id} title={selectedMeeting.title} />
          )}
          {activeTab === "podcast" && (
            <PodcastPlayer />
          )}
          {activeTab === "comic" && (
            <ComicViewer />
          )}
        </div>

      </main>
    </div>
  );
}
