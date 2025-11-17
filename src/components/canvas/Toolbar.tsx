"use client";

import { useState } from "react";

interface ToolbarProps {
  onBackgroundChange: (background: string) => void;
  currentBackground: string;
}

const backgroundOptions = [
  { name: "Default", value: "default", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Ocean", value: "ocean", gradient: "linear-gradient(135deg, #667eea 0%, #06b6d4 100%)" },
  { name: "Sunset", value: "sunset", gradient: "linear-gradient(135deg, #f97316 0%, #dc2626 100%)" },
  { name: "Forest", value: "forest", gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
  { name: "Lavender", value: "lavender", gradient: "linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)" },
  { name: "Monochrome", value: "monochrome", gradient: "linear-gradient(135deg, #6b7280 0%, #374151 100%)" },
  { name: "Shrek", value: "shrek", gradient: "linear-gradient(135deg, #7cb342 0%, #558b2f 100%)" },
];

export default function Toolbar({ onBackgroundChange, currentBackground }: ToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-4 left-4 z-30">
      <div className="bg-white/40 backdrop-blur-xl border border-gray-300/50 rounded-lg shadow-lg">
        {/* Toolbar Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-white/20 transition-colors rounded-lg flex items-center gap-2"
          title="Canvas Settings"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700">Canvas</span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-300/50 rounded-lg shadow-lg p-3 min-w-[200px]">
            <div className="mb-2">
              <p className="text-xs font-medium text-gray-600 mb-2">Background Style</p>
              <div className="flex flex-col gap-1">
                {backgroundOptions.map((bg) => (
                  <button
                    key={bg.value}
                    onClick={() => {
                      onBackgroundChange(bg.value);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors ${
                      currentBackground === bg.value ? "bg-gray-100" : ""
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ background: bg.gradient }}
                    />
                    <span className="text-xs text-gray-700">{bg.name}</span>
                    {currentBackground === bg.value && (
                      <svg
                        className="w-4 h-4 text-blue-500 ml-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
