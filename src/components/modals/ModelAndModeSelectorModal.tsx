"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Model {
  id: string;
  name: string;
  category: "advanced" | "basic";
  icon?: string;
}

interface Mode {
  id: string;
  name: string;
  icon?: string;
}

interface ModelAndModeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: string;
  currentModel: string;
  onModeChange: (mode: string) => void;
  onModelChange: (model: string) => void;
}

const modes: Mode[] = [
  { id: "regular", name: "Regular", icon: "◇" },
  { id: "online-search", name: "Online Search", icon: "⊕" },
  { id: "image-video", name: "Image/Video", icon: "▢" },
  { id: "prompt-enhance", name: "Prompt Enhance", icon: "✦" },
  { id: "comparison", name: "Comparison", icon: "≋" },
  { id: "business-mode", name: "Business Mode", icon: "◈" },
  { id: "agent-mode", name: "Agent Mode", icon: "⚡" },
];

const models: Model[] = [
  // OpenAI GPT Models (Advanced)
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", category: "advanced", icon: "⊛" },
  { id: "gpt-4", name: "GPT-4", category: "advanced", icon: "⊛" },

  // Claude Models (Advanced)
  { id: "claude-sonnet-3.5", name: "Claude Sonnet 3.5", category: "advanced", icon: "◉" },
  { id: "claude-opus-3", name: "Claude Opus 3", category: "advanced", icon: "◉" },

  // Google Gemini Models (Basic)
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", category: "basic", icon: "◐" },
  { id: "gemini-pro", name: "Gemini Pro", category: "basic", icon: "◐" },

  // OpenAI GPT Models (Basic)
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", category: "basic", icon: "⊛" },
];

export default function ModelAndModeSelectorModal({
  isOpen,
  onClose,
  currentMode,
  currentModel,
  onModeChange,
  onModelChange,
}: ModelAndModeSelectorModalProps) {
  const [selectedMode, setSelectedMode] = useState(currentMode);
  const [selectedModel, setSelectedModel] = useState(currentModel);
  const [activeTab, setActiveTab] = useState<"advanced" | "basic">("advanced");

  if (!isOpen) return null;

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId);
    onModeChange(modeId);
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    onModelChange(modelId);
    onClose();
  };

  const advancedModels = models.filter((m) => m.category === "advanced");
  const basicModels = models.filter((m) => m.category === "basic");

  return (
    <>
      {/* Backdrop - transparent, just for click detection */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Compact Modal */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[280px] bg-white/95 backdrop-blur-xl rounded-lg border border-gray-300 shadow-2xl">
        <div className="flex">
          {/* Left Sidebar - Modes */}
          <div className="w-36 border-r border-white">
            <div className="p-2 border-b border-white">
              <h3 className="text-[10px] font-semibold text-gray-600 uppercase px-2">
                Mode & Models
              </h3>
            </div>
            <div className="py-1">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] transition-colors text-left ${
                    selectedMode === mode.id
                      ? "text-gray-900 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="text-xs">{mode.icon}</span>
                  <span className="flex-1">{mode.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Model Selection */}
          <div className="flex-1 flex flex-col max-h-[280px]">
            {/* Tabs */}
            <div className="flex gap-3 p-2 px-3 border-b border-white">
              <button
                onClick={() => setActiveTab("advanced")}
                className={`text-[10px] font-semibold uppercase transition-colors ${
                  activeTab === "advanced"
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Advanced
              </button>
              <button
                onClick={() => setActiveTab("basic")}
                className={`text-[10px] font-semibold uppercase transition-colors ${
                  activeTab === "basic"
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Basic
              </button>
            </div>

            {/* Model List */}
            <ScrollArea className="flex-1 py-1">
              <div className="pr-1">
                {(activeTab === "advanced" ? advancedModels : basicModels).map(
                  (model) => (
                    <button
                      key={model.id}
                      onClick={() => handleModelSelect(model.id)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] transition-colors text-left ${
                        selectedModel === model.id
                          ? "text-gray-900 bg-gray-200 font-medium"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-xs">{model.icon}</span>
                      <span className="flex-1">{model.name}</span>
                    </button>
                  )
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </>
  );
}
