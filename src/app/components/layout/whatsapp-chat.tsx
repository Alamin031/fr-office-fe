"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { X, GripHorizontal } from "lucide-react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801343159931";
const DEFAULT_MESSAGE = "Hi! I need help with my order.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
const ICONS = ["/image/w1.png", "/image/w3.png"];
const STORAGE_KEY = "whatsapp-chat-position";

export function WhatsappChat() {
  const [iconIndex, setIconIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load saved position from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPosition(JSON.parse(saved));
      } catch (e) {
        // Reset to default if corrupted
        setPosition({ x: 0, y: 0 });
      }
    } else {
      // Set default position (right: 1rem, bottom: 6rem)
      setPosition({ x: 0, y: 0 });
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Constrain position to viewport
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 80;

      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));

      setPosition({ x: constrainedX, y: constrainedY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Save position to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, position]);

  useEffect(() => {
    const id = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % ICONS.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed z-40 flex flex-col items-end gap-3 select-none"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? "grabbing" : "grab",
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
