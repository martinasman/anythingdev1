"use client";

import { useState } from "react";

interface TopToolbarProps {
  isDrawingMode: boolean;
  isEraserMode: boolean;
  onToggleDrawing: (enable?: boolean) => void;
  onToggleEraser: () => void;
  onCreateStickyNote: () => void;
  canvasBackground: string;
  onBackgroundChange: (bg: string) => void;
}

export default function TopToolbar({
  isDrawingMode,
  isEraserMode,
  onToggleDrawing,
  onToggleEraser,
  onCreateStickyNote,
  canvasBackground,
  onBackgroundChange,
}: TopToolbarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const backgroundOptions = [
    { id: "default", label: "Default", gradient: "from-gray-100 via-white to-gray-200" },
    { id: "ocean", label: "Ocean", gradient: "from-blue-400 via-cyan-500 to-teal-500" },
    { id: "sunset", label: "Sunset", gradient: "from-slate-700 via-cyan-400 to-amber-200" },
    { id: "sunrise", label: "Sunrise", gradient: "from-amber-400 via-cyan-400 to-teal-600" },
  ];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30">
      <div className="backdrop-blur-xl border border-gray-300/50 rounded-lg shadow-lg flex items-center gap-1 p-1" style={{ backgroundColor: 'rgba(239, 235, 226, 0.4)' }}>
        {/* Selection/Normal Mode Button */}
        <button
          onClick={() => onToggleDrawing(false)}
          className={`p-2 rounded-lg transition-all ${
            !isDrawingMode
              ? "text-white shadow-md"
              : "hover:opacity-80 text-gray-700"
          }`}
          style={!isDrawingMode ? { backgroundColor: '#0192c6' } : undefined}
          title="Selection Mode (Normal)"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
            />
          </svg>
        </button>

        {/* Pen/Drawing Tool Button */}
        <button
          onClick={() => onToggleDrawing(true)}
          className={`p-2 rounded-lg transition-all ${
            isDrawingMode && !isEraserMode
              ? "text-white shadow-md"
              : "hover:opacity-80 text-gray-700"
          }`}
          style={isDrawingMode && !isEraserMode ? { backgroundColor: '#0192c6' } : undefined}
          title="Drawing Tool (Pen)"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>

        {/* Eraser Tool Button */}
        <button
          onClick={onToggleEraser}
          className={`p-2 rounded-lg transition-all ${
            isEraserMode
              ? "text-white shadow-md"
              : "hover:opacity-80 text-gray-700"
          }`}
          style={isEraserMode ? { backgroundColor: '#0192c6' } : undefined}
          title="Eraser Tool"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0M4.22 15.58l3.54 3.53c.78.79 2.04.79 2.83 0l3.53-3.53l-4.95-4.95l-4.95 4.95z"
            />
          </svg>
        </button>

        {/* Sticky Note Button */}
        <button
          onClick={onCreateStickyNote}
          className="p-2 rounded-lg hover:opacity-80 text-gray-700 transition-all"
          title="Create Sticky Note"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300/50" />

        {/* Settings Button */}
        <div className="relative">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-2 rounded-lg hover:opacity-80 text-gray-700 transition-all"
            title="Canvas Settings"
          >
            <svg
              className="w-5 h-5"
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
          </button>

          {/* Settings Dropdown */}
          {isSettingsOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white/40 backdrop-blur-xl border border-gray-300/50 rounded-lg shadow-lg p-3 min-w-[200px]">
              <div className="text-xs font-medium text-gray-700 mb-2">
                Canvas Background
              </div>
              <div className="space-y-1">
                {backgroundOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      onBackgroundChange(option.id);
                      setIsSettingsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                      canvasBackground === option.id
                        ? "bg-white/60 text-gray-900 font-medium"
                        : "hover:bg-white/40 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded bg-gradient-to-r ${option.gradient}`}
                      />
                      {option.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
