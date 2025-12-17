"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801343159931";
const DEFAULT_MESSAGE = "Hi! I need help with my order.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
const ICONS = ["/image/w1.png", "/image/w2.png", "/image/w3.png", "/image/w4.png"];

export function WhatsappChat() {
  const [iconIndex, setIconIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % ICONS.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed right-4 md:right-6 bottom-24 md:bottom-5 z-40 flex flex-col items-end gap-3">
      <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-white/95 px-3 py-2 text-sm shadow-md backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
        <div className="leading-tight">
          <div className="font-semibold text-foreground">Need help?</div>
          <div className="text-muted-foreground">Chat on WhatsApp</div>
        </div>
      </div>

      <Link
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg transition-transform duration-200 hover:scale-[1.03] hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
      >
        <Image
          src={ICONS[iconIndex]}
          alt="WhatsApp"
          width={74}
          height={74}
          className="h-full w-full rounded-full object-cover"
          priority
        />
        <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-white" aria-hidden="true" />
        <span className="sr-only">WhatsApp</span>
      </Link>
    </div>
  );
}
