"use client";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ConversationNodeData } from "@/types/canvas";
import NodeContextMenu from "./NodeContextMenu";

function ConversationNodeComponent({ id, data, selected }: NodeProps<ConversationNodeData>) {
  const [showMenu, setShowMenu] = useState(false);

  const borderColor = data.borderColor;
  const backgroundColor = data.backgroundColor;

  // Function to darken a hex color
  const darkenColor = (color: string, percent: number = 30) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const newR = Math.max(0, Math.floor(r * (1 - percent / 100)));
    const newG = Math.max(0, Math.floor(g * (1 - percent / 100)));
    const newB = Math.max(0, Math.floor(b * (1 - percent / 100)));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  const displayBorderColor = selected ? darkenColor(borderColor) : borderColor;

  // Get the handlers from window object (will be set by Canvas component)
  const handleBorderColorChange = (nodeId: string, color: string) => {
    if (window.updateNodeBorderColor) {
      window.updateNodeBorderColor(nodeId, color);
    }
  };

  const handleBackgroundColorChange = (nodeId: string, color: string) => {
    if (window.updateNodeBackgroundColor) {
      window.updateNodeBackgroundColor(nodeId, color);
    }
  };

  const handleCopyNode = (nodeId: string) => {
    if (window.copyNode) {
      window.copyNode(nodeId);
    }
  };

  const handleDeleteNode = (nodeId: string) => {
    if (window.deleteNode) {
      window.deleteNode(nodeId);
    }
  };

  const handleClick = () => {
    setShowMenu(!showMenu);
  };

  // Check if this is an AI response node (has assistant messages)
  const isAINode = data.messages.some(msg => msg.role === "assistant");

  return (
    <div
      className={`border shadow-lg rounded-2xl p-3 relative cursor-pointer ${
        data.isBusinessTitle ? 'w-[600px]' : isAINode ? 'w-[500px]' : 'w-[225px]'
      }`}
      style={{
        backgroundColor,
        borderColor: displayBorderColor,
        borderWidth: '1px',
        borderStyle: 'solid'
      }}
      onClick={handleClick}
    >
      {/* Target handle for incoming connections from top */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ opacity: 0 }}
      />

      {/* Source handle for outgoing connections from bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ opacity: 0 }}
      />

      <div className="rounded-lg text-xs font-sans flex flex-col gap-3">
        {data.messages.length > 0 ? (
          data.messages.map((message) => (
            <div key={message.id} className="flex flex-col gap-4">
              <div
                className="px-4 pt-4"
                style={{
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {/* Step number badge for business mode */}
                {data.stepNumber && (
                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] font-bold mb-2 mr-2">
                    {data.stepNumber}
                  </div>
                )}
                {message.content}
              </div>

              {/* Generated Image section for image-video mode */}
              {(() => {
                const imageUrl = message.imageUrl;
                console.log("[ConversationNode] message.imageUrl:", imageUrl ? imageUrl.substring(0, 50) + "..." : "undefined");

                // Validate imageUrl format before attempting to render
                if (!imageUrl) return null;
                if (!imageUrl.startsWith("data:image/")) {
                  console.error("[ConversationNode] Invalid imageUrl format:", imageUrl.substring(0, 50));
                  return (
                    <div className="mt-2 px-4 pb-4">
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                        <p className="text-[10px] text-red-600">Failed to load image: Invalid image data format</p>
                      </div>
                    </div>
                  );
                }
                if (imageUrl.length < 100) {
                  console.error("[ConversationNode] ImageUrl too short:", imageUrl.length);
                  return (
                    <div className="mt-2 px-4 pb-4">
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                        <p className="text-[10px] text-red-600">Failed to load image: Image data incomplete</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="mt-2 px-4 pb-4">
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt="Generated content"
                        className="w-full h-auto block"
                        onError={(e) => {
                          console.error("[ConversationNode] Image failed to load:", imageUrl.substring(0, 100));
                          // Replace image with error message
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="bg-red-50 p-3"><p class="text-[10px] text-red-600">Failed to load image: Image rendering error</p></div>';
                          }
                        }}
                        onLoad={() => {
                          console.log("[ConversationNode] Image loaded successfully, size:", imageUrl.length);
                        }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Sources section for online search results */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 px-4">
                  <div className="text-[8px] font-semibold text-gray-500 mb-1.5">
                    SOURCES
                  </div>
                  <div className="flex flex-col gap-1">
                    {message.sources.map((source, idx) => {
                      // Extract domain from URL for favicon
                      const getDomain = (url: string) => {
                        try {
                          const urlObj = new URL(url);
                          return urlObj.hostname;
                        } catch {
                          return '';
                        }
                      };
                      const domain = getDomain(source.url);
                      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

                      return (
                        <a
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[8px] text-blue-600 hover:text-blue-800 hover:underline flex items-start gap-1.5 group"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="w-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img
                              src={faviconUrl}
                              alt=""
                              className="w-3 h-3 object-contain"
                              onError={(e) => {
                                // Fallback to generic globe icon if favicon fails
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = '<svg class="w-2.5 h-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
                              }}
                            />
                          </div>
                          <span className="flex-1 line-clamp-2">
                            {source.title}
                          </span>
                          <svg
                            className="w-2 h-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Profile section - different for user vs AI */}
              <div className="flex items-center gap-1 px-4 pb-4">
                {message.role === "user" ? (
                  <>
                    <div className="w-3 h-3 rounded-full flex items-center justify-center text-white text-[6px] font-medium" style={{ background: 'linear-gradient(to bottom right, #0192c6, #017aa3)' }}>
                      M
                    </div>
                    <span className="text-[8px] font-medium text-gray-600">me</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-[6px] font-medium">
                      AI
                    </div>
                    <span className="text-[8px] font-medium text-gray-600">
                      {data.model || "GPT-4"} • {data.mode || "Regular"}
                    </span>
                    {data.mode === "Online Search" && (
                      <span className="text-[7px] px-1 py-0.5 bg-blue-100 text-blue-700 rounded">
                        🔍 Live
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col gap-4 px-4 pt-4">
            <div
              style={{
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap'
              }}
            >
              Start a new conversation...
            </div>

            {/* Profile section */}
            <div className="flex items-center gap-1 pb-4">
              <div className="w-3 h-3 rounded-full flex items-center justify-center text-white text-[6px] font-medium" style={{ background: 'linear-gradient(to bottom right, #0192c6, #017aa3)' }}>
                M
              </div>
              <span className="text-[8px] font-medium text-gray-600">me</span>
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {showMenu && (
        <NodeContextMenu
          nodeId={id}
          borderColor={borderColor}
          backgroundColor={backgroundColor}
          onBorderColorChange={handleBorderColorChange}
          onBackgroundColorChange={handleBackgroundColorChange}
          onCopyNode={handleCopyNode}
          onDeleteNode={handleDeleteNode}
          onClose={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}

export default memo(ConversationNodeComponent);
