import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/canvases - List all user's canvases
export async function GET() {
  const supabase = createClient();

  // Check dev mode
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

  if (devMode) {
    // Return empty array in dev mode
    return NextResponse.json([]);
  }

  // Get authenticated user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch user's canvases
  const { data: canvases, error } = await supabase
    .from("canvases")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("is_archived", false)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(canvases);
}

// POST /api/canvases - Create new canvas
export async function POST(request: Request) {
  const supabase = createClient();

  // Check dev mode
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

  if (devMode) {
    // Return mock canvas in dev mode
    return NextResponse.json({
      id: "dev-canvas-" + Date.now(),
      name: "Dev Canvas",
      description: null,
      viewport_x: 0,
      viewport_y: 0,
      viewport_zoom: 1.25,
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
  const { name, description, viewport_x, viewport_y, viewport_zoom } = body;

  // Create canvas
  const { data: canvas, error } = await supabase
    .from("canvases")
    .insert({
      user_id: session.user.id,
      name: name || "Untitled Canvas",
      description: description || null,
      viewport_x: viewport_x || 0,
      viewport_y: viewport_y || 0,
      viewport_zoom: viewport_zoom || 1.25,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(canvas);
}
