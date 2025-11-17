import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/nodes - Create new node
export async function POST(request: Request) {
  const supabase = createClient();

  // Check dev mode
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

  if (devMode) {
    const body = await request.json();
    return NextResponse.json({
      id: "dev-node-" + Date.now(),
      ...body,
    });
  }

  // Get authenticated user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    canvas_id,
    position_x,
    position_y,
    width,
    height,
    topic_title,
    topic_summary,
    is_expanded,
    z_index,
  } = body;

  // Verify user owns the canvas
  const { data: canvas } = await supabase
    .from("canvases")
    .select("user_id")
    .eq("id", canvas_id)
    .single();

  if (!canvas || canvas.user_id !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Create node
  const { data: node, error } = await supabase
    .from("nodes")
    .insert({
      canvas_id,
      position_x,
      position_y,
      width,
      height,
      topic_title,
      topic_summary,
      is_expanded: is_expanded ?? true,
      z_index: z_index ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(node);
}
