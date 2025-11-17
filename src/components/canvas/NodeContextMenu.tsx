"use client";

import { useState } from "react";

interface NodeContextMenuProps {
  nodeId: string;
  borderColor?: string;
  backgroundColor?: string;
  onBorderColorChange: (nodeId: string, color: string) => void;
  onBackgroundColorChange: (nodeId: string, color: string) => void;
  onCopyNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onClose: () => void;
}

const colorOptions = [
  { name: "Blue", border: "#93C5FD", bg: "#DBEAFE" },
  { name: "Purple", border: "#C4B5FD", bg: "#EDE9FE" },
  { name: "Green", border: "#86EFAC", bg: "#D1FAE5" },
  { name: "Yellow", border: "#FDE047", bg: "#FEF9C3" },
  { name: "Pink", border: "#F9A8D4", bg: "#FCE7F3" },
  { name: "Gray", border: "#D1D5DB", bg: "#E8EAEE" },
];

export default function NodeContextMenu({
  nodeId,
  borderColor = "#D1D5DB",
  backgroundColor = "#E8EAEE",
  onBorderColorChange,
  onBackgroundColorChange,
  onCopyNode,
  onDeleteNode,
  onClose,
}: NodeContextMenuProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="absolute -top-8 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-1 flex items-center gap-1">
      {/* Color circles */}
      <div className="flex items-center gap-0.5">
        {colorOptions.map((color) => (
          <button
            key={color.name}
            onClick={() => {
              onBorderColorChange(nodeId, color.border);
              onBackgroundColorChange(nodeId, color.bg);
            }}
            className="w-3 h-3 rounded-full border transition-transform hover:scale-125"
            style={{
              borderColor: color.border,
              backgroundColor: color.bg,
            }}
            title={color.name}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-3 bg-gray-300" />

      {/* Copy Button */}
      <button
        onClick={() => {
          onCopyNode(nodeId);
          onClose();
        }}
        className="p-0.5 rounded hover:bg-gray-100 transition-colors"
        title="Copy node"
      >
        <svg
          className="w-3 h-3 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </button>

      {/* Delete Button */}
      <button
        onClick={() => {
          onDeleteNode(nodeId);
          onClose();
        }}
        className="p-0.5 rounded hover:bg-red-50 transition-colors"
        title="Delete node"
      >
        <svg
          className="w-3 h-3 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="p-0.5 rounded hover:bg-gray-100 transition-colors"
        title="Close menu"
      >
        <svg
          className="w-3 h-3 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
