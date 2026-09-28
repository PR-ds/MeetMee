"use client";

import React, { useState } from "react";
import { CheckCircle2, Lightbulb, Clock, Mail, Check } from "lucide-react";

interface HintNotesViewerProps {
  meetingId?: string;
  title?: string;
}

export function HintNotesViewer({ 
  meetingId = "demo-meeting-123", 
  title = "Sprint Architecture Review" 
}: HintNotesViewerProps) {
  const [emailSent, setEmailSent] = useState(false);

  const tldr = [
    "Autonomous bot ingestion deployed on independent server instances to guarantee offline transcription resilience.",
    "Sub-two-second latency SLA benchmarked and achieved for real-time mentor Q&A HUD.",
    "Approved NotebookLM-style bilingual podcast and 4-panel visual comic strip transformation pipelines."
  ];

  const hints = [
    {
      topic: "Offline Resilience Pattern",
      hint: "Decouple bot WebRTC connection from user client state. If client drops Wi-Fi, bot remains in call uninterrupted."
    },
    {
      topic: "Phonetic Name Matching",
      hint: "Utilize Double Metaphone + Jaro-Winkler distance threshold (0.85) to catch accented pronunciations of user name."
    },
    {
      topic: "Grounded RAG Threshold",
      hint: "Require >= 0.72 cosine similarity on transcript vector chunks to strictly eliminate LLM hallucination in live answers."
    }
  ];

  const actionItems = [
    { task: "Deploy Recall.ai bot handler to AWS ECS container pool", owner: "Alex Chen", deadline: "Friday 5 PM" },
    { task: "Integrate ElevenLabs Multilingual v2 voice cloning pairs", owner: "Sarah Lin", deadline: "Next Monday" },
    { task: "Configure Resend transactional email template for hint delivery", owner: "DevOps", deadline: "Wednesday" }
  ];

  const handleSendEmail = async () => {
    try {
      await fetch(`http://localhost:8000/api/v1/summaries/${meetingId}/send-email`, {
        method: "POST"
      });
    } catch {
      // Local demo fallback
    }
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📝</span> Hint-Style Meeting Notes
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-generated within 60s of meeting end for <span className="text-slate-200">{title}</span>
          </p>
        </div>
        <button
          onClick={handleSendEmail}
          className="flex items-center gap-2 rounded-xl bg-blue-600/20 border border-blue-500/30 px-3.5 py-1.5 text-xs font-semibold text-blue-400 hover:bg-blue-600 hover:text-white transition-all"
        >
          {emailSent ? <Check className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
          {emailSent ? "Dispatched to Email!" : "Re-send to Inbox"}
        </button>
      </div>

      {/* 60-Second TL;DR */}
      <div className="mt-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          🎯 60-Second Executive TL;DR
        </h4>
        <ul className="mt-2.5 space-y-2">
          {tldr.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Concept Anchors & Hints */}
      <div className="mt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          💡 Concept Anchors & Hints
        </h4>
        <div className="mt-2.5 grid grid-cols-1 md:grid-cols-3 gap-3">
          {hints.map((hint, idx) => (
            <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 hover:border-slate-700 transition-colors">
              <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                {hint.topic}
              </span>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                {hint.hint}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <div className="mt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          📋 Action Items & Ownership Matrix
        </h4>
        <div className="mt-2.5 overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-2.5 font-medium">Task Deliverable</th>
                <th className="px-4 py-2.5 font-medium">Owner</th>
                <th className="px-4 py-2.5 font-medium">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {actionItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-slate-200">{item.task}</td>
                  <td className="px-4 py-2.5 text-slate-400">{item.owner}</td>
                  <td className="px-4 py-2.5 text-rose-400 font-medium flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {item.deadline}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
