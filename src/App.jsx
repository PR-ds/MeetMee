import React, { useState } from 'react';
import { 
  Radio, 
  Video, 
  Sparkles, 
  Bell, 
  CheckCircle2, 
  Headphones, 
  Palette, 
  FileText, 
  WifiOff, 
  ArrowRight, 
  Copy, 
  Check, 
  Send, 
  Globe, 
  Play, 
  Pause, 
  Volume2, 
  Mail, 
  Clock, 
  Lightbulb, 
  ExternalLink,
  ShieldCheck,
  MessageSquareQuote,
  Download,
  Bot
} from 'lucide-react';

export default function App() {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [isBotJoined, setIsBotJoined] = useState(false);
  const [activeTab, setActiveTab] = useState('hud'); // 'hud', 'notes', 'podcast', 'comic', 'bot'
  
  // Real-time HUD states
  const [copied, setCopied] = useState(false);
  const [hudPulse, setHudPulse] = useState(false);
  const [activeMentorQuestion, setActiveMentorQuestion] = useState(
    "Alex! Could you clarify what our streaming latency SLA is?"
  );
  const [suggestedAnswer, setSuggestedAnswer] = useState(
    "120ms p95 latency on streaming Deepgram audio chunks. Target was finalized during the architecture sync."
  );
  const [citation, setCitation] = useState("Discussed by Lead Architect at 12:40");
  const [customQuestionInput, setCustomQuestionInput] = useState('');
  
  // Post-meeting email state
  const [emailSent, setEmailSent] = useState(false);

  // Podcast state
  const [podcastLang, setPodcastLang] = useState('en');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(42);

  // Platform detector helper
  const detectPlatform = (url) => {
    if (url.includes('zoom.us')) return 'Zoom';
    if (url.includes('meet.google.com')) return 'Google Meet';
    if (url.includes('teams.microsoft.com') || url.includes('teams.live.com')) return 'Microsoft Teams';
    return url ? 'WebRTC Meeting' : 'Universal Link';
  };

  // Play audio chime
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      // AudioContext fallback
    }
  };

  const handleCopyAnswer = () => {
    navigator.clipboard.writeText(suggestedAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDispatchBot = (e) => {
    e.preventDefault();
    if (!meetingUrl) return;
    setIsBotJoined(true);
  };

  const handleTestQuestion = (e) => {
    e.preventDefault();
    if (!customQuestionInput.trim()) return;

    setHudPulse(true);
    playChime();
    setActiveMentorQuestion(customQuestionInput);

    // Contextual answer simulation
    const q = customQuestionInput.toLowerCase();
    if (q.includes('schema') || q.includes('database')) {
      setSuggestedAnswer("PostgreSQL 16 with pgvector extension for unified relational state and sub-second cosine embeddings.");
      setCitation("Discussed at 08:15 during Database Architecture review");
    } else if (q.includes('bot') || q.includes('offline')) {
      setSuggestedAnswer("The bot runs on independent server infrastructure. If you disconnect, it stays connected and records in the cloud.");
      setCitation("Discussed at 04:30 during Resilience review");
    } else if (q.includes('podcast') || q.includes('language')) {
      setSuggestedAnswer("NotebookLM-style dual-host script synthesized in the user's mother tongue via ElevenLabs Multilingual v2.");
      setCitation("Discussed at 18:20 during Media Pipeline review");
    } else {
      setSuggestedAnswer(`Key context: Regarding '${customQuestionInput}', the team aligned on sub-2s response targets and automated email summaries.`);
      setCitation("Extracted from recent meeting discussion");
    }

    setCustomQuestionInput('');
    setTimeout(() => setHudPulse(false), 3000);
  };

  const podcastScripts = {
    en: [
      { speaker: "Host_A", text: "Welcome to today's MeetMee Audio Overview! We're breaking down the architecture sprint." },
      { speaker: "Host_B", text: "Right, and the big headline is the autonomous bot architecture. If you drop offline, the bot keeps listening and transcribing." },
      { speaker: "Host_A", text: "That is huge for anyone on patchy train Wi-Fi or with laptop battery limits. What about the mentor alerts?" },
      { speaker: "Host_B", text: "They hit sub-two-second latency on the RAG pipeline. When your boss asks a question, your screen gives you the exact answer." }
    ],
    es: [
      { speaker: "Host_A", text: "¡Bienvenidos al resumen de MeetMee! Hoy repasamos la arquitectura del sistema." },
      { speaker: "Host_B", text: "Exacto, lo más destacado es que el bot sigue grabando incluso si el usuario pierde conexión Wi-Fi." },
      { speaker: "Host_A", text: "¡Increíble para trabajar en remoto! ¿Y cómo funciona la ventana de preguntas del mentor?" },
      { speaker: "Host_B", text: "Utiliza Gemini para sintetizar respuestas en menos de dos segundos directamente en tu pantalla." }
    ],
    hi: [
      { speaker: "Host_A", text: "MeetMee के पॉडकास्ट रीकैप में आपका स्वागत है! आज हम मीटिंग के मुख्य बिंदुओं की चर्चा कर रहे हैं।" },
      { speaker: "Host_B", text: "हाँ, सबसे महत्वपूर्ण बात यह है कि अगर आपका इंटरनेट कट भी जाए, तो भी बॉट मीटिंग में बना रहता है।" },
      { speaker: "Host_A", text: "यह बहुत ही उपयोगी है! और जब मेंटॉर कोई सवाल पूछते हैं, तो उत्तर कैसे मिलता है?" },
      { speaker: "Host_B", text: "स्क्रीन पर 2 सेकंड से कम समय में बिल्कुल सटीक उत्तर पॉप-अप हो जाता है।" }
    ],
    fr: [
      { speaker: "Host_A", text: "Bienvenue dans l'aperçu audio MeetMee ! Nous analysons la réunion d'architecture." },
      { speaker: "Host_B", text: "Le point clé : le bot autonome continue d'enregistrer même en cas de coupure réseau." },
      { speaker: "Host_A", text: "C'est une tranquillité d'esprit totale ! Et pour les questions des mentors ?" },
      { speaker: "Host_B", text: "Une réponse contextualisée s'affiche en moins de deux secondes sur votre écran." }
    ]
  };

  const currentPodcastScript = podcastScripts[podcastLang] || podcastScripts.en;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Radio className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Meet<span className="text-blue-500">Mee</span>
              </span>
              <span className="ml-2 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                Live Prototype
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              Autonomous Cloud Bot: Ready
            </span>
            <a
              href="https://github.com/PR-ds/MeetMee.git"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              GitHub Repo
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero & Ingestion Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Meeting Ingestion Form */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                AI Corporate Meeting Intelligence Platform
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Never miss an answer. Never lose a meeting note.
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300">
                Paste your meeting link below. MeetMee attends as a dedicated AI participant, alerts you when your mentor calls your name, delivers real-time answers, and translates everything into podcasts and comics.
              </p>
            </div>

            {/* Paste Meeting Link Card */}
            <form onSubmit={handleDispatchBot} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Video className="h-4 w-4 text-blue-400" />
                  Paste Meeting Link to Dispatch Bot
                </span>
                <span className="text-[11px] font-semibold text-blue-400 bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  {detectPlatform(meetingUrl)}
                </span>
              </div>

              <input
                type="url"
                required
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="e.g. https://meet.google.com/abc-defg-hij or Zoom / Teams"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />

              <div className="flex gap-3">
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="Meeting Title (e.g. Sprint Architecture & Q3 Review)"
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shrink-0"
                >
                  <Bot className="h-4 w-4" />
                  Dispatch Bot
                </button>
              </div>

              {isBotJoined && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span><strong>MeetMee AI Assistant</strong> joined & transcribing in cloud.</span>
                  </div>
                  <span className="rounded bg-emerald-900/60 px-2 py-0.5 text-[10px] font-mono border border-emerald-500/20">
                    Offline Resilient
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Runs on independent server workers. If your computer sleeps or loses Wi-Fi, the bot continues recording unabated.</span>
              </div>
            </form>
          </div>

          {/* Right Column: Floating Real-Time HUD Companion */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                Live Floating Companion HUD
              </span>
              <span className="text-[10px] text-slate-500">Feature 2 & 4</span>
            </div>

            {/* Live HUD Card */}
            <div className={`rounded-2xl border border-blue-500/40 bg-slate-900/95 p-5 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 ${hudPulse ? 'ring-4 ring-blue-500/60 shadow-blue-500/30' : ''}`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    MeetMee Live HUD
                  </span>
                </div>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                  Always-on-Top
                </span>
              </div>

              <div className="mt-2.5 text-[11px] text-slate-400">
                Active Session: <span className="font-medium text-slate-200">{meetingTitle || "Architecture Review & Q3 Sprint"}</span>
              </div>

              {/* Mentor Mention Alert */}
              <div className="mt-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <Bell className="h-3.5 w-3.5 animate-bounce" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Mentor Addressed You Directly
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-amber-100">
                  &ldquo;{activeMentorQuestion}&rdquo;
                </p>
              </div>

              {/* Context-Aware Suggested Answer */}
              <div className="mt-3.5 rounded-xl border border-blue-500/30 bg-blue-950/40 p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Suggested Answer (Sub-2s RAG)
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-300 bg-blue-900/50 px-2 py-0.5 rounded-full border border-blue-500/20">
                    94% Grounded
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-100 font-normal">
                  {suggestedAnswer}
                </p>

                <div className="mt-2.5 flex items-center justify-between border-t border-blue-900/50 pt-2 text-[11px] text-slate-400">
                  <span className="italic truncate max-w-[200px] text-slate-400">{citation}</span>
                  <button
                    onClick={handleCopyAnswer}
                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-blue-500 active:scale-95"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied" : "Copy Answer"}
                  </button>
                </div>
              </div>

              {/* Interactive Simulator */}
              <form onSubmit={handleTestQuestion} className="mt-3.5 border-t border-slate-800 pt-3">
                <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
                  <span>🧪 Test Mentor Question:</span>
                  <span className="text-[10px] text-blue-400">Type below to test live HUD chime</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customQuestionInput}
                    onChange={(e) => setCustomQuestionInput(e.target.value)}
                    placeholder="e.g. Alex, what database schema did we choose?"
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-all"
                  >
                    <Send className="h-3 w-3" />
                    Ask
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* Feature Navigation Tabs */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Post-Meeting Intelligence & Artifacts</h2>
              <p className="text-xs text-slate-400 mt-0.5">Explore the automated transformations generated immediately upon meeting conclusion.</p>
            </div>

            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'notes' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Hint Notes & Email
              </button>
              <button
                onClick={() => setActiveTab('podcast')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'podcast' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Headphones className="h-3.5 w-3.5" />
                Multilingual Podcast
              </button>
              <button
                onClick={() => setActiveTab('comic')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'comic' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Palette className="h-3.5 w-3.5" />
                4-Panel Comic Strip
              </button>
            </div>
          </div>

          {/* TAB 1: Hint Notes */}
          {activeTab === 'notes' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    Feature 3: Hint-Style Notes & Automated Email Delivery
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Concise concept anchors and action matrix auto-dispatched to user email post-call.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEmailSent(true);
                    setTimeout(() => setEmailSent(false), 3000);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-blue-600/20 border border-blue-500/30 px-3.5 py-1.5 text-xs font-semibold text-blue-400 hover:bg-blue-600 hover:text-white transition-all"
                >
                  {emailSent ? <Check className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                  {emailSent ? "Dispatched to developer@example.com!" : "Dispatch Email Now"}
                </button>
              </div>

              {/* 60s TL;DR */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2">
                  🎯 60-Second Executive TL;DR
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Autonomous bot ingestion deployed on independent server instances to guarantee offline recording resilience.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Sub-two-second latency SLA benchmarked and achieved for real-time mentor Q&A HUD.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Approved NotebookLM-style bilingual podcast and 4-panel visual comic strip transformation pipelines.</span>
                  </li>
                </ul>
              </div>

              {/* Concept Anchors */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2">
                  💡 Concept Anchors & Hints
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                    <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                      Offline Bot Resilience
                    </span>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      Decouple bot WebRTC connection from user client state. If client drops Wi-Fi, bot remains in call uninterrupted.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                    <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                      Phonetic Name Matching
                    </span>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      Utilize Double Metaphone + Jaro-Winkler distance threshold (0.85) to catch accented pronunciations of user name.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                    <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                      Grounded RAG Threshold
                    </span>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      Require >= 0.72 cosine similarity on transcript vector chunks to strictly eliminate LLM hallucination in live answers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Matrix */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2">
                  📋 Action Items & Ownership Matrix
                </h4>
                <div className="overflow-hidden rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-2 font-medium">Task Deliverable</th>
                        <th className="px-4 py-2 font-medium">Owner</th>
                        <th className="px-4 py-2 font-medium">Deadline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                      <tr>
                        <td className="px-4 py-2 font-medium text-slate-200">Deploy Recall.ai bot handler to container pool</td>
                        <td className="px-4 py-2 text-slate-400">Alex Chen</td>
                        <td className="px-4 py-2 text-rose-400 font-medium">Friday 5 PM</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium text-slate-200">Integrate ElevenLabs Multilingual v2 voice cloning pairs</td>
                        <td className="px-4 py-2 text-slate-400">Sarah Lin</td>
                        <td className="px-4 py-2 text-rose-400 font-medium">Next Monday</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium text-slate-200">Configure Resend transactional email template for hint delivery</td>
                        <td className="px-4 py-2 text-slate-400">DevOps</td>
                        <td className="px-4 py-2 text-rose-400 font-medium">Wednesday</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Multilingual Podcast */}
          {activeTab === 'podcast' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Headphones className="h-5 w-5 text-indigo-400" />
                    Feature 5: NotebookLM-Style Multilingual Podcast
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Converts meeting discussions into a 2-host conversational audio overview in your mother tongue.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <span className="text-xs text-slate-400">Mother Tongue:</span>
                  <select
                    value={podcastLang}
                    onChange={(e) => setPodcastLang(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish (Español)</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="fr">French (Français)</option>
                  </select>
                </div>
              </div>

              {/* Audio Player Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 transition-transform hover:scale-105 active:scale-95"
                  >
                    {isAudioPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <span className="font-medium text-slate-200">
                        MeetMee Audio Overview: Architecture Sprint ({podcastLang.toUpperCase()})
                      </span>
                      <span className="font-mono">01:14 / 03:25</span>
                    </div>

                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                        style={{ width: `${audioProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  <Volume2 className="h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Synced Dialogue Transcript */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  Dual-Host Dialogue Transcript
                </h4>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {currentPodcastScript.map((turn, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl p-3 border text-xs leading-relaxed ${
                        turn.speaker === "Host_A"
                          ? "border-blue-500/20 bg-blue-950/20 text-blue-100"
                          : "border-indigo-500/20 bg-indigo-950/20 text-indigo-100"
                      }`}
                    >
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold mr-2 bg-slate-800/80 text-blue-300">
                        {turn.speaker === "Host_A" ? "🎙️ Host A (Inquirer)" : "💡 Host B (Expert)"}
                      </span>
                      {turn.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Visual Comic Strip */}
          {activeTab === 'comic' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Palette className="h-5 w-5 text-pink-400" />
                    Feature 6: 4-Panel Visual Comic Strip Generator
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Deconstructs complex technical meetings into an engaging narrative storyboard with character dialogues.
                  </p>
                </div>

                <button
                  onClick={() => alert("Downloading Comic Strip as high-res PNG...")}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export Comic (PNG)
                </button>
              </div>

              {/* 4 Comic Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Panel 1 */}
                <div className="rounded-xl border border-rose-500/30 bg-gradient-to-b from-rose-950/30 to-slate-950 p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Panel 1: The Dilemma</span>
                    <div className="mt-2.5 h-28 rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-[11px] text-slate-400 italic flex items-center text-center">
                      Stressed developer staring at offline screen as laptop battery dies mid-presentation.
                    </div>
                    <div className="mt-3 rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-xs text-white">
                      <strong className="text-[10px] text-slate-400 block mb-0.5">Alex (Developer):</strong>
                      “My laptop battery died and Wi-Fi dropped mid-presentation!”
                    </div>
                  </div>
                </div>

                {/* Panel 2 */}
                <div className="rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-950/30 to-slate-950 p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Panel 2: The Brainstorm</span>
                    <div className="mt-2.5 h-28 rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-[11px] text-slate-400 italic flex items-center text-center">
                      Engineers mapping out an event-driven bot infrastructure on a glowing digital board.
                    </div>
                    <div className="mt-3 rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-xs text-white">
                      <strong className="text-[10px] text-slate-400 block mb-0.5">Sarah (Architect):</strong>
                      “MeetMee's autonomous cloud bot stays connected even when you disconnect.”
                    </div>
                  </div>
                </div>

                {/* Panel 3 */}
                <div className="rounded-xl border border-blue-500/30 bg-gradient-to-b from-blue-950/30 to-slate-950 p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Panel 3: The Breakthrough</span>
                    <div className="mt-2.5 h-28 rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-[11px] text-slate-400 italic flex items-center text-center">
                      Mentor asks question; Alex's floating HUD instantly pops up with 120ms p95 answer.
                    </div>
                    <div className="mt-3 rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-xs text-white">
                      <strong className="text-[10px] text-slate-400 block mb-0.5">Mentor (Harrison):</strong>
                      “Alex, what was our agreed streaming latency benchmark?”
                    </div>
                  </div>
                </div>

                {/* Panel 4 */}
                <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 to-slate-950 p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Panel 4: The Victory</span>
                    <div className="mt-2.5 h-28 rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-[11px] text-slate-400 italic flex items-center text-center">
                      Satisfied team receiving instant hint-style notes and listening to dual-host podcast.
                    </div>
                    <div className="mt-3 rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-xs text-white">
                      <strong className="text-[10px] text-slate-400 block mb-0.5">The Team:</strong>
                      “Meeting adjourned! Summaries emailed, podcast generated, and action items locked.”
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        MeetMee AI Meeting Intelligence Platform • Open Source on <a href="https://github.com/PR-ds/MeetMee.git" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">GitHub</a>
      </footer>
    </div>
  );
}
