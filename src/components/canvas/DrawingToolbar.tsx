"use client";

interface DrawingToolbarProps {
  drawingColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  onDone: () => void;
}

export default function DrawingToolbar({
  drawingColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onDone,
}: DrawingToolbarProps) {
  const colors = [
    { id: "black", value: "#000000", label: "Black" },
    { id: "red", value: "#EF4444", label: "Red" },
    { id: "blue", value: "#3B82F6", label: "Blue" },
    { id: "green", value: "#10B981", label: "Green" },
    { id: "purple", value: "#8B5CF6", label: "Purple" },
    { id: "orange", value: "#F97316", label: "Orange" },
  ];

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30">
      <div className="bg-white/40 backdrop-blur-xl border border-gray-300/50 rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-4">
          {/* Color Picker */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-gray-700">
              Color
            </label>
            <div className="flex gap-1">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onColorChange(color.value)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    drawingColor === color.value
                      ? "border-gray-700 scale-110"
                      : "border-gray-300 hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-12 bg-gray-300/50" />

          {/* Stroke Width */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-gray-700">
              Width: {strokeWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={strokeWidth}
              onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
              className="w-24"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-12 bg-gray-300/50" />

          {/* Done Button */}
          <button
            onClick={onDone}
            className="p-2 rounded-lg text-white transition-colors"
            style={{ backgroundColor: '#0192c6' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#017aa3'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0192c6'}
            title="Exit drawing mode"
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
