import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeetMee — AI Corporate Meeting Intelligence",
  description: "Autonomous meeting attendance, real-time mentor Q&A HUD, instant summaries, multilingual podcasts & visual comics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
