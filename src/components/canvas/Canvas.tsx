"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nanoid } from "nanoid";
import ConversationNode from "./ConversationNode";
import PreviewNode from "./PreviewNode";
import StickyNoteNode from "./StickyNoteNode";
import FlowingGradient from "./FlowingGradient";
import TopToolbar from "./TopToolbar";
import DrawingLayer from "./DrawingLayer";
import DrawingToolbar from "./DrawingToolbar";
import StraightEdge from "./StraightEdge";
import type { CanvasNode, StickyNoteData, DrawingPath, Point } from "@/types/canvas";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ModelAndModeSelectorModal from "@/components/modals/ModelAndModeSelectorModal";
import { loadCanvasFromSupabase } from "@/lib/canvas-helpers";

// Node width constants for perfect vertical alignment
const QUESTION_NODE_WIDTH = 225; // Fixed width for question nodes
const ANSWER_NODE_WIDTH = 500; // Fixed width for answer nodes (wider)
const VERTICAL_SPACING = 250; // Consistent spacing between all nodes

// Define node types for React Flow
const nodeTypes = {
  conversation: ConversationNode,
  preview: PreviewNode,
  stickyNote: StickyNoteNode,
};

// Define edge types for React Flow
const edgeTypes = {
  straight: StraightEdge,
};

export default function Canvas() {
  const searchParams = useSearchParams();
  const canvasId = searchParams?.get("id");

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const [floMode, setFloMode] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState("regular");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [isLoading, setIsLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1.25 });
  const [canvasBackground, setCanvasBackground] = useState("neutral");
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [drawingColor, setDrawingColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [canvasLoaded, setCanvasLoaded] = useState(false);

  // Load canvas from Supabase if ID is provided
  useEffect(() => {
    async function loadCanvas() {
      if (!canvasId || canvasLoaded) return;

      try {
        console.log("[Canvas] Loading canvas:", canvasId);
        const data = await loadCanvasFromSupabase(canvasId);
        console.log("[Canvas] Loaded data:", data);

        // Set viewport
        if (data.canvas) {
          setViewport({
            x: data.canvas.viewport_x || 0,
            y: data.canvas.viewport_y || 0,
            zoom: data.canvas.viewport_zoom || 1.25,
          });
        }

        // TODO: Load nodes and messages from data
        // This would require converting the database format to React Flow format
        // For now, we'll just load the viewport

        setCanvasLoaded(true);
      } catch (error) {
        console.error("[Canvas] Failed to load canvas:", error);
      }
    }

    loadCanvas();
  }, [canvasId, canvasLoaded]);

  // Helper function to check if two nodes overlap
  const nodesOverlap = (pos1: { x: number; y: number }, pos2: { x: number; y: number }, width: number = 300, height: number = 150, margin: number = 50) => {
    return !(
      pos1.x + width + margin < pos2.x ||
      pos1.x > pos2.x + width + margin ||
      pos1.y + height + margin < pos2.y ||
      pos1.y > pos2.y + height + margin
    );
  };

  // Helper function to calculate node bottom position including measured height
  const getNodeBottom = (nodeId: string, currentNodes: Node[]): number => {
    const node = currentNodes.find(n => n.id === nodeId);
    if (!node) return 0;

    // Use measured height if available, otherwise use estimated height based on type
    const height = node.measured?.height || (node.type === 'preview' || (node.data as any).messages?.some((m: any) => m.role === 'user') ? 150 : 250);
    return node.position.y + height;
  };

  // Helper function to find a non-overlapping position within viewport
  const findNonOverlappingPosition = (currentNodes: Node[], currentViewport: { x: number; y: number; zoom: number }, preferredX?: number, preferredY?: number) => {
    const nodeWidth = 300;
    const nodeHeight = 150;
    const padding = 100; // Padding from viewport edges

    // Calculate viewport bounds in canvas coordinates
    const viewportWidth = window.innerWidth / currentViewport.zoom;
    const viewportHeight = window.innerHeight / currentViewport.zoom;
    const viewportLeft = -currentViewport.x / currentViewport.zoom;
    const viewportTop = -currentViewport.y / currentViewport.zoom;

    // Start with preferred position or center of viewport
    let x = preferredX ?? viewportLeft + viewportWidth / 2 - nodeWidth / 2;
    let y = preferredY ?? viewportTop + viewportHeight / 2 - nodeHeight / 2;

    // Ensure position is within viewport bounds
    x = Math.max(viewportLeft + padding, Math.min(x, viewportLeft + viewportWidth - nodeWidth - padding));
    y = Math.max(viewportTop + padding, Math.min(y, viewportTop + viewportHeight - nodeHeight - padding));

    // Check for overlaps and adjust position if needed
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      let hasOverlap = false;

      for (const node of currentNodes) {
        if (nodesOverlap({ x, y }, node.position, nodeWidth, nodeHeight)) {
          hasOverlap = true;
          // Try a new position offset from the overlapping node
          x = node.position.x + nodeWidth + 100;
          y = node.position.y;

          // Wrap around if we go outside viewport
          if (x > viewportLeft + viewportWidth - nodeWidth - padding) {
            x = viewportLeft + padding;
            y += nodeHeight + 100;
          }

          if (y > viewportTop + viewportHeight - nodeHeight - padding) {
            y = viewportTop + padding;
            x += nodeWidth + 100;
          }

          break;
        }
      }

      if (!hasOverlap) {
        return { x, y };
      }

      attempts++;
    }

    // If we couldn't find a non-overlapping position, return the last attempted position
    return { x, y };
  };

  // Handle new connections between nodes
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  // Helper function to propagate colors to descendant nodes (non-cumulative)
  const propagateColorsToDescendants = useCallback(
    (nodeId: string, originalBackgroundColor: string, originalBorderColor: string, currentNodes: Node[], currentEdges: Edge[]) => {
      const updatedNodes = [...currentNodes];

      // Find all children of this node
      const childEdges = currentEdges.filter((e) => e.source === nodeId);

      childEdges.forEach((edge) => {
        const childIndex = updatedNodes.findIndex((n) => n.id === edge.target);
        if (childIndex !== -1) {
          const childNode = updatedNodes[childIndex];

          // Check if child is a question node or answer node
          const isQuestionNode = childNode.data.messages?.some((msg: Message) => msg.role === "user");

          let newBg, newBorder;
          if (isQuestionNode) {
            // Question nodes use the exact original color (no darkening)
            newBg = originalBackgroundColor;
            newBorder = originalBorderColor;
          } else {
            // Answer nodes use the original color darkened by 10%
            newBg = darkenColor(originalBackgroundColor);
            newBorder = darkenColor(originalBorderColor);
          }

          // Update child node
          updatedNodes[childIndex] = {
            ...updatedNodes[childIndex],
            data: {
              ...updatedNodes[childIndex].data,
              backgroundColor: newBg,
              borderColor: newBorder,
            },
          };

          // Recursively propagate to grandchildren with SAME original colors
          const grandchildren = propagateColorsToDescendants(
            edge.target,
            originalBackgroundColor,  // Pass original, not darkened
            originalBorderColor,      // Pass original, not darkened
            updatedNodes,
            currentEdges
          );

          // Merge grandchildren updates
          grandchildren.forEach((updatedNode, idx) => {
            updatedNodes[idx] = updatedNode;
          });
        }
      });

      return updatedNodes;
    },
    []
  );

  // Node manipulation handlers
  const updateNodeBorderColor = useCallback(
    (nodeId: string, color: string) => {
      setNodes((nds) => {
        // Update the target node
        const updatedNodes = nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, borderColor: color } }
            : node
        );

        // Get the updated node's background color
        const targetNode = updatedNodes.find((n) => n.id === nodeId);
        const backgroundColor = targetNode?.data.backgroundColor || "#efebe2";

        // Propagate colors to all descendants
        return propagateColorsToDescendants(nodeId, backgroundColor, color, updatedNodes, edges);
      });
    },
    [setNodes, edges, propagateColorsToDescendants]
  );

  const updateNodeBackgroundColor = useCallback(
    (nodeId: string, color: string) => {
      setNodes((nds) => {
        // Update the target node
        const updatedNodes = nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, backgroundColor: color } }
            : node
        );

        // Get the updated node's border color
        const targetNode = updatedNodes.find((n) => n.id === nodeId);
        const borderColor = targetNode?.data.borderColor || "#E5E5E7";

        // Propagate colors to all descendants
        return propagateColorsToDescendants(nodeId, color, borderColor, updatedNodes, edges);
      });
    },
    [setNodes, edges, propagateColorsToDescendants]
  );

  const copyNode = useCallback(
    (nodeId: string) => {
      const nodeToCopy = nodes.find((n) => n.id === nodeId);
      if (nodeToCopy) {
        const newNode: Node = {
          ...nodeToCopy,
          id: nanoid(),
          position: {
            x: nodeToCopy.position.x + 50,
            y: nodeToCopy.position.y + 50,
          },
          data: {
            ...nodeToCopy.data,
            borderColor: nodeToCopy.data.borderColor || "#D1D5DB",
            backgroundColor: nodeToCopy.data.backgroundColor || "#efebe2",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };
        setNodes((nds) => [...nds, newNode]);
      }
    },
    [nodes, setNodes]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      // Show confirmation dialog
      const confirmed = window.confirm(
        "Are you sure you want to delete this node? This action cannot be undone."
      );

      // Only proceed with deletion if user confirmed
      if (confirmed) {
        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
        setEdges((eds) =>
          eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
        );
      }
    },
    [setNodes, setEdges]
  );

  const updateStickyNoteContent = useCallback(
    (nodeId: string, content: string) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId && node.type === "stickyNote"
            ? { ...node, data: { ...node.data, content } }
            : node
        )
      );
    },
    [setNodes]
  );

  // Handle ESC key to exit drawing mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDrawingMode) {
        setIsDrawingMode(false);
        setIsDrawing(false);
        setCurrentPath([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawingMode]);

  // Load initial prompt and create first node with AI response
  useEffect(() => {
    const prompt = sessionStorage.getItem("initialPrompt");
    if (prompt) {
      setInitialPrompt(prompt);
      sessionStorage.removeItem("initialPrompt");

      // Create first conversation node (question)
      const questionNodeId = nanoid();
      // Use the viewport state for coordinate transformation
      const questionX = -viewport.x / viewport.zoom + (window.innerWidth / 2) / viewport.zoom - QUESTION_NODE_WIDTH / 2;
      const questionY = -viewport.y / viewport.zoom + (window.innerHeight / 2) / viewport.zoom - 200;

      const questionNode: Node = {
        id: questionNodeId,
        type: "conversation",
        position: { x: questionX, y: questionY },
        data: {
          topic: "New Conversation",
          messages: [
            {
              id: nanoid(),
              role: "user",
              content: prompt,
              timestamp: new Date().toISOString(),
            },
          ],
          isExpanded: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          borderColor: "#E5E5E7",
          backgroundColor: "#E9EAEE",
        },
      };

      // Create answer node (loading state) with hardcoded answer colors
      const answerNodeId = nanoid();
      const darkenedBg = "#EBEBEB";  // Answer node background (lighter gray)
      const darkenedBorder = "#D8D8D8";  // Answer node border

      // Center answer node below question node
      const answerX = questionX + (QUESTION_NODE_WIDTH / 2) - (ANSWER_NODE_WIDTH / 2);
      const answerY = questionY + VERTICAL_SPACING;

      const answerNode: Node = {
        id: answerNodeId,
        type: "conversation",
        position: {
          x: answerX,
          y: answerY,
        },
        data: {
          topic: "AI Response",
          messages: [
            {
              id: nanoid(),
              role: "assistant",
              content: "Thinking...",
              timestamp: new Date().toISOString(),
            },
          ],
          isExpanded: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          borderColor: darkenedBorder,
          backgroundColor: darkenedBg,
          model: selectedModel === "gemini-2.5-flash" ? "Gemini 2.5" : selectedModel === "gpt-5.1" ? "GPT-5.1" : selectedModel === "claude-sonnet-4.5" ? "Claude 4.5" : selectedModel,
          mode: selectedMode === "regular" ? "Regular" : selectedMode === "online-search" ? "Online Search" : selectedMode === "image-video" ? "Image/Video" : selectedMode === "prompt-enhance" ? "Prompt Enhance" : selectedMode === "comparison" ? "Comparison" : selectedMode === "business-mode" ? "Business" : "Agent",
        },
      };

      // Create edge connecting question to answer
      const newEdge: Edge = {
        id: `${questionNodeId}-${answerNodeId}`,
        source: questionNodeId,
        sourceHandle: "bottom",
        target: answerNodeId,
        targetHandle: "top",
        style: {
          stroke: "#D1D5DB",
          strokeWidth: 3,
        },
        type: "straight",
      };

      setNodes([questionNode, answerNode]);
      setEdges([newEdge]);
      setActiveConversationId(answerNodeId); // Set as active conversation

      // Call AI API automatically
      (async () => {
        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [
                {
                  role: "user",
                  content: prompt,
                },
              ],
              nodeId: answerNodeId,
              mode: selectedMode,
              model: selectedModel,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("[Frontend] API Error:", response.status, errorText);
            throw new Error(`Failed to get AI response: ${response.status} ${errorText}`);
          }

          // Handle streaming response
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let buffer = ""; // Accumulate chunks here to handle markers split across chunks
          let aiResponse = "";
          let sources = null;
          let imageUrl = null;

          if (reader) {
            while (true) {
              const { done, value} = await reader.read();
              if (done) {
                // Stream complete - extract markers from complete buffer
                console.log("[Canvas] [DEBUG] Stream complete. Full buffer length:", buffer.length);
                console.log("[Canvas] [DEBUG] Full buffer content:", buffer);
                console.log("[Canvas] [DEBUG] Contains __STEPS__:", buffer.includes("__STEPS__"));
                console.log("[Canvas] [DEBUG] Contains __CITATIONS__:", buffer.includes("__CITATIONS__"));
                console.log("[Canvas] [DEBUG] Contains __IMAGE_URL__:", buffer.includes("__IMAGE_URL__"));

                if (buffer.includes("__CITATIONS__")) {
                  const parts = buffer.split("__CITATIONS__");
                  aiResponse = parts[0].trimEnd();
                  try {
                    sources = JSON.parse(parts[1]);
                  } catch (e) {
                    console.error("Failed to parse citations:", e);
                  }
                } else if (buffer.includes("__IMAGE_URL__")) {
                  const parts = buffer.split("__IMAGE_URL__");
                  aiResponse = parts[0].trimEnd();
                  // Validate and clean imageUrl
                  const rawImageUrl = parts[1]?.trim();
                  if (rawImageUrl && rawImageUrl.startsWith("data:image/") && rawImageUrl.length > 100) {
                    imageUrl = rawImageUrl;
                    console.log("[Canvas] [Initial] Valid imageUrl extracted, length:", imageUrl.length);
                  } else {
                    console.error("[Canvas] [Initial] Invalid imageUrl format or too short:", rawImageUrl?.substring(0, 50));
                    imageUrl = null;
                  }
                } else if (buffer.includes("__STEPS__")) {
                  console.log("[Canvas] [Business Mode] __STEPS__ marker detected!");
                  // Business mode: Create multi-node tree layout
                  const parts = buffer.split("__STEPS__");
                  const titlePart = parts[0].trim();
                  const stepsJson = parts[1]?.trim();

                  // Extract title (format: "TITLE: Title Here")
                  const titleMatch = titlePart.match(/TITLE:\s*(.+)/i);
                  const projectTitle = titleMatch ? titleMatch[1].trim() : "Project Plan";

                  console.log("[Canvas] [Business Mode] Attempting to parse steps JSON");
                  console.log("[Canvas] [Business Mode] Title part:", titlePart);
                  console.log("[Canvas] [Business Mode] Steps JSON (length:", stepsJson?.length, "):", stepsJson);
                  console.log("[Canvas] [Business Mode] First 200 chars of JSON:", stepsJson?.substring(0, 200));

                  try {
                    const steps = JSON.parse(stepsJson!);
                    console.log("[Canvas] [Business Mode] Successfully parsed! Creating", steps.length, "step nodes");
                    console.log("[Canvas] [Business Mode] Steps data:", steps);

                    // Remove the placeholder answer node, we'll create title + step nodes instead
                    setNodes((nds) => nds.filter(n => n.id !== answerNodeId));
                    setEdges((eds) => eds.filter(e => e.source !== questionNodeId));

                    // Constants for layout
                    const TITLE_WIDTH = 600;
                    const STEP_WIDTH = 225;
                    const STEP_GAP = 50;
                    const VERTICAL_GAP = 150;

                    // Calculate title node position (centered below question)
                    const titleX = questionX + (QUESTION_NODE_WIDTH / 2) - (TITLE_WIDTH / 2);
                    const titleY = questionY + VERTICAL_GAP;

                    // Create title node
                    const titleNodeId = nanoid();
                    const titleNode: Node = {
                      id: titleNodeId,
                      type: "conversation",
                      position: { x: titleX, y: titleY },
                      data: {
                        topic: projectTitle,
                        messages: [{
                          id: nanoid(),
                          role: "assistant",
                          content: projectTitle,
                          timestamp: new Date().toISOString(),
                        }],
                        isExpanded: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        borderColor: "#0192c6", // Accent color
                        backgroundColor: "#e6f4f9", // Light blue
                        model: selectedModel === "gemini-2.5-flash" ? "Gemini 2.5" : selectedModel === "gpt-5.1" ? "GPT-5.1" : selectedModel === "claude-sonnet-4.5" ? "Claude 4.5" : selectedModel,
                        mode: "Business",
                        isBusinessTitle: true,
                      },
                      draggable: true,
                    };

                    // Calculate step nodes positions (horizontal row below title)
                    const totalStepsWidth = steps.length * STEP_WIDTH + (steps.length - 1) * STEP_GAP;
                    const titleCenterX = titleX + TITLE_WIDTH / 2;
                    const stepsStartX = titleCenterX - totalStepsWidth / 2;
                    const stepsY = titleY + VERTICAL_GAP;

                    // Create step nodes
                    const stepNodes = steps.map((step: any, i: number) => {
                      const stepNodeId = nanoid();
                      const stepX = stepsStartX + i * (STEP_WIDTH + STEP_GAP);

                      return {
                        id: stepNodeId,
                        type: "conversation",
                        position: { x: stepX, y: stepsY },
                        data: {
                          topic: step.title,
                          messages: [{
                            id: nanoid(),
                            role: "assistant",
                            content: step.content,
                            timestamp: new Date().toISOString(),
                          }],
                          isExpanded: true,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                          borderColor: "#E5E5E7",
                          backgroundColor: "#E9EAEE",
                          model: selectedModel === "gemini-2.5-flash" ? "Gemini 2.5" : selectedModel === "gpt-5.1" ? "GPT-5.1" : selectedModel === "claude-sonnet-4.5" ? "Claude 4.5" : selectedModel,
                          mode: "Business",
                          stepNumber: i + 1,
                        },
                        draggable: true,
                      } as Node;
                    });

                    // Create edges: question -> title, title -> each step
                    const questionToTitleEdge: Edge = {
                      id: `${questionNodeId}-${titleNodeId}`,
                      source: questionNodeId,
                      sourceHandle: "bottom",
                      target: titleNodeId,
                      targetHandle: "top",
                      type: "straight",
                      style: { stroke: "#D1D5DB", strokeWidth: 3 },
                    };

                    const titleToStepEdges = stepNodes.map((stepNode) => ({
                      id: `${titleNodeId}-${stepNode.id}`,
                      source: titleNodeId,
                      sourceHandle: "bottom",
                      target: stepNode.id,
                      targetHandle: "top",
                      type: "smoothstep" as const,
                      style: { stroke: "#0192c6", strokeWidth: 2 },
                    }));

                    // Add all nodes and edges at once
                    setNodes((nds) => [...nds, titleNode, ...stepNodes]);
                    setEdges((eds) => [...eds, questionToTitleEdge, ...titleToStepEdges]);

                    break; // Exit streaming loop
                  } catch (e) {
                    console.error("[Canvas] [Business Mode] Failed to parse steps JSON!");
                    console.error("[Canvas] [Business Mode] Error:", e);
                    console.error("[Canvas] [Business Mode] Steps JSON that failed:", stepsJson);
                    aiResponse = buffer.trimEnd();
                    // Fall through to normal handling
                  }
                } else {
                  aiResponse = buffer.trimEnd();
                }

                // Final update with complete, cleaned response (only for non-business mode)
                if (!buffer.includes("__STEPS__")) {
                  setNodes((nds) =>
                    nds.map((node) =>
                      node.id === answerNodeId
                        ? {
                            ...node,
                            data: {
                              ...node.data,
                              messages: [
                                {
                                  id: nanoid(),
                                  role: "assistant",
                                  content: aiResponse,
                                  timestamp: new Date().toISOString(),
                                  sources: sources || undefined,
                                  imageUrl: imageUrl || undefined,
                                },
                              ],
                            },
                          }
                        : node
                    )
                  );
                }
                break;
              }

              const chunk = decoder.decode(value, { stream: true });
              buffer += chunk;

              // During streaming, only extract text for display, not the markers
              // ImageUrl contains large base64 data that arrives across multiple chunks
              // so we must wait until stream is complete before extracting it
              if (buffer.includes("__CITATIONS__") || buffer.includes("__IMAGE_URL__") || buffer.includes("__STEPS__")) {
                const citIndex = buffer.indexOf("__CITATIONS__");
                const imgIndex = buffer.indexOf("__IMAGE_URL__");
                const stepsIndex = buffer.indexOf("__STEPS__");
                const markerIndex = Math.min(
                  citIndex !== -1 ? citIndex : Infinity,
                  imgIndex !== -1 ? imgIndex : Infinity,
                  stepsIndex !== -1 ? stepsIndex : Infinity
                );
                aiResponse = buffer.substring(0, markerIndex).trimEnd();
              } else {
                aiResponse = buffer;
              }

              // Update answer node with accumulated response
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === answerNodeId
                    ? {
                        ...node,
                        data: {
                          ...node.data,
                          messages: [
                            {
                              id: nanoid(),
                              role: "assistant",
                              content: aiResponse,
                              timestamp: new Date().toISOString(),
                              sources: sources || undefined,
                              imageUrl: imageUrl || undefined,
                            },
                          ],
                        },
                      }
                    : node
                )
              );
            }
          }
        } catch (error) {
          console.error("Error getting AI response:", error);
          // Update answer node with error message
          setNodes((nds) =>
            nds.map((node) =>
              node.id === answerNodeId
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      messages: [
                        {
                          id: nanoid(),
                          role: "assistant",
                          content: "Sorry, I encountered an error. Please try again.",
                          timestamp: new Date().toISOString(),
                        },
                      ],
                    },
                  }
                : node
            )
          );
        }
      })();
    }
  }, [setNodes, setEdges]);

  // Create or update conversation node when typing
  useEffect(() => {
    if (currentInput) {
      setNodes((nds) => {
        const previewNodeExists = nds.find((n) => n.id === "preview-node");

        if (previewNodeExists) {
          // Update existing conversation node
          return nds.map((node) =>
            node.id === "preview-node"
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    messages: [
                      {
                        id: nanoid(),
                        role: "user",
                        content: currentInput,
                        timestamp: new Date().toISOString(),
                      },
                    ],
                  },
                }
              : node
          );
        } else {
          // Create new conversation node
          // If there's an active conversation, position below it; otherwise find a non-overlapping position
          let position;
          // Question nodes always use white background with light gray border
          const borderColor = "#E5E5E7";
          const backgroundColor = "#E9EAEE";

          if (activeConversationId) {
            const activeNode = nds.find((n) => n.id === activeConversationId);
            if (activeNode) {
              // Center preview question node below active answer node
              const previewX = activeNode.position.x + (ANSWER_NODE_WIDTH / 2) - (QUESTION_NODE_WIDTH / 2);
              // Use dynamic positioning based on actual node height
              const previewY = getNodeBottom(activeConversationId, nds) + 50; // 50px spacing after actual bottom
              position = { x: previewX, y: previewY };
            } else {
              position = findNonOverlappingPosition(nds, viewport);
            }
          } else {
            position = findNonOverlappingPosition(nds, viewport);
          }

          const previewNode: Node = {
            id: "preview-node",
            type: "conversation",
            position,
            data: {
              topic: "New Conversation",
              messages: [
                {
                  id: nanoid(),
                  role: "user",
                  content: currentInput,
                  timestamp: new Date().toISOString(),
                },
              ],
              isExpanded: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              borderColor,
              backgroundColor,
            },
            draggable: true,
          };
          return [...nds, previewNode];
        }
      });

      // Create preview edge if there's an active conversation
      if (activeConversationId) {
        setEdges((eds) => {
          const previewEdgeExists = eds.find((e) => e.id === "preview-edge");
          if (previewEdgeExists) return eds;

          const previewEdge: Edge = {
            id: "preview-edge",
            source: activeConversationId,
            target: "preview-node",
            style: {
              stroke: "#D1D5DB",
              strokeWidth: 3,
            },
            type: "straight",
          };
          return [...eds, previewEdge];
        });
      }
    } else {
      // Remove preview node and edge when input is empty
      setNodes((nds) => nds.filter((n) => n.id !== "preview-node"));
      setEdges((eds) => eds.filter((e) => e.id !== "preview-edge"));
    }
  }, [currentInput, setNodes, setEdges, activeConversationId, viewport]);

  // Function to desaturate a color
  const desaturateColor = (color: string, percent: number = 50) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Convert to HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
        case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
        case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
      }
    }

    // Reduce saturation
    s = Math.max(0, s * (1 - percent / 100));

    // Convert back to RGB
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let newR, newG, newB;
    if (s === 0) {
      newR = newG = newB = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      newR = hue2rgb(p, q, h + 1/3);
      newG = hue2rgb(p, q, h);
      newB = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  };

  // Function to darken a color by a percentage
  const darkenColor = (color: string, percent: number = 5) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const darken = (value: number) => Math.max(0, Math.floor(value * (1 - percent / 100)));

    const newR = darken(r);
    const newG = darken(g);
    const newB = darken(b);

    const toHex = (x: number) => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  };

  // Handle sending message to AI
  const handleSendMessage = useCallback(async () => {
    if (!currentInput.trim() || isLoading) return;

    setIsLoading(true);

    try {
      // Check if there's an active conversation to continue
      if (activeConversationId) {
        // Chained conversation: create new question and answer nodes below the active answer
        const activeNode = nodes.find((n) => n.id === activeConversationId);

        if (activeNode) {
          // Clear input and remove preview node
          const messageContent = currentInput;
          setCurrentInput("");
          setNodes((nds) => nds.filter((n) => n.id !== "preview-node"));

          // Create new question node positioned below active answer node
          const questionNodeId = nanoid();
          // Center question node below answer node
          const questionX = activeNode.position.x + (ANSWER_NODE_WIDTH / 2) - (QUESTION_NODE_WIDTH / 2);
          // Use dynamic positioning based on actual node height
          const questionY = getNodeBottom(activeConversationId, nodes) + 50; // 50px spacing after actual bottom

          const questionNode: Node = {
            id: questionNodeId,
            type: "conversation",
            position: {
              x: questionX,
              y: questionY,
            },
            data: {
              topic: "Continued Conversation",
              messages: [
                {
                  id: nanoid(),
                  role: "user",
                  content: messageContent,
                  timestamp: new Date().toISOString(),
                },
              ],
              isExpanded: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              borderColor: "#E5E5E7",
              backgroundColor: "#E9EAEE",
            },
            draggable: true,
          };

          // Create new answer node positioned below question node with hardcoded answer colors
          const answerNodeId = nanoid();
          const darkenedBg = "#EBEBEB";  // Answer node background (lighter gray)
          const darkenedBorder = "#D8D8D8";  // Answer node border

          // Center answer node below question node
          const answerX = questionX + (QUESTION_NODE_WIDTH / 2) - (ANSWER_NODE_WIDTH / 2);
          // Estimate question node height (typically ~150px for user messages)
          const estimatedQuestionHeight = 150;
          const answerY = questionY + estimatedQuestionHeight + 50; // 50px spacing

          const answerNode: Node = {
            id: answerNodeId,
            type: "conversation",
            position: {
              x: answerX,
              y: answerY,
            },
            data: {
              topic: "AI Response",
              messages: [
                {
                  id: nanoid(),
                  role: "assistant",
                  content: "Thinking...",
                  timestamp: new Date().toISOString(),
                },
              ],
              isExpanded: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              borderColor: darkenedBorder,
              backgroundColor: darkenedBg,
              model: selectedModel === "gemini-2.5-flash" ? "Gemini 2.5" : selectedModel === "gpt-5.1" ? "GPT-5.1" : selectedModel === "claude-sonnet-4.5" ? "Claude 4.5" : selectedModel,
              mode: selectedMode === "regular" ? "Regular" : selectedMode === "online-search" ? "Online Search" : selectedMode === "image-video" ? "Image/Video" : selectedMode === "prompt-enhance" ? "Prompt Enhance" : selectedMode === "comparison" ? "Comparison" : selectedMode === "business-mode" ? "Business" : "Agent",
            },
            draggable: true,
          };

          // Create edges: previous answer -> question, question -> new answer
          const edge1: Edge = {
            id: `${activeConversationId}-${questionNodeId}`,
            source: activeConversationId,
            target: questionNodeId,
            style: {
              stroke: activeNode.data.borderColor || "#D1D5DB",
              strokeWidth: 3,
            },
            type: "straight",
          };

          const edge2: Edge = {
            id: `${questionNodeId}-${answerNodeId}`,
            source: questionNodeId,
            target: answerNodeId,
            style: {
              stroke: activeNode.data.borderColor || "#D1D5DB",
              strokeWidth: 3,
            },
            type: "straight",
          };

          // Add new nodes and edges
          setNodes((nds) => [...nds, questionNode, answerNode]);
          setEdges((eds) => [...eds, edge1, edge2]);
          setActiveConversationId(answerNodeId); // Update active conversation to new answer node

          // Get conversation context from all previous messages
          const allMessages: Array<{ role: string; content: string }> = [];

          // Traverse up the chain to collect all messages
          const visitedNodes = new Set<string>();
          const collectMessages = (nodeId: string) => {
            if (visitedNodes.has(nodeId)) return;
            visitedNodes.add(nodeId);

            const node = nodes.find((n) => n.id === nodeId);
            if (node) {
              // Add this node's messages
              node.data.messages.forEach((msg: any) => {
                allMessages.push({
                  role: msg.role,
                  content: msg.content,
                });
              });

              // Find the edge that points to this node (parent)
              const parentEdge = edges.find((e) => e.target === nodeId);
              if (parentEdge) {
                collectMessages(parentEdge.source);
              }
            }
          };

          collectMessages(activeConversationId);

          // Reverse to get chronological order (oldest to newest)
          allMessages.reverse();

          // Add the new user message
          allMessages.push({
            role: "user",
            content: messageContent,
          });

          // Ensure messages alternate properly (user -> assistant -> user -> assistant)
          const cleanedMessages: Array<{ role: string; content: string }> = [];
          let lastRole = "";
          for (const msg of allMessages) {
            if (msg.role !== lastRole) {
              cleanedMessages.push(msg);
              lastRole = msg.role;
            }
          }

          // Ensure the conversation starts with a user message
          if (cleanedMessages.length > 0 && cleanedMessages[0].role !== "user") {
            cleanedMessages.shift();
          }

          // Call AI API
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: cleanedMessages,
              nodeId: answerNodeId,
              mode: selectedMode,
              model: selectedModel,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("[Frontend] API Error:", response.status, errorText);
            throw new Error(`Failed to get AI response: ${response.status} ${errorText}`);
          }

          // Handle streaming response
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let buffer = ""; // Accumulate chunks here to handle markers split across chunks
          let aiResponse = "";
          let sources = null;
          let imageUrl = null;

          if (reader) {
            while (true) {
              const { done, value} = await reader.read();
              if (done) {
                // Stream complete - extract markers from complete buffer
                console.log("[Canvas] [DEBUG] Stream complete. Full buffer length:", buffer.length);
                console.log("[Canvas] [DEBUG] Full buffer content:", buffer);
                console.log("[Canvas] [DEBUG] Contains __STEPS__:", buffer.includes("__STEPS__"));
                console.log("[Canvas] [DEBUG] Contains __CITATIONS__:", buffer.includes("__CITATIONS__"));
                console.log("[Canvas] [DEBUG] Contains __IMAGE_URL__:", buffer.includes("__IMAGE_URL__"));

                if (buffer.includes("__CITATIONS__")) {
                  const parts = buffer.split("__CITATIONS__");
                  aiResponse = parts[0].trimEnd();
                  try {
                    sources = JSON.parse(parts[1]);
                  } catch (e) {
                    console.error("Failed to parse citations:", e);
                  }
                } else if (buffer.includes("__IMAGE_URL__")) {
                  const parts = buffer.split("__IMAGE_URL__");
                  aiResponse = parts[0].trimEnd();
                  // Validate and clean imageUrl
                  const rawImageUrl = parts[1]?.trim();
                  if (rawImageUrl && rawImageUrl.startsWith("data:image/") && rawImageUrl.length > 100) {
                    imageUrl = rawImageUrl;
                    console.log("[Canvas] [Chained] Valid imageUrl extracted, length:", imageUrl.length);
                  } else {
                    console.error("[Canvas] [Chained] Invalid imageUrl format or too short:", rawImageUrl?.substring(0, 50));
                    imageUrl = null;
                  }
                } else {
                  aiResponse = buffer.trimEnd();
                }

                // Final update with complete, cleaned response
                setNodes((nds) =>
                  nds.map((node) =>
                    node.id === answerNodeId
                      ? {
                          ...node,
                          data: {
                            ...node.data,
                            messages: [
                              {
                                id: nanoid(),
                                role: "assistant",
                                content: aiResponse,
                                timestamp: new Date().toISOString(),
                                sources: sources || undefined,
                                imageUrl: imageUrl || undefined,
                              },
                            ],
                          },
                        }
                      : node
                  )
                );
                break;
              }

              const chunk = decoder.decode(value, { stream: true });
              buffer += chunk;

              // During streaming, only extract text for display, not the markers
              // ImageUrl contains large base64 data that arrives across multiple chunks
              // so we must wait until stream is complete before extracting it
              if (buffer.includes("__CITATIONS__") || buffer.includes("__IMAGE_URL__") || buffer.includes("__STEPS__")) {
                const citIndex = buffer.indexOf("__CITATIONS__");
                const imgIndex = buffer.indexOf("__IMAGE_URL__");
                const stepsIndex = buffer.indexOf("__STEPS__");
                const markerIndex = Math.min(
                  citIndex !== -1 ? citIndex : Infinity,
                  imgIndex !== -1 ? imgIndex : Infinity,
                  stepsIndex !== -1 ? stepsIndex : Infinity
                );
                aiResponse = buffer.substring(0, markerIndex).trimEnd();
              } else {
                aiResponse = buffer;
              }

              // Update answer node with accumulated response
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === answerNodeId
                    ? {
                        ...node,
                        data: {
                          ...node.data,
                          messages: [
                            {
                              id: nanoid(),
                              role: "assistant",
                              content: aiResponse,
                              timestamp: new Date().toISOString(),
                              sources: sources || undefined,
                              imageUrl: imageUrl || undefined,
                            },
                          ],
                        },
                      }
                    : node
                )
              );
            }
          }

          setIsLoading(false);
          return;
        }
      }

      // New conversation: create question + answer nodes
      const previewNode = nodes.find((n) => n.id === "preview-node");
      if (!previewNode) {
        setIsLoading(false);
        return;
      }

      // Make the preview node permanent
      const questionNodeId = nanoid();
      const questionNode: Node = {
        ...previewNode,
        id: questionNodeId,
        draggable: true,
      };

      // Create answer node (loading state) with hardcoded answer colors
      const answerNodeId = nanoid();
      const darkenedBg = "#EBEBEB";  // Answer node background (lighter gray)
      const darkenedBorder = "#D8D8D8";  // Answer node border

      // Center answer node below question node
      const answerX = previewNode.position.x + (QUESTION_NODE_WIDTH / 2) - (ANSWER_NODE_WIDTH / 2);
      // Estimate preview node height (typically ~150px)
      const estimatedPreviewHeight = 150;
      const answerY = previewNode.position.y + estimatedPreviewHeight + 50; // 50px spacing

      const answerNode: Node = {
        id: answerNodeId,
        type: "conversation",
        position: {
          x: answerX,
          y: answerY,
        },
        data: {
          topic: "AI Response",
          messages: [
            {
              id: nanoid(),
              role: "assistant",
              content: "Thinking...",
              timestamp: new Date().toISOString(),
            },
          ],
          isExpanded: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          borderColor: darkenedBorder,
          backgroundColor: darkenedBg,
          model: selectedModel === "gemini-2.5-flash" ? "Gemini 2.5" : selectedModel === "gpt-5.1" ? "GPT-5.1" : selectedModel === "claude-sonnet-4.5" ? "Claude 4.5" : selectedModel,
          mode: selectedMode === "regular" ? "Regular" : selectedMode === "online-search" ? "Online Search" : selectedMode === "image-video" ? "Image/Video" : selectedMode === "prompt-enhance" ? "Prompt Enhance" : selectedMode === "comparison" ? "Comparison" : selectedMode === "business-mode" ? "Business" : "Agent",
        },
        draggable: true,
      };

      // Create edge connecting question to answer
      const newEdge: Edge = {
        id: `${questionNodeId}-${answerNodeId}`,
        source: questionNodeId,
        sourceHandle: "bottom",
        target: answerNodeId,
        targetHandle: "top",
        style: {
          stroke: previewNode.data.borderColor || "#D1D5DB",
          strokeWidth: 3,
        },
        type: "straight",
      };

      // Update nodes and edges
      setNodes((nds) =>
        nds
          .filter((n) => n.id !== "preview-node")
          .concat([questionNode, answerNode])
      );
      setEdges((eds) => [...eds, newEdge]);
      setActiveConversationId(answerNodeId); // Set as active conversation

      // Clear input
      const messageContent = currentInput;
      setCurrentInput("");

      // Call AI API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: messageContent,
            },
          ],
          nodeId: answerNodeId,
          mode: selectedMode,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Frontend] API Error:", response.status, errorText);
        throw new Error(`Failed to get AI response: ${response.status} ${errorText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = ""; // Accumulate chunks here to handle markers split across chunks
      let aiResponse = "";
      let sources = null;
      let imageUrl = null;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Process any remaining buffer content and extract markers
            if (buffer.includes("__CITATIONS__")) {
              const parts = buffer.split("__CITATIONS__");
              aiResponse = parts[0].trimEnd();
              try {
                sources = JSON.parse(parts[1]);
              } catch (e) {
                console.error("Failed to parse citations:", e);
              }
            } else if (buffer.includes("__IMAGE_URL__")) {
              const parts = buffer.split("__IMAGE_URL__");
              aiResponse = parts[0].trimEnd();
              // Validate and clean imageUrl
              const rawImageUrl = parts[1]?.trim();
              if (rawImageUrl && rawImageUrl.startsWith("data:image/") && rawImageUrl.length > 100) {
                imageUrl = rawImageUrl;
                console.log("[Canvas] [Preview] Valid imageUrl extracted, length:", imageUrl.length);
              } else {
                console.error("[Canvas] [Preview] Invalid imageUrl format or too short:", rawImageUrl?.substring(0, 50));
                imageUrl = null;
              }
            } else {
              aiResponse = buffer.trimEnd();
            }
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Don't process markers during streaming, just accumulate
          // Extract text for live display (before any markers)
          if (buffer.includes("__CITATIONS__") || buffer.includes("__IMAGE_URL__")) {
            console.log("[Canvas] Marker detected in buffer during streaming");
            const citIndex = buffer.indexOf("__CITATIONS__");
            const imgIndex = buffer.indexOf("__IMAGE_URL__");
            const markerIndex = citIndex !== -1 ? citIndex : imgIndex;
            aiResponse = buffer.substring(0, markerIndex).trimEnd();
          } else {
            aiResponse = buffer;
          }

          // Update answer node with accumulated response
          setNodes((nds) =>
            nds.map((node) =>
              node.id === answerNodeId
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      messages: [
                        {
                          id: nanoid(),
                          role: "assistant",
                          content: aiResponse,
                          timestamp: new Date().toISOString(),
                          sources: sources || undefined,
                          imageUrl: imageUrl || undefined,
                        },
                      ],
                    },
                  }
                : node
            )
          );
        }
      }

      // Final update after stream completes with extracted markers
      setNodes((nds) =>
        nds.map((node) =>
          node.id === answerNodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  messages: [
                    {
                      id: nanoid(),
                      role: "assistant",
                      content: aiResponse,
                      timestamp: new Date().toISOString(),
                      sources: sources || undefined,
                      imageUrl: imageUrl || undefined,
                    },
                  ],
                },
              }
            : node
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      // Update with error message
      if (activeConversationId) {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === activeConversationId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    messages: node.data.messages.map((msg, idx) =>
                      idx === node.data.messages.length - 1
                        ? { ...msg, content: "Sorry, I encountered an error. Please try again." }
                        : msg
                    ),
                  },
                }
              : node
          )
        );
      } else {
        setNodes((nds) =>
          nds.map((node) =>
            node.data.messages?.[0]?.content === "Thinking..."
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    messages: [
                      {
                        id: nanoid(),
                        role: "assistant",
                        content: "Sorry, I encountered an error. Please try again.",
                        timestamp: new Date().toISOString(),
                      },
                    ],
                  },
                }
              : node
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentInput, nodes, isLoading, activeConversationId, setNodes, setEdges, selectedModel, selectedMode, darkenColor]);

  // Expose handlers globally for ConversationNode and StickyNoteNode to access
  useEffect(() => {
    (window as any).updateNodeBorderColor = updateNodeBorderColor;
    (window as any).updateNodeBackgroundColor = updateNodeBackgroundColor;
    (window as any).copyNode = copyNode;
    (window as any).deleteNode = deleteNode;
    (window as any).updateStickyNoteContent = updateStickyNoteContent;

    return () => {
      delete (window as any).updateNodeBorderColor;
      delete (window as any).updateNodeBackgroundColor;
      delete (window as any).copyNode;
      delete (window as any).deleteNode;
      delete (window as any).updateStickyNoteContent;
    };
  }, [updateNodeBorderColor, updateNodeBackgroundColor, copyNode, deleteNode, updateStickyNoteContent]);

  // Handle clicking on empty canvas to deselect active conversation
  const handlePaneClick = useCallback(() => {
    // Deselect active conversation - user wants to start a new topic
    setActiveConversationId(null);
  }, []);

  // Handle clicking on a node to select it as active conversation
  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    // Check if this node contains user messages (question) or assistant messages (answer)
    const hasUserMessage = node.data.messages?.some((msg: Message) => msg.role === "user");
    const hasAssistantMessage = node.data.messages?.some((msg: Message) => msg.role === "assistant");

    if (hasAssistantMessage) {
      // This is an answer node - set it as active
      setActiveConversationId(node.id);
    } else if (hasUserMessage) {
      // This is a question node - find its parent answer node
      // Look for an edge where this question node is the target
      const parentEdge = edges.find((e) => e.target === node.id);
      if (parentEdge) {
        // Set the parent (answer node) as active instead
        setActiveConversationId(parentEdge.source);
      } else {
        // No parent found (shouldn't happen in normal flow)
        setActiveConversationId(node.id);
      }
    } else {
      // Fallback for any other node types
      setActiveConversationId(node.id);
    }
  }, [edges]);

  // Handle creating a new sticky note
  const handleCreateStickyNote = useCallback(() => {
    const stickyNoteId = nanoid();

    // Calculate position at viewport center
    const viewportCenterX = -viewport.x / viewport.zoom + (window.innerWidth / 2) / viewport.zoom;
    const viewportCenterY = -viewport.y / viewport.zoom + (window.innerHeight / 2) / viewport.zoom;

    // Check for overlaps and find a good position
    const position = findNonOverlappingPosition(nodes, viewport, viewportCenterX, viewportCenterY);

    const stickyNote: Node = {
      id: stickyNoteId,
      type: "stickyNote",
      position,
      data: {
        content: "",
        color: "yellow",
        createdAt: new Date().toISOString(),
      } as StickyNoteData,
      draggable: true,
    };

    setNodes((nds) => [...nds, stickyNote]);
  }, [nodes, viewport, setNodes]);

  // Handle toggling drawing mode
  const handleToggleDrawing = useCallback((enable?: boolean) => {
    if (enable === undefined) {
      setIsDrawingMode((prev) => !prev); // Toggle
    } else {
      setIsDrawingMode(enable); // Set explicitly
    }
    setIsEraserMode(false); // Disable eraser when switching to pen
  }, []);

  // Handle toggling eraser mode
  const handleToggleEraser = useCallback(() => {
    setIsDrawingMode(true);  // Enable drawing mode
    setIsEraserMode(true);   // Enable eraser
  }, []);

  // Drawing handlers
  const handleDrawingMouseDown = useCallback((event: React.MouseEvent) => {
    if (!isDrawingMode) return;

    event.preventDefault();
    event.stopPropagation();
    setIsDrawing(true);

    // Calculate position in canvas coordinates
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left - viewport.x) / viewport.zoom;
    const y = (event.clientY - rect.top - viewport.y) / viewport.zoom;
    setCurrentPath([{ x, y }]);
  }, [isDrawingMode, viewport]);

  const handleDrawingMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDrawing || !isDrawingMode) return;

    event.preventDefault();
    event.stopPropagation();

    // Calculate position in canvas coordinates
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left - viewport.x) / viewport.zoom;
    const y = (event.clientY - rect.top - viewport.y) / viewport.zoom;

    if (isEraserMode) {
      // Eraser mode: remove paths that intersect with eraser position
      const eraserRadius = strokeWidth * 3; // Make eraser larger than stroke
      setDrawingPaths((paths) =>
        paths.filter((path) => {
          // Check if any point in the path is within eraser radius
          return !path.points.some(
            (point) =>
              Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)) < eraserRadius
          );
        })
      );
    } else {
      // Drawing mode: add point to current path
      setCurrentPath((prev) => [...prev, { x, y }]);
    }
  }, [isDrawing, isDrawingMode, isEraserMode, strokeWidth, viewport]);

  const handleDrawingMouseUp = useCallback(() => {
    if (!isDrawing || !isDrawingMode) return;

    // Only save path if in drawing mode (not eraser mode)
    if (!isEraserMode && currentPath.length > 1) {
      const newPath: DrawingPath = {
        id: nanoid(),
        points: currentPath,
        color: drawingColor,
        width: strokeWidth,
        createdAt: new Date().toISOString(),
      };
      setDrawingPaths((prev) => [...prev, newPath]);
    }

    setCurrentPath([]);
    setIsDrawing(false);
  }, [isDrawing, isDrawingMode, isEraserMode, currentPath, drawingColor, strokeWidth]);

  const handleClearDrawings = useCallback(() => {
    setDrawingPaths([]);
    setCurrentPath([]);
  }, []);

  // Handle viewport changes (pan/zoom)
  const handleMove = useCallback((_event: any, newViewport: { x: number; y: number; zoom: number }) => {
    setViewport(newViewport);
  }, []);

  return (
    <div className="w-full h-screen relative">
      {/* Flowing Gradient Background */}
      <FlowingGradient backgroundType={canvasBackground} />

      {/* Logo in top-left corner */}
      <div className="fixed top-4 left-4 z-30">
        <img
          src="/anythingLogoMark.png"
          alt="Anything Logo"
          className="h-8 w-auto"
        />
      </div>

      {/* Top Toolbar */}
      <TopToolbar
        isDrawingMode={isDrawingMode}
        isEraserMode={isEraserMode}
        onToggleDrawing={handleToggleDrawing}
        onToggleEraser={handleToggleEraser}
        onCreateStickyNote={handleCreateStickyNote}
        canvasBackground={canvasBackground}
        onBackgroundChange={setCanvasBackground}
      />

      {/* Drawing Toolbar (shown when in drawing mode) */}
      {isDrawingMode && (
        <DrawingToolbar
          drawingColor={drawingColor}
          onColorChange={setDrawingColor}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
          onDone={() => {
            setIsDrawingMode(false);
            setIsEraserMode(false);
          }}
        />
      )}

      {/* Canvas */}
      <div
        className="w-full h-full relative z-10"
        onMouseDown={isDrawingMode ? handleDrawingMouseDown : undefined}
        onMouseMove={isDrawingMode ? handleDrawingMouseMove : undefined}
        onMouseUp={isDrawingMode ? handleDrawingMouseUp : undefined}
        onMouseLeave={isDrawingMode ? handleDrawingMouseUp : undefined}
        style={{
          cursor: isDrawingMode
            ? isEraserMode
              ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0M4.22 15.58l3.54 3.53c.78.79 2.04.79 2.83 0l3.53-3.53l-4.95-4.95l-4.95 4.95z'/%3E%3C/svg%3E\") 12 12, crosshair"
              : "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z'/%3E%3C/svg%3E\") 2 18, crosshair"
            : "default"
        }}
      >
        <div style={{ pointerEvents: isDrawingMode ? 'none' : 'auto', height: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onPaneClick={handlePaneClick}
            onNodeClick={handleNodeClick}
            onMove={handleMove}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultViewport={{ x: 0, y: 0, zoom: 1.25 }}
            className="bg-transparent"
            panOnScroll={!isDrawingMode}
            zoomOnScroll={false}
            panOnScrollMode="vertical"
            zoomActivationKeyCode="Control"
            nodesDraggable={!isDrawingMode}
            nodesConnectable={!isDrawingMode}
            elementsSelectable={!isDrawingMode}
          >
            <Controls />
          </ReactFlow>
        </div>

        {/* Drawing Layer (SVG overlay for drawings) */}
        <DrawingLayer
          paths={drawingPaths}
          currentPath={currentPath}
          viewport={viewport}
          drawingColor={drawingColor}
          strokeWidth={strokeWidth}
        />
      </div>

      {/* Bottom Chat Input */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20" style={{ width: '400px' }}>
        <div className="bg-white/40 backdrop-blur-xl border border-gray-300/50 rounded-lg shadow-lg p-3">
          {/* Textarea Container */}
          <div className="mb-2" style={{ width: '100%', maxWidth: '376px', minHeight: '50px' }}>
            <textarea
              placeholder={activeConversationId ? "Continue conversation..." : "Start a new topic"}
              className="bg-transparent text-xs focus:outline-none resize-none overflow-hidden transition-opacity"
              onClick={(e) => e.stopPropagation()}
              rows={2}
              value={currentInput}
              onChange={(e) => {
                setCurrentInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
              style={{
                width: '100%',
                maxWidth: '100%',
                minWidth: '100%',
                minHeight: '50px',
                display: 'block',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
                boxSizing: 'border-box',
                wordBreak: 'break-all'
              }}
            />
          </div>

          {/* Bottom row with mode/model selector and send button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            {/* Mode/Model Selector Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2 py-1 text-[10px] bg-white/60 hover:bg-white/80 rounded-md transition-colors border border-gray-300/50"
              style={{ flexShrink: 0 }}
            >
              <span className="font-medium text-gray-700">
                {selectedMode === "regular" ? "Regular" : selectedMode === "online-search" ? "Online Search" : selectedMode === "image-video" ? "Image/Video" : selectedMode === "prompt-enhance" ? "Prompt Enhance" : selectedMode === "comparison" ? "Comparison" : selectedMode === "business-mode" ? "Business Mode" : "Agent Mode"}
              </span>
              <span className="text-gray-500">+</span>
              <span className="font-medium text-gray-700">
                {selectedModel === "gemini-2.5-flash" ? "Gemini 2.5 Flash" : selectedModel === "gpt-5.1" ? "GPT 5.1" : selectedModel === "claude-sonnet-4.5" ? "Claude Sonnet 4.5" : selectedModel}
              </span>
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
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Send Button */}
            <button
              className="p-1 rounded-lg disabled:bg-gray-400 flex items-center justify-center transition-colors"
              style={{
                backgroundColor: !currentInput.trim() || isLoading ? undefined : '#0192c6',
                flexShrink: 0
              }}
              onMouseEnter={(e) => !(!currentInput.trim() || isLoading) && (e.currentTarget.style.backgroundColor = '#017aa3')}
              onMouseLeave={(e) => !(!currentInput.trim() || isLoading) && (e.currentTarget.style.backgroundColor = '#0192c6')}
              onClick={(e) => {
                e.stopPropagation();
                handleSendMessage();
              }}
              disabled={!currentInput.trim() || isLoading}
              title={isLoading ? "Wait for node to finish generating" : ""}
            >
              {isLoading ? (
                <svg
                  className="w-3.5 h-3.5 text-white animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3.5 h-3.5 text-white"
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
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Model & Mode Selector Modal */}
      <ModelAndModeSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentMode={selectedMode}
        currentModel={selectedModel}
        onModeChange={setSelectedMode}
        onModelChange={setSelectedModel}
      />
    </div>
  );
}
