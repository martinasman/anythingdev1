import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/messages - Create new message
export async function POST(request: Request) {
  const supabase = createClient();

  // Check dev mode
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

  if (devMode) {
    const body = await request.json();
    return NextResponse.json({
      id: "dev-message-" + Date.now(),
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
  const { node_id, role, content, tokens_used, media_urls } = body;

  // Verify user owns the node (through canvas)
  const { data: node } = await supabase
    .from("nodes")
    .select("canvas_id, canvases(user_id)")
    .eq("id", node_id)
    .single();

  if (!node || node.canvases?.user_id !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Create message
  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      node_id,
      role,
      content,
      tokens_used: tokens_used || 0,
      media_urls: media_urls || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(message);
}
