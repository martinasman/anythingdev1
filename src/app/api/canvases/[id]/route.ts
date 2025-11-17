import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/canvases/[id] - Get canvas with all nodes and messages
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const canvasId = params.id;

  // Check dev mode
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

  if (devMode) {
    // Return mock data in dev mode
    return NextResponse.json({
      canvas: {
        id: canvasId,
        name: "Dev Canvas",
        description: null,
        viewport_x: 0,
        viewport_y: 0,
        viewport_zoom: 1.25,
      },
      nodes: [],
      messages: [],
    });
  }

  // Get authenticated user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch canvas
  const { data: canvas, error: canvasError } = await supabase
    .from("canvases")
    .select("*")
    .eq("id", canvasId)
    .eq("user_id", session.user.id)
    .single();

  if (canvasError || !canvas) {
    return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
  }

  // Fetch nodes
  const { data: nodes, error: nodesError } = await supabase
    .from("nodes")
    .select("*")
    .eq("canvas_id", canvasId)
    .order("created_at", { ascending: true });

  if (nodesError) {
    return NextResponse.json({ error: nodesError.message }, { status: 500 });
  }

  // Fetch messages for all nodes
  const nodeIds = nodes?.map((n) => n.id) || [];
  let messages: any[] = [];

  if (nodeIds.length > 0) {
    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .in("node_id", nodeIds)
      .order("created_at", { ascending: true });

    if (messagesError) {
      return NextResponse.json(
        { error: messagesError.message },
        { status: 500 }
      );
    }

    messages = messagesData || [];
  }

  return NextResponse.json({
    canvas,
    nodes: nodes || [],
    messages,
  });
}

// PUT /api/canvases/[id] - Update canvas
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const canvasId = params.id;

  // Check dev mode
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

  if (devMode) {
    const body = await request.json();
    return NextResponse.json({ id: canvasId, ...body });
  }

  // Get authenticated user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, viewport_x, viewport_y, viewport_zoom } = body;

  // Update canvas
  const { data: canvas, error } = await supabase
    .from("canvases")
    .update({
      name,
      description,
      viewport_x,
      viewport_y,
      viewport_zoom,
      updated_at: new Date().toISOString(),
    })
    .eq("id", canvasId)
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(canvas);
}

// DELETE /api/canvases/[id] - Delete (archive) canvas
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const canvasId = params.id;

  // Check dev mode
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

  if (devMode) {
    return NextResponse.json({ success: true });
  }

  // Get authenticated user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Soft delete by archiving
  const { error } = await supabase
    .from("canvases")
    .update({ is_archived: true })
    .eq("id", canvasId)
    .eq("user_id", session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
