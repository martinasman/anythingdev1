import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Node, Edge } from "@xyflow/react";
import type { CanvasNode } from "@/types/canvas";

interface CanvasStore {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  viewport: { x: number; y: number; zoom: number };

  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  setSelectedNodeId: (id: string | null) => void;
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void;

  addNode: (node: Node) => void;
  updateNode: (id: string, data: Partial<Node["data"]>) => void;
  deleteNode: (id: string) => void;

  addEdge: (edge: Edge) => void;
  deleteEdge: (id: string) => void;

  reset: () => void;
}

const initialState = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  viewport: { x: 0, y: 0, zoom: 1 },
};

export const useCanvasStore = create<CanvasStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setNodes: (nodes) =>
          set((state) => ({
            nodes: typeof nodes === "function" ? nodes(state.nodes) : nodes,
          })),

        setEdges: (edges) =>
          set((state) => ({
            edges: typeof edges === "function" ? edges(state.edges) : edges,
          })),

        setSelectedNodeId: (id) => set({ selectedNodeId: id }),

        setViewport: (viewport) => set({ viewport }),

        addNode: (node) =>
          set((state) => ({ nodes: [...state.nodes, node] })),

        updateNode: (id, data) =>
          set((state) => ({
            nodes: state.nodes.map((node) =>
              node.id === id ? { ...node, data: { ...node.data, ...data } } : node
            ),
          })),

        deleteNode: (id) =>
          set((state) => ({
            nodes: state.nodes.filter((node) => node.id !== id),
            edges: state.edges.filter(
              (edge) => edge.source !== id && edge.target !== id
            ),
          })),

        addEdge: (edge) =>
          set((state) => ({ edges: [...state.edges, edge] })),

        deleteEdge: (id) =>
          set((state) => ({
            edges: state.edges.filter((edge) => edge.id !== id),
          })),

        reset: () => set(initialState),
      }),
      {
        name: "canvas-storage",
        partialize: (state) => ({
          nodes: state.nodes,
          edges: state.edges,
          viewport: state.viewport,
        }),
      }
    )
  )
);
