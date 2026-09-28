"use client";

import Link from "next/link";
import { Mic, Radio, BookOpen, ExternalLink, ShieldCheck } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/25">
            <Radio className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">
              Meet<span className="text-blue-500">Mee</span>
            </span>
            <span className="ml-2 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/20">
              AI Intelligence
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            <BookOpen className="h-4 w-4 text-slate-400" />
            Meetings & Artifacts
          </Link>
          <Link
            href="/hud"
            target="_blank"
            className="flex items-center gap-2 rounded-lg bg-blue-600/10 border border-blue-500/30 px-3 py-1.5 text-xs font-semibold text-blue-400 transition-all hover:bg-blue-600 hover:text-white"
          >
            <Mic className="h-3.5 w-3.5" />
            Launch Floating HUD
          </Link>
          <a
            href="https://github.com/PR-ds/MeetMee.git"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
