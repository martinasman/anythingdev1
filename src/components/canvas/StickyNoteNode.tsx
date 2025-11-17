"use client";

import { memo, useState, useRef, useEffect } from "react";
import type { NodeProps } from "@xyflow/react";

export interface StickyNoteData {
  content: string;
  color: string;
  createdAt: string;
}

function StickyNoteNodeComponent({ id, data }: NodeProps<StickyNoteData>) {
  const [content, setContent] = useState(data.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  // Auto-focus on mount if empty
  useEffect(() => {
    if (!data.content && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [data.content]);

  const handleDelete = () => {
    if (window.deleteNode) {
      window.deleteNode(id);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Update node data
    if (window.updateStickyNoteContent) {
      window.updateStickyNoteContent(id, e.target.value);
    }
  };

  // Color presets for sticky notes
  const colorClasses: Record<string, string> = {
    yellow: "bg-yellow-200 border-yellow-300",
    pink: "bg-pink-200 border-pink-300",
    blue: "bg-blue-200 border-blue-300",
    green: "bg-green-200 border-green-300",
    purple: "bg-purple-200 border-purple-300",
    orange: "bg-orange-200 border-orange-300",
  };

  const colorClass = colorClasses[data.color] || colorClasses.yellow;

  return (
    <div
      className={`${colorClass} border-2 shadow-lg rounded-sm p-3 w-[200px] h-[200px] flex flex-col cursor-move relative`}
      style={{
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.4)',
      }}
    >
      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-colors"
        title="Delete sticky note"
      >
        ×
      </button>

      {/* Content textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        placeholder="Type your note here..."
        className="w-full h-full bg-transparent resize-none focus:outline-none text-sm font-handwriting placeholder-gray-500 overflow-hidden"
        style={{
          fontFamily: '"Segoe Print", "Comic Sans MS", cursive',
        }}
      />

      {/* Decorative fold in corner */}
      <div
        className="absolute bottom-0 right-0 w-0 h-0"
        style={{
          borderLeft: '20px solid transparent',
          borderBottom: `20px solid ${data.color === 'yellow' ? '#fef08a' : data.color === 'pink' ? '#fbcfe8' : data.color === 'blue' ? '#bfdbfe' : data.color === 'green' ? '#bbf7d0' : data.color === 'purple' ? '#e9d5ff' : '#fed7aa'}`,
          opacity: 0.6,
        }}
      />
    </div>
  );
}

export default memo(StickyNoteNodeComponent);
