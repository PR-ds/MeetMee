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
  ShieldCheck, 
  Download, 
  Bot, 
  X, 
  Bookmark, 
  BookmarkCheck, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  UserCheck, 
  Calendar,
  AlertTriangle,
  Lock,
  Crown,
  Zap,
  Mic,
  MessageSquare
} from 'lucide-react';

export default function App() {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [isBotJoined, setIsBotJoined] = useState(false);
  const [activeTab, setActiveTab] = useState('notes'); // 'history', 'notes', 'podcast', 'comic', 'assistant', 'pricing'
  
  // Subscription Plan State: 'free' | 'monthly' | 'yearly'
  const [userPlan, setUserPlan] = useState('free');
  const [meetingsCount, setMeetingsCount] = useState(1); // 1 of 3 used on free tier
  const [upgradeNotification, setUpgradeNotification] = useState(null);

  // Always-Online Cloud Presence State
  const [isCloudPresenceActive, setIsCloudPresenceActive] = useState(true);
  const [userProfile] = useState({
    name: "Alex Chen",
    id: "mm-usr-9842",
    email: "alex.chen@meetmee.internal",
    role: "Senior Engineer & Student"
  });

  // Real-time HUD Pop-up state (ONLY APPEARS WHEN MENTOR/HOST ASKS A QUESTION)
  const [isPopupVisible, setIsPopupVisible] = useState(false);
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

  // Native Language Voice Assistant State (Yearly Plan Exclusive)
  const [assistantLang, setAssistantLang] = useState('hi');
  const [assistantQuery, setAssistantQuery] = useState('');
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [assistantHistory, setAssistantHistory] = useState([
    {
      role: 'assistant',
      lang: 'hi',
      text: 'नमस्ते एलेक्स! मैं आपकी व्यक्तिगत नेटिव वॉइस असिस्टेंट हूँ। आप मुझसे आगामी मीटिंग के एजेंडे, सारांश या किसी भी सामान्य कार्य के बारे में अपनी भाषा में पूछ सकते हैं।'
    }
  ]);

  // Meeting History with Monthly Auto-Erase & Permanent Save
  const initialMeetings = [
    {
      id: "mtg-101",
      title: "Sprint Architecture & Q3 Review",
      date: "September 28, 2026",
      duration: "45 mins",
      platform: "Google Meet",
      isPermanent: true,
      daysUntilPurge: null
    },
    {
      id: "mtg-102",
      title: "Weekly Engineering Standup & Blocker Sync",
      date: "September 20, 2026",
      duration: "25 mins",
      platform: "Zoom",
      isPermanent: false,
      daysUntilPurge: 12
    },
    {
      id: "mtg-103",
      title: "Product Roadmap & AI Strategy Session",
      date: "September 12, 2026",
      duration: "50 mins",
      platform: "Microsoft Teams",
      isPermanent: false,
      daysUntilPurge: 4
    },
    {
      id: "mtg-104",
      title: "Old Vendor Presentation & Demo",
      date: "August 28, 2026",
      duration: "30 mins",
      platform: "Google Meet",
      isPermanent: false,
      daysUntilPurge: 1
    }
  ];

  const [meetings, setMeetings] = useState(initialMeetings);
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [editTitleInput, setEditTitleInput] = useState('');
  const [monthlyPurgeMessage, setMonthlyPurgeMessage] = useState(null);

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

    if (userPlan === 'free' && meetingsCount >= 3) {
      setUpgradeNotification("Free Tier limit reached (3 of 3 meetings used). Please upgrade to Monthly (₹99) or Yearly (₹1099) plan to attend more meetings.");
      return;
    }

    setIsBotJoined(true);
    setMeetingsCount(prev => prev + 1);
  };

  // Trigger Pop-up ONLY when mentor asks question
  const triggerMentorQuestionPopup = (questionText) => {
    const q = questionText.trim();
    if (!q) return;

    setActiveMentorQuestion(q);

    const qLower = q.toLowerCase();
    if (qLower.includes('schema') || qLower.includes('database')) {
      setSuggestedAnswer("PostgreSQL 16 with pgvector extension for unified relational state and sub-second cosine embeddings.");
      setCitation("Discussed at 08:15 during Database Architecture review");
    } else if (qLower.includes('bot') || qLower.includes('offline')) {
      setSuggestedAnswer("The bot runs on independent server infrastructure. If you disconnect, it stays connected and records in the cloud.");
      setCitation("Discussed at 04:30 during Resilience review");
    } else if (qLower.includes('pricing') || qLower.includes('plan') || qLower.includes('subscription')) {
      setSuggestedAnswer("Free tier offers 3 meetings. Monthly is ₹99 for 100 meetings + Comics. Yearly is ₹1099 for unlimited + Podcasts + Native Voice Assistant.");
      setCitation("MeetMee Subscription Matrix");
    } else {
      setSuggestedAnswer(`Grounded Answer: Regarding '${q}', the team aligned on sub-2s response targets and automated email summaries.`);
      setCitation("Extracted from recent meeting discussion");
    }

    setIsPopupVisible(true);
    setHudPulse(true);
    playChime();
    setTimeout(() => setHudPulse(false), 2500);
  };

  // Meeting History Action: Toggle Save Permanently
  const handleToggleSaveMeeting = (id) => {
    setMeetings(prev => prev.map(m => {
      if (m.id === id) {
        const nextPermanent = !m.isPermanent;
        return {
          ...m,
          isPermanent: nextPermanent,
          daysUntilPurge: nextPermanent ? null : 30
        };
      }
      return m;
    }));
  };

  // Meeting History Action: Start Rename
  const handleStartRename = (meeting) => {
    setEditingMeetingId(meeting.id);
    setEditTitleInput(meeting.title);
  };

  // Meeting History Action: Save Rename
  const handleSaveRename = (id) => {
    if (!editTitleInput.trim()) return;
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, title: editTitleInput.trim() } : m));
    setEditingMeetingId(null);
  };

  // Meeting History Action: Delete
  const handleDeleteMeeting = (id) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  // Monthly Auto-Purge Execution
  const handleRunMonthlyPurge = () => {
    const unsavedCount = meetings.filter(m => !m.isPermanent).length;
    const permanentCount = meetings.filter(m => m.isPermanent).length;

    setMeetings(prev => prev.filter(m => m.isPermanent));

    setMonthlyPurgeMessage(
      `Monthly Auto-Erase complete: ${unsavedCount} unsaved meeting(s) erased. ${permanentCount} permanently saved meeting(s) preserved!`
    );
    setTimeout(() => setMonthlyPurgeMessage(null), 6000);
  };

  const handleResetDemoMeetings = () => {
    setMeetings(initialMeetings);
    setMonthlyPurgeMessage("Reset meeting history to original sample dataset.");
    setTimeout(() => setMonthlyPurgeMessage(null), 4000);
  };

  // Upgrade Plan handler
  const handleSelectPlan = (planKey) => {
    setUserPlan(planKey);
    const planNames = { free: "Free Tier", monthly: "Monthly Plan (₹99)", yearly: "Yearly Unlimited Plan (₹1099)" };
    setUpgradeNotification(`Plan updated to ${planNames[planKey]}!`);
    setTimeout(() => setUpgradeNotification(null), 4000);
  };

  // Native Language Voice Assistant Handler
  const handleAssistantSubmit = (e) => {
    e.preventDefault();
    if (!assistantQuery.trim()) return;

    const userText = assistantQuery.trim();
    setAssistantHistory(prev => [...prev, { role: 'user', text: userText }]);
    setAssistantQuery('');
    setIsAssistantSpeaking(true);
    playChime();

    setTimeout(() => {
      let reply = "";
      if (assistantLang === 'hi') {
        reply = `मैंने आपकी पिछली मीटिंग के नोट्स की समीक्षा की है। मुख्य फोकस स्ट्रीमिंग लेटेंसी और ऑटोमैटिक ईमेल समरी पर था। क्या आप चाहते हैं कि मैं आपकी अगली मीटिंग का एजेंडा तैयार करूँ?`;
      } else if (assistantLang === 'ta') {
        reply = `உங்கள் முந்தைய சந்திப்பு குறிப்புகளை நான் மதிப்பாய்வு செய்துள்ளேன். முக்கிய கவனம் நேரலை ஆடியோ மற்றும் தானியங்கி மின்னஞ்சல் சுருக்கம். உங்கள் அடுத்த சந்திப்பின் நிகழ்ச்சி நிரலை நான் தயார் செய்ய வேண்டுமா?`;
      } else if (assistantLang === 'te') {
        reply = `నేను మీ మునుపటి మీటింగ్ నోట్స్ సమీక్షించాను. ప్రధాన దృష్టి స్ట్రీమింగ్ లేటెన్సీ మరియు ఆటోమేటిక్ ఇమెయిల్ సారాంశంపై ఉంది. మీ తదుపరి సమావేశ ఎజెండాను సిద్ధం చేయమంటారా?`;
      } else if (assistantLang === 'es') {
        reply = `He revisado las notas de tu reunión anterior. El punto clave fue la latencia inferior a 2 segundos y el resumen por correo electrónico. ¿Deseas preparar la agenda para la próxima llamada?`;
      } else {
        reply = `I've analyzed your recent meeting discussions. Key priorities include sub-2s mentor RAG latency and automated hint summaries. Would you like me to draft your preparation agenda?`;
      }

      setAssistantHistory(prev => [...prev, { role: 'assistant', lang: assistantLang, text: reply }]);
      setIsAssistantSpeaking(false);
    }, 900);
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
      
      {/* Top Header with User Profile, Always-Online Presence & Subscription Tier Badge */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Radio className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Meet<span className="text-blue-500">Mee</span>
              </span>
              <span className="ml-2 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                Enterprise AI
              </span>
            </div>
          </div>

          {/* User Profile & Subscription Tier Status */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Active Subscription Badge */}
            <button
              onClick={() => setActiveTab('pricing')}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-all"
            >
              {userPlan === 'yearly' && <Crown className="h-3.5 w-3.5 text-amber-400" />}
              {userPlan === 'monthly' && <Zap className="h-3.5 w-3.5 text-indigo-400" />}
              {userPlan === 'free' && <Sparkles className="h-3.5 w-3.5 text-slate-400" />}
              <span>
                {userPlan === 'free' && `Free Tier (${meetingsCount}/3 Used)`}
                {userPlan === 'monthly' && `Pro Monthly (₹99/mo)`}
                {userPlan === 'yearly' && `Yearly VIP (₹1099/yr)`}
              </span>
              <span className="text-[10px] text-amber-400 underline ml-0.5">Plans</span>
            </button>

            {/* Always-Online Presence Indicator */}
            <div className="hidden sm:flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 shadow-sm">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white">
                  AC
                </div>
                {isCloudPresenceActive && (
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-900"></span>
                  </span>
                )}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-200">{userProfile.name}</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <UserCheck className="h-3 w-3" />
                  Always Online (Cloud Active)
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Global Upgrade Banner Notification */}
      {upgradeNotification && (
        <div className="bg-gradient-to-r from-blue-900/90 to-indigo-900/90 border-b border-blue-500/30 px-4 py-2.5 text-center text-xs font-semibold text-blue-100 flex items-center justify-center gap-2 animate-in fade-in">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{upgradeNotification}</span>
          <button onClick={() => setUpgradeNotification(null)} className="ml-2 text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero & Ingestion Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Meeting Ingestion Form */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                Persistent AI Meeting Attendance &amp; Transformation
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Autonomous Meeting Intelligence
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300">
                Paste your meeting link. MeetMee stays in the call even if you disconnect, maintains your online status, and brings up a context-aware answer pop-up <strong>strictly when your mentor or host asks a question</strong>.
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

              {/* Free Tier Meeting Counter Notice */}
              {userPlan === 'free' && (
                <div className="flex items-center justify-between rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-400">
                  <span>Free Tier Allowance: <strong>{meetingsCount} of 3 meetings used</strong></span>
                  <button 
                    type="button"
                    onClick={() => setActiveTab('pricing')} 
                    className="text-amber-400 font-semibold hover:underline"
                  >
                    Upgrade for 100 or Unlimited →
                  </button>
                </div>
              )}

              {isBotJoined && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span><strong>MeetMee AI Assistant</strong> joined &amp; transcribing in cloud.</span>
                  </div>
                  <span className="rounded bg-emerald-900/60 px-2 py-0.5 text-[10px] font-mono border border-emerald-500/20">
                    Offline Resilient
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Cloud Presence Active: Your avatar stays marked &quot;Online&quot; in the meeting even if your local machine sleeps.</span>
              </div>
            </form>
          </div>

          {/* Right Column: Audio Listener & Pop-Up Trigger Simulator */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Background Audio Listener Status Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Background Audio Monitor
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  Pop-up: {isPopupVisible ? "OPEN" : "HIDDEN"}
                </span>
              </div>

              <div className="mt-3 text-xs text-slate-300 leading-relaxed">
                The Q&amp;A pop-up window is <strong>hidden by default</strong> to prevent screen clutter. It will <strong>automatically pop up only when your mentor or host asks a question</strong> or addresses your name.
              </div>

              {/* Quick simulation buttons */}
              <div className="mt-4 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Simulate Mentor Asking a Question:
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => triggerMentorQuestionPopup("Alex! Could you clarify what our streaming latency SLA is?")}
                    className="text-left rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-blue-600/20 hover:border-blue-500/40 p-2 text-xs text-slate-200 transition-all flex items-center justify-between"
                  >
                    <span>&ldquo;Alex, what is our latency SLA?&rdquo;</span>
                    <span className="text-[10px] font-semibold text-blue-400">Trigger Pop-up →</span>
                  </button>
                  <button
                    onClick={() => triggerMentorQuestionPopup("Alex, what database schema did we choose for vector search?")}
                    className="text-left rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-blue-600/20 hover:border-blue-500/40 p-2 text-xs text-slate-200 transition-all flex items-center justify-between"
                  >
                    <span>&ldquo;Alex, what database schema did we choose?&rdquo;</span>
                    <span className="text-[10px] font-semibold text-blue-400">Trigger Pop-up →</span>
                  </button>
                  <button
                    onClick={() => triggerMentorQuestionPopup("Alex, can you explain our subscription plans for new users?")}
                    className="text-left rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-blue-600/20 hover:border-blue-500/40 p-2 text-xs text-slate-200 transition-all flex items-center justify-between"
                  >
                    <span>&ldquo;Alex, explain our subscription plans&rdquo;</span>
                    <span className="text-[10px] font-semibold text-blue-400">Trigger Pop-up →</span>
                  </button>
                </div>
              </div>

              {/* Custom question input */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customQuestionInput.trim()) {
                    triggerMentorQuestionPopup(customQuestionInput);
                    setCustomQuestionInput('');
                  }
                }}
                className="mt-3.5 pt-3 border-t border-slate-800 flex gap-2"
              >
                <input
                  type="text"
                  value={customQuestionInput}
                  onChange={(e) => setCustomQuestionInput(e.target.value)}
                  placeholder="Or type any mentor question..."
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-all shrink-0 flex items-center gap-1"
                >
                  <Send className="h-3 w-3" />
                  Ask
                </button>
              </form>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* POP-UP WINDOW: APPEARS ONLY WHEN MENTOR ASKS A QUESTION */}
        {/* ========================================================================= */}
        {isPopupVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
              className={`w-full max-w-lg rounded-2xl border-2 border-blue-500 bg-slate-900/95 p-5 text-white shadow-2xl backdrop-blur-xl transition-all ${
                hudPulse ? 'ring-8 ring-blue-500/50 shadow-blue-500/50 scale-102' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    ⚠️ MENTOR QUESTION DETECTED (Live Alert)
                  </span>
                </div>
                <button
                  onClick={() => setIsPopupVisible(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Close Pop-up"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mentor Question Banner */}
              <div className="mt-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                  <Bell className="h-4 w-4 animate-bounce" />
                  <span>Host / Mentor Addressed You Directly:</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-amber-100">
                  &ldquo;{activeMentorQuestion}&rdquo;
                </p>
              </div>

              {/* Context-Aware Suggested Answer */}
              <div className="mt-3.5 rounded-xl border border-blue-500/30 bg-blue-950/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Context-Aware Answer (Sub-2s RAG)
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-300 bg-blue-900/50 px-2 py-0.5 rounded-full border border-blue-500/20">
                    94% Grounded
                  </span>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-slate-100 font-normal">
                  {suggestedAnswer}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-blue-900/50 pt-2.5 text-xs text-slate-400">
                  <span className="italic truncate max-w-[240px] text-slate-400">{citation}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyAnswer}
                      className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-500 active:scale-95"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied!" : "Copy Answer"}
                    </button>
                    <button
                      onClick={() => setIsPopupVisible(false)}
                      className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-slate-500 text-center">
                This pop-up only appears when a mentor asks a question. Press Dismiss or ✕ to close.
              </div>
            </div>
          </div>
        )}

        {/* Feature Navigation Tabs */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Meeting Intelligence &amp; Retention Center</h2>
              <p className="text-xs text-slate-400 mt-0.5">Explore your meeting history, retention policies, summaries, and transformations.</p>
            </div>

            <div className="flex flex-wrap rounded-xl bg-slate-900 p-1 border border-slate-800 gap-1">
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                History ({meetings.length})
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'notes' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Hint Notes &amp; Email
              </button>
              
              {/* Comic Tab (Unlocked on Monthly ₹99 or Yearly ₹1099) */}
              <button
                onClick={() => setActiveTab('comic')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'comic' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Palette className="h-3.5 w-3.5" />
                Comic Strip {userPlan === 'free' && <Lock className="h-3 w-3 text-amber-400" />}
              </button>

              {/* Podcast Tab (Unlocked on Yearly ₹1099) */}
              <button
                onClick={() => setActiveTab('podcast')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'podcast' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Headphones className="h-3.5 w-3.5" />
                Podcast {userPlan !== 'yearly' && <Lock className="h-3 w-3 text-amber-400" />}
              </button>

              {/* Native Voice Assistant Tab (NEW FEATURE: Yearly Plan Exclusive) */}
              <button
                onClick={() => setActiveTab('assistant')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'assistant' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="h-3.5 w-3.5" />
                Native Voice AI {userPlan !== 'yearly' && <Crown className="h-3 w-3 text-amber-400" />}
              </button>

              {/* Subscription Plans Tab */}
              <button
                onClick={() => setActiveTab('pricing')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'pricing' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-400 hover:text-white'
                }`}
              >
                <Crown className="h-3.5 w-3.5" />
                Plans (₹99 / ₹1099)
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB: PRICING & SUBSCRIPTION TIERS (Free, ₹99/mo, ₹1099/yr) */}
          {/* ========================================================================= */}
          {activeTab === 'pricing' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Subscription Plans</span>
                <h3 className="text-2xl font-extrabold text-white">Choose Your MeetMee Tier</h3>
                <p className="text-xs text-slate-400">
                  Select a plan tailored for your meeting volume and content transformation requirements.
                </p>
              </div>

              {/* 3 Pricing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                
                {/* TIER 1: Free Tier */}
                <div className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  userPlan === 'free' 
                    ? 'border-blue-500 bg-blue-950/20 ring-2 ring-blue-500/40' 
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                }`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Starter</span>
                      {userPlan === 'free' && (
                        <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                          Current Plan
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-white mt-1">Free Tier</h4>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">₹0</span>
                      <span className="text-xs text-slate-400">/ first 3 meetings</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Perfect for trying out autonomous bot attendance and live mentor Q&amp;A.
                    </p>

                    <div className="mt-5 space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Up to <strong>3 meetings</strong> total</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Autonomous Bot Ingestion &amp; Live ASR</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Real-Time Mentor Q&amp;A Pop-up HUD</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Hint-Style Notes &amp; Automated Email</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <X className="h-4 w-4 text-rose-500/70 shrink-0" />
                        <span>No 4-Panel Comic Generator</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <X className="h-4 w-4 text-rose-500/70 shrink-0" />
                        <span>No Multilingual Podcast Engine</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPlan('free')}
                    className={`mt-6 w-full rounded-xl py-2.5 text-xs font-bold transition-all ${
                      userPlan === 'free'
                        ? 'bg-slate-800 text-slate-400 cursor-default'
                        : 'border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {userPlan === 'free' ? 'Selected' : 'Switch to Free Tier'}
                  </button>
                </div>

                {/* TIER 2: Monthly Plan (₹99/month) */}
                <div className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  userPlan === 'monthly' 
                    ? 'border-indigo-500 bg-indigo-950/20 ring-2 ring-indigo-500/40' 
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                }`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Pro Monthly</span>
                      {userPlan === 'monthly' && (
                        <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                          Current Plan
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-white mt-1">Monthly Plan</h4>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">₹99</span>
                      <span className="text-xs text-slate-400">/ month</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Unlocks up to 100 meetings and full 4-panel visual comic storytelling.
                    </p>

                    <div className="mt-5 space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Up to <strong>100 meetings</strong> per month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="text-emerald-300 font-semibold">4-Panel Visual Comic Strip Generator UNLOCKED</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Real-Time Mentor Q&amp;A Pop-up HUD</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Hint-Style Notes &amp; Immediate Email Delivery</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Monthly Meeting Retention with Save Permanently</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <X className="h-4 w-4 text-rose-500/70 shrink-0" />
                        <span>Podcast Engine (Yearly Only)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPlan('monthly')}
                    className={`mt-6 w-full rounded-xl py-2.5 text-xs font-bold transition-all ${
                      userPlan === 'monthly'
                        ? 'bg-indigo-600 text-white cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    }`}
                  >
                    {userPlan === 'monthly' ? 'Active Plan' : 'Subscribe for ₹99/month'}
                  </button>
                </div>

                {/* TIER 3: Yearly Plan (₹1099/year) */}
                <div className={`rounded-2xl border p-5 flex flex-col justify-between relative overflow-hidden transition-all ${
                  userPlan === 'yearly' 
                    ? 'border-amber-500 bg-amber-950/20 ring-2 ring-amber-500/50' 
                    : 'border-amber-500/40 bg-slate-950/70 hover:border-amber-500'
                }`}>
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 font-extrabold text-[9px] px-3 py-0.5 rounded-bl-lg uppercase tracking-wider">
                    Best Value
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        <Crown className="h-3.5 w-3.5" /> VIP All-Access
                      </span>
                      {userPlan === 'yearly' && (
                        <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                          Current Plan
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-white mt-1">Yearly Plan</h4>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">₹1,099</span>
                      <span className="text-xs text-slate-400">/ year</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Unlimited meetings, all features, plus the Native Language Voice Assistant.
                    </p>

                    <div className="mt-5 space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span><strong>Unlimited meetings</strong> (Zero limits)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="text-amber-300 font-bold">NEW: Native Language Voice Assistant for General Use</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="text-indigo-300 font-semibold">NotebookLM Multilingual Podcast Engine UNLOCKED</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="text-pink-300 font-semibold">4-Panel Visual Comic Strip Generator UNLOCKED</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Always-Online Virtual Cloud Presence</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Priority 24/7 Processing Queue</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPlan('yearly')}
                    className={`mt-6 w-full rounded-xl py-2.5 text-xs font-bold transition-all ${
                      userPlan === 'yearly'
                        ? 'bg-amber-500 text-slate-950 cursor-default'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                    }`}
                  >
                    {userPlan === 'yearly' ? 'Active Plan' : 'Subscribe for ₹1,099/year'}
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: MEETING HISTORY (WITH MONTHLY ERASE, SAVE PERMANENTLY, RENAME, DELETE) */}
          {/* ========================================================================= */}
          {activeTab === 'history' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    Meeting History &amp; Monthly Auto-Purge Manager
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Meetings auto-erase once a month after 30 days unless you click <strong>Save Permanently</strong>. Every meeting supports Rename, Save, and Delete.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunMonthlyPurge}
                    className="flex items-center gap-1.5 rounded-xl bg-rose-600/20 border border-rose-500/30 px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-600 hover:text-white transition-all"
                    title="Simulate monthly auto-erase: purges all unsaved meetings"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Run Monthly Auto-Purge Now
                  </button>
                  <button
                    onClick={handleResetDemoMeetings}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
                    title="Reset demo meetings"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                </div>
              </div>

              {monthlyPurgeMessage && (
                <div className="rounded-xl border border-blue-500/40 bg-blue-950/40 p-3 text-xs text-blue-300 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{monthlyPurgeMessage}</span>
                </div>
              )}

              {/* Meeting List with Rename, Save Permanently, and Delete */}
              <div className="space-y-3">
                {meetings.length === 0 ? (
                  <div className="rounded-xl border border-slate-800 p-8 text-center text-sm text-slate-500">
                    No meetings found. Click &quot;Reset&quot; above to reload sample meetings.
                  </div>
                ) : (
                  meetings.map(meeting => (
                    <div 
                      key={meeting.id} 
                      className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 hover:border-slate-700 transition-all flex flex-wrap items-center justify-between gap-4"
                    >
                      {/* Left: Meeting Info or Rename Field */}
                      <div className="flex-1 min-w-[280px]">
                        {editingMeetingId === meeting.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editTitleInput}
                              onChange={(e) => setEditTitleInput(e.target.value)}
                              className="rounded-lg border border-blue-500 bg-slate-900 px-3 py-1 text-sm text-white focus:outline-none flex-1"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveRename(meeting.id)}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
                            >
                              Save Title
                            </button>
                            <button
                              onClick={() => setEditingMeetingId(null)}
                              className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2.5">
                              <h4 className="text-sm font-bold text-white">{meeting.title}</h4>
                              <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                                {meeting.platform}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                              <span>{meeting.date}</span>
                              <span>•</span>
                              <span>{meeting.duration}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Middle: Retention Status Badge */}
                      <div className="flex items-center">
                        {meeting.isPermanent ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
                            <BookmarkCheck className="h-3.5 w-3.5" />
                            Saved Permanently (Protected)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-medium text-amber-300">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                            Auto-purges in monthly cleanup ({meeting.daysUntilPurge}d left)
                          </span>
                        )}
                      </div>

                      {/* Right: Actions (Rename, Save Permanently, Delete) */}
                      <div className="flex items-center gap-2">
                        {/* Save Permanently Button */}
                        <button
                          onClick={() => handleToggleSaveMeeting(meeting.id)}
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition-all ${
                            meeting.isPermanent
                              ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-white'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-500'
                          }`}
                          title={meeting.isPermanent ? "Unsave (Allow monthly erase)" : "Save permanently to protect from monthly cleanup"}
                        >
                          {meeting.isPermanent ? <BookmarkCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Bookmark className="h-3.5 w-3.5" />}
                          {meeting.isPermanent ? "Saved" : "Save Permanently"}
                        </button>

                        {/* Rename Button */}
                        <button
                          onClick={() => handleStartRename(meeting)}
                          className="flex items-center gap-1 rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                          title="Rename meeting title"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                          Rename
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteMeeting(meeting.id)}
                          className="flex items-center gap-1 rounded-lg bg-rose-950/40 border border-rose-800/40 px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-600 hover:text-white transition-all"
                          title="Delete meeting immediately"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: HINT NOTES & EMAIL */}
          {activeTab === 'notes' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    Feature 3: Hint-Style Notes &amp; Automated Email Delivery
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
                  {emailSent ? "Dispatched to alex.chen@meetmee.internal!" : "Dispatch Email Now"}
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
                    <span>Sub-two-second latency SLA benchmarked and achieved for real-time mentor Q&amp;A HUD.</span>
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
                  💡 Concept Anchors &amp; Hints
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
                      Monthly Retention Rule
                    </span>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      Unsaved meetings are auto-erased every 30 days. Clicking Save Permanently guarantees permanent persistence.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Matrix */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2">
                  📋 Action Items &amp; Ownership Matrix
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

          {/* TAB: COMIC STRIP (Gated: Locked for Free Tier, Unlocked for Monthly ₹99 & Yearly ₹1099) */}
          {activeTab === 'comic' && (
            userPlan === 'free' ? (
              <div className="rounded-2xl border border-pink-500/30 bg-pink-950/20 p-8 text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mx-auto">
                  <Lock className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-white">4-Panel Visual Comic Generator is Locked</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Free Tier accounts do not have access to visual comic storytelling. Upgrade to the <strong>Monthly Plan (₹99/month)</strong> or <strong>Yearly Plan (₹1099/year)</strong> to turn complex meeting discussions into engaging narrative comics.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => handleSelectPlan('monthly')}
                    className="rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold px-5 py-2.5 shadow-lg shadow-pink-600/30 transition-all"
                  >
                    Unlock with Monthly Plan (₹99/mo)
                  </button>
                  <button
                    onClick={() => setActiveTab('pricing')}
                    className="rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold px-4 py-2.5 hover:bg-slate-700"
                  >
                    View All Plans
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Palette className="h-5 w-5 text-pink-400" />
                      Feature 6: 4-Panel Visual Comic Strip Generator
                      <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/30">
                        {userPlan === 'monthly' ? 'Monthly Plan Unlocked' : 'Yearly VIP Unlocked'}
                      </span>
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
            )
          )}

          {/* TAB: MULTILINGUAL PODCAST (Gated: Exclusive to Yearly Plan ₹1099) */}
          {activeTab === 'podcast' && (
            userPlan !== 'yearly' ? (
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-8 text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                  <Crown className="h-7 w-7 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white">NotebookLM Multilingual Podcast Engine is Locked</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Dual-host conversational audio overview generation in your mother tongue is an exclusive feature of the <strong>Yearly VIP Plan (₹1099/year)</strong>.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => handleSelectPlan('yearly')}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold px-5 py-2.5 shadow-lg shadow-amber-500/25 transition-all"
                  >
                    Upgrade to Yearly Plan (₹1099/yr)
                  </button>
                  <button
                    onClick={() => setActiveTab('pricing')}
                    className="rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold px-4 py-2.5 hover:bg-slate-700"
                  >
                    View Plan Comparison
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Headphones className="h-5 w-5 text-indigo-400" />
                      Feature 5: NotebookLM-Style Multilingual Podcast
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                        Yearly VIP Unlocked
                      </span>
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
            )
          )}

          {/* TAB: NATIVE LANGUAGE VOICE ASSISTANT (NEW FEATURE: Exclusive to Yearly Plan ₹1099) */}
          {activeTab === 'assistant' && (
            userPlan !== 'yearly' ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-8 text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <Crown className="h-7 w-7 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Native Language Voice Assistant is Locked</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  The <strong>Native Language Voice Assistant for General Use</strong> (Hindi, Tamil, Telugu, Spanish, French, English) is exclusive to the <strong>Yearly VIP Plan (₹1099/year)</strong>. Upgrade to interact with your personal assistant in your mother tongue for general productivity, prep, and inquiries.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => handleSelectPlan('yearly')}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold px-5 py-2.5 shadow-lg shadow-amber-500/25 transition-all"
                  >
                    Unlock with Yearly Plan (₹1099/yr)
                  </button>
                  <button
                    onClick={() => setActiveTab('pricing')}
                    className="rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold px-4 py-2.5 hover:bg-slate-700"
                  >
                    Compare Tiers
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Mic className="h-5 w-5 text-emerald-400" />
                      Native Language Voice Assistant for General Use
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                        Yearly VIP Feature
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Hands-free conversational assistant answering questions, planning agendas, and managing follow-ups in your mother tongue.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-400">Assistant Language:</span>
                    <select
                      value={assistantLang}
                      onChange={(e) => setAssistantLang(e.target.value)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="hi">Hindi (हिंदी)</option>
                      <option value="ta">Tamil (தமிழ்)</option>
                      <option value="te">Telugu (తెలుగు)</option>
                      <option value="es">Spanish (Español)</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>

                {/* Assistant Chat Stream */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3 max-h-80 overflow-y-auto">
                  {assistantHistory.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`flex gap-3 text-xs leading-relaxed ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {item.role === 'assistant' && (
                        <div className="h-7 w-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                          <Mic className="h-4 w-4" />
                        </div>
                      )}
                      <div className={`rounded-xl p-3 max-w-[80%] ${
                        item.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-900 border border-slate-800 text-slate-200'
                      }`}>
                        {item.text}
                      </div>
                    </div>
                  ))}

                  {isAssistantSpeaking && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>Assistant is formulating speech response in your mother tongue...</span>
                    </div>
                  )}
                </div>

                {/* Assistant Query Input */}
                <form onSubmit={handleAssistantSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={assistantQuery}
                    onChange={(e) => setAssistantQuery(e.target.value)}
                    placeholder="Ask anything in your native language (e.g. अगली मीटिंग का एजेंडा क्या है?)..."
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Speak / Send
                  </button>
                </form>
              </div>
            )
          )}

        </div>

        {/* ========================================================================= */}
        {/* SEPARATE BOTTOM CONTROL & RETENTION POLICY BAR */}
        {/* ========================================================================= */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                System Retention, User Presence &amp; Subscription Policies
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your persistent online identity, automated monthly cleanup policies, and current plan tier.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                Active Tier: {userPlan.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            
            {/* Control 1: Always Online Profile */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-emerald-400" />
                  Cloud Presence Daemon
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Keeps your participant status marked &quot;Online&quot; across Zoom, Microsoft Teams, and Google Meet even if your local network disconnects or your laptop lid is closed.
              </p>
              <div className="pt-2 text-[11px] text-slate-500">
                User ID: <span className="font-mono text-slate-300">{userProfile.id}</span>
              </div>
            </div>

            {/* Control 2: Monthly Auto-Purge Policy */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-amber-400" />
                  Monthly Auto-Erase Policy
                </span>
                <span className="text-[10px] text-amber-300 font-semibold">Every 30 Days</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                All meeting history is automatically wiped clean once a month. To keep a meeting permanently, click the <strong>&quot;Save Permanently&quot;</strong> button on that record.
              </p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Next purge in: <strong>12 days</strong></span>
                <button
                  onClick={handleRunMonthlyPurge}
                  className="rounded bg-rose-900/40 border border-rose-700/50 px-2 py-0.5 text-[10px] font-semibold text-rose-300 hover:bg-rose-600 hover:text-white"
                >
                  Run Now
                </button>
              </div>
            </div>

            {/* Control 3: Subscription Overview */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Crown className="h-4 w-4 text-amber-400" />
                  Subscription Status
                </span>
                <span className="text-[10px] text-amber-400 font-semibold uppercase">{userPlan}</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {userPlan === 'free' && "Free Tier: 3 meetings allowance. Comics & Podcasts locked."}
                {userPlan === 'monthly' && "Monthly Plan: ₹99/mo. 100 meetings + 4-Panel Comics unlocked."}
                {userPlan === 'yearly' && "Yearly Plan: ₹1099/yr. Unlimited meetings + Podcasts + Native Voice AI."}
              </p>
              <button
                onClick={() => setActiveTab('pricing')}
                className="w-full mt-1 rounded-lg bg-blue-600/20 border border-blue-500/30 py-1 text-[11px] font-semibold text-blue-300 hover:bg-blue-600 hover:text-white transition-all text-center"
              >
                Manage / Switch Plan →
              </button>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        MeetMee Corporate Meeting Intelligence Platform • Autonomous Bot Ingestion &amp; Persistent Presence
      </footer>
    </div>
  );
}
