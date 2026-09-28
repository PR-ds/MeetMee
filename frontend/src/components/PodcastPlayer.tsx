"use client";

import React, { useState } from "react";
import { Play, Pause, Volume2, Globe, Sparkles, Headphones, RefreshCw } from "lucide-react";

interface DialogueTurn {
  speaker: string;
  text: string;
}

export function PodcastPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [progress, setProgress] = useState(35);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const languages = [
    { code: "en", label: "English" },
    { code: "es", label: "Spanish (Español)" },
    { code: "hi", label: "Hindi (हिंदी)" },
    { code: "fr", label: "French (Français)" },
    { code: "de", label: "German (Deutsch)" },
    { code: "zh", label: "Mandarin (中文)" },
  ];

  const dialogueScripts: Record<string, DialogueTurn[]> = {
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

  const currentScript = dialogueScripts[selectedLanguage] || dialogueScripts["en"];

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    setIsRegenerating(true);
    setTimeout(() => setIsRegenerating(false), 800);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Headphones className="h-5 w-5 text-indigo-400" />
            NotebookLM-Style Conversational Podcast
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            2-host conversational dialogue synthesized in your mother tongue with ambient music stems
          </p>
        </div>

        {/* Mother Tongue Selector */}
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-400">Mother Tongue:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audio Player Controls */}
      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 transition-transform hover:scale-105 active:scale-95"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-medium text-slate-200">
                MeetMee Deep Dive: Sprint Review ({languages.find(l => l.code === selectedLanguage)?.label})
              </span>
              <span className="font-mono">01:14 / 03:25</span>
            </div>

            {/* Simulated Audio Waveform Bar */}
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <Volume2 className="h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Interactive Transcript Dialogue Display */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            Dialogue Script Transcript
          </h4>
          {isRegenerating && (
            <span className="text-xs text-blue-400 flex items-center gap-1 animate-spin">
              <RefreshCw className="h-3 w-3" />
            </span>
          )}
        </div>

        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {currentScript.map((turn, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-3 border text-xs leading-relaxed transition-all ${
                turn.speaker === "Host_A"
                  ? "border-blue-500/20 bg-blue-950/20 text-blue-100"
                  : "border-indigo-500/20 bg-indigo-950/20 text-indigo-100"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    turn.speaker === "Host_A"
                      ? "bg-blue-600/30 text-blue-300"
                      : "bg-indigo-600/30 text-indigo-300"
                  }`}
                >
                  {turn.speaker === "Host_A" ? "🎙️ Host A (Inquirer)" : "💡 Host B (Expert)"}
                </span>
              </div>
              <p>{turn.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
