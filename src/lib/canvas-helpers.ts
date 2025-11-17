import type { Node, Edge } from "@xyflow/react";

export async function saveCanvasToSupabase(
  canvasId: string,
  name: string,
  viewport: { x: number; y: number; zoom: number },
  nodes: Node[],
  edges: Edge[]
) {
  // Save canvas metadata
  const canvasResponse = await fetch(`/api/canvases/${canvasId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      viewport_x: viewport.x,
      viewport_y: viewport.y,
      viewport_zoom: viewport.zoom,
    }),
  });

  if (!canvasResponse.ok) {
    throw new Error("Failed to save canvas");
  }

  return canvasResponse.json();
}

export async function loadCanvasFromSupabase(canvasId: string) {
  const response = await fetch(`/api/canvases/${canvasId}`);

  if (!response.ok) {
    throw new Error("Failed to load canvas");
  }

  const data = await response.json();
  return data;
}

export async function createNewCanvas(name: string = "Untitled Canvas") {
  const response = await fetch("/api/canvases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error("Failed to create canvas");
  }

  return response.json();
}

export async function deleteCanvas(canvasId: string) {
  const response = await fetch(`/api/canvases/${canvasId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete canvas");
  }

  return response.json();
}

export async function fetchUserCanvases() {
  const response = await fetch("/api/canvases");

  if (!response.ok) {
    throw new Error("Failed to fetch canvases");
  }

  return response.json();
}
