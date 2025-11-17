"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import FlowingGradient from "@/components/canvas/FlowingGradient";
import SplashScreen from "@/components/SplashScreen";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Sidebar items
const projects = [
  { id: "1", name: "Image Creation", type: "project" },
  { id: "2", name: "Bot Creation", type: "project" },
  { id: "3", name: "Lens Chat", type: "project" },
];

const canvases = [
  { id: "4", name: "Framer Site", type: "canvas" },
  { id: "5", name: "Flutter Website", type: "canvas" },
  { id: "6", name: "Welcome to flowith 2.0: Whe...", type: "canvas" },
  { id: "7", name: "new conversation", type: "canvas" },
];

// Example prompts
const examplePrompts = [
  {
    id: "1",
    prompt: "Create a modern landing page for a SaaS product",
    description: "Generate a professional website design with hero section and features",
    color: "from-white to-white border-gray-300",
  },
  {
    id: "2",
    prompt: "Build a task management app with React",
    description: "Create a full-featured todo app with drag-and-drop functionality",
    color: "from-white to-white border-gray-300",
  },
  {
    id: "3",
    prompt: "Design a dashboard with charts and analytics",
    description: "Build an interactive admin panel with data visualizations",
    color: "from-white to-white border-gray-300",
  },
];

export default function LandingPage() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agentMode, setAgentMode] = useState(false);
  const [model, setModel] = useState("grok4");
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const router = useRouter();

  const handleStart = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    sessionStorage.setItem("initialPrompt", prompt);

    // Delay navigation to show splash screen for 4 seconds
    setTimeout(() => {
      router.push("/canvas");
    }, 4000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleStart();
    }
  };

  return (
    <div className="flex h-screen bg-background relative">
      {/* Splash Screen during navigation */}
      {isLoading && <SplashScreen show={true} />}

      {/* Flowing Gradient Background */}
      <FlowingGradient />

      {/* Sidebar */}
      <aside className={`w-64 h-full bg-white/40 backdrop-blur-xl border-r border-white/30 relative z-20 flex flex-col transition-transform duration-300 ${!sidebarVisible ? '-translate-x-full' : ''}`}>
        {/* Logo/Brand */}
        <div className="p-6 pl-9">
          <img
            src="/anythingLogoMark.png"
            alt="Anything Logo"
            className="h-8 w-auto"
          />
        </div>

        {/* Project History */}
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-4">
            {/* New Project Button */}
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-white/30 hover:bg-white/50 transition-colors font-sans font-medium">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Project
            </button>

            {/* Projects Section */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide font-sans">
                Projects
              </div>
              {projects.map((project) => (
                <button
                  key={project.id}
                  className="w-full flex items-center gap-3 px-6 py-2 text-sm rounded-lg hover:bg-white/50 transition-colors text-left font-sans"
                >
                  <span className="flex-1 truncate">
                    {project.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Canvases Section */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide font-sans">
                Recent Canvases
              </div>
              {canvases.map((canvas) => (
                <button
                  key={canvas.id}
                  className="w-full flex items-center gap-3 px-6 py-2 text-sm rounded-lg hover:bg-white/50 transition-colors text-left font-sans"
                >
                  <span className="flex-1 truncate">
                    {canvas.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* Account Details at Bottom */}
        <div className="p-3 border-t border-white/30">
          <button className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/50 transition-colors">
            {/* Profile Picture */}
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium font-sans" style={{ background: 'linear-gradient(to bottom right, #0192c6, #017aa3)' }}>
              M
            </div>
            {/* Account Info */}
            <div className="flex-1 text-left">
              <div className="text-xs font-medium font-sans" style={{ color: '#333333' }}>
                My Account
              </div>
              <div className="text-[10px] text-muted-foreground font-sans">
                View profile
              </div>
            </div>
          </button>
        </div>
      </aside>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarVisible(!sidebarVisible)}
        className={`fixed top-4 z-30 p-2 rounded-lg bg-white/70 backdrop-blur-xl border border-white/30 hover:bg-white/90 transition-all ${sidebarVisible ? 'left-[272px]' : 'left-4'}`}
      >
        <svg
          className="w-5 h-5 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {sidebarVisible ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          )}
        </svg>
      </button>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* Content Area */}
        <div className="flex-1 flex items-center p-8 ml-[-180px]">
          <div className="w-full max-w-xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Heading */}
              <div className="space-y-2 text-left">
                <h2 className="text-3xl font-normal tracking-tight" style={{ color: '#333333' }}>
                  Ask anything to do anything
                </h2>
                <p className="text-sm text-muted-foreground font-sans">
                  your new way of interacting with multimodal ai
                </p>
              </div>

              {/* Input Area */}
              <div className="relative">
                <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-lg p-4 pr-14 min-h-[120px]">
                  <textarea
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    disabled={isLoading}
                    className="w-full bg-transparent text-sm focus:outline-none resize-none font-sans overflow-hidden"
                    rows={1}
                    style={{ minHeight: 'auto', height: 'auto' }}
                  />

                  {/* Submit button - bottom right */}
                  <button
                    onClick={handleStart}
                    disabled={!prompt.trim() || isLoading}
                    className="absolute bottom-3 right-3 p-1.5 rounded-lg disabled:bg-gray-400 transition-colors text-white"
                    style={{ backgroundColor: !prompt.trim() || isLoading ? undefined : '#0192c6' }}
                    onMouseEnter={(e) => !(!prompt.trim() || isLoading) && (e.currentTarget.style.backgroundColor = '#017aa3')}
                    onMouseLeave={(e) => !(!prompt.trim() || isLoading) && (e.currentTarget.style.backgroundColor = '#0192c6')}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Example Prompts */}
              <div className="grid grid-cols-3 gap-3">
                {examplePrompts.map((example) => (
                  <button
                    key={example.id}
                    onClick={() => setPrompt(example.prompt)}
                    className={`p-4 rounded-xl border-2 bg-gradient-to-br backdrop-blur-xl ${example.color} hover:scale-105 transition-all text-left group`}
                  >
                    <div className="space-y-2">
                      <div className="text-sm font-medium font-sans text-gray-800 line-clamp-2">
                        {example.prompt}
                      </div>
                      <div className="text-xs text-gray-600 font-sans line-clamp-2">
                        {example.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
