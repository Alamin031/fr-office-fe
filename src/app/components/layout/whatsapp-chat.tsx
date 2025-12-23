"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801343159931";
const DEFAULT_MESSAGE = "Hi! I need help with my order.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
const ICONS = ["/image/w1.png", "/image/w3.png"];

export function WhatsappChat() {
  const [iconIndex, setIconIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(true);
  const [showButton, setShowButton] = useState(true);

  // No SSR gating needed since we don't reference window at render

  useEffect(() => {
    const id = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % ICONS.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Auto close the help bubble after 5 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowBubble(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // Render directly; click handler uses window only on interaction

  return (
    <div
      className="fixed z-40 right-4 bottom-24 flex flex-col items-end gap-3 select-none"
    >
      {showBubble && (
        <div
          className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-white/95 px-3 py-2 text-sm shadow-md backdrop-blur"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
          <div className="leading-tight flex-1">
            <div className="font-semibold text-foreground">Need help?</div>
            <div className="text-muted-foreground">Chat on WhatsApp</div>
          </div>
        </div>
      )}

      {showButton && (
        <div
          onClick={() => {
            window.open(WHATSAPP_URL, '_blank');
          }}
          className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-r from-emerald-500 to-green-600 text-white shadow-lg transition-transform duration-200 hover:scale-[1.03] hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          <div className="relative w-full h-full flex items-center justify-center rounded-full">
            <Image
              src={ICONS[iconIndex]}
              alt="WhatsApp"
              width={74}
              height={74}
              className="h-full w-full rounded-full object-cover absolute"
              priority
            />
          </div>
          <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-white" aria-hidden="true" />
          <button
            aria-label="Close WhatsApp button"
            onClick={(e) => {
              e.stopPropagation();
              setShowButton(false);
            }}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border shadow flex items-center justify-center text-foreground hover:bg-gray-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <span className="sr-only">Chat on WhatsApp</span>
        </div>
      )}
    </div>
  );
}
