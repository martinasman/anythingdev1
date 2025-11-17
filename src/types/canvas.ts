import { Node as FlowNode, Edge } from "@xyflow/react";

export interface CanvasNode extends FlowNode {
  id: string;
  type: "conversation";
  position: { x: number; y: number };
  data: ConversationNodeData;
}

export interface ConversationNodeData {
  topic?: string;
  messages: Message[];
  isExpanded?: boolean;
  createdAt: string;
  updatedAt: string;
  borderColor: string;
  backgroundColor: string;
  model?: string;
  mode?: string;
  stepNumber?: number;
  isBusinessTitle?: boolean;
}

export interface Source {
  title: string;
  url: string;
  date?: string | null;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  tokensUsed?: number;
  sources?: Source[];
  imageUrl?: string;
}

export interface NodeConnection extends Edge {
  id: string;
  source: string;
  target: string;
  type: "default";
  data?: {
    similarity: number;
    reason: string;
  };
}

export interface StickyNoteData {
  content: string;
  color: string;
  createdAt: string;
}

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface DrawingPath {
  id: string;
  points: Point[];
  color: string;
  width: number;
  createdAt: string;
}

export interface CanvasState {
  nodes: CanvasNode[];
  edges: NodeConnection[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}
