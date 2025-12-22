"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { X, GripHorizontal, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801343159931";
const DEFAULT_MESSAGE = "Hi! I need help with my order.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
const ICONS = ["/image/w1.png", "/image/w3.png"];
const STORAGE_KEY = "whatsapp-chat-position";

export function WhatsappChat() {
  const [iconIndex, setIconIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Load saved position from localStorage or set default
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPosition(JSON.parse(saved));
      } catch (e) {
        // Reset to default if corrupted
        const defaultX = Math.max(0, window.innerWidth - 100);
        const defaultY = Math.max(0, window.innerHeight - 150);
        setPosition({ x: defaultX, y: defaultY });
      }
    } else {
      // Set default position (right: 1rem, bottom: 6rem)
      const defaultX = Math.max(0, window.innerWidth - 100);
      const defaultY = Math.max(0, window.innerHeight - 150);
      setPosition({ x: defaultX, y: defaultY });
    }
  }, []);

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const positionRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!position) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  // Setup global mouse move and mouse up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragStartRef.current || !positionRef.current) return;

      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;

      // Constrain position to viewport
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 80;

      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));

      setPosition({ x: constrainedX, y: constrainedY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
      // Save position to localStorage
      if (positionRef.current) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(positionRef.current));
      }
    };

    // Always attach listeners when component mounts
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % ICONS.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Don't render on server
  if (!mounted) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed z-40 flex flex-col items-end gap-3 select-none"
      style={position ? {
        right: `${window.innerWidth - position.x - 80}px`,
        bottom: `${window.innerHeight - position.y - 80}px`,
        cursor: isDragging ? "grabbing" : "grab",
      } : {
        right: "16px",
        bottom: "96px",
        cursor: "grab",
      }}
    >
      {showBubble && (
        <div
          className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-white/95 px-3 py-2 text-sm shadow-md backdrop-blur"
          onMouseDown={handleMouseDown}
        >
          <GripHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
          <div className="leading-tight flex-1">
            <div className="font-semibold text-foreground">Need help?</div>
            <div className="text-muted-foreground">Chat on WhatsApp</div>
          </div>
          <button
            onClick={() => setShowBubble(false)}
            aria-label="Close"
            className="ml-2 p-0.5 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>
        </div>
      )}

      <div
        onMouseDown={handleMouseDown}
        onClick={() => {
          if (!isDragging) {
            window.open(WHATSAPP_URL, '_blank');
          }
        }}
        className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg transition-transform duration-200 hover:scale-[1.03] hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 cursor-grab hover:cursor-grab"
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
          <MessageCircle className="h-8 w-8 relative z-10 text-white" strokeWidth={1.5} />
        </div>
        <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-white" aria-hidden="true" />
        <span className="sr-only">Chat on WhatsApp</span>
      </div>
    </div>
  );
}
