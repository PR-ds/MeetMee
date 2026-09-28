"use client";

import React from "react";
import { LiveHUD } from "@/components/LiveHUD";

export default function HUDWindowPage() {
  return (
    <div className="min-h-screen bg-slate-950/90 p-4 flex items-center justify-center">
      <LiveHUD />
    </div>
  );
}
