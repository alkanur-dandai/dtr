import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase/server";

// 1. Define the context with a Promise
type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest, // Use NextRequest for consistency
  context: Context      // Params is wrapped in a Promise
) {
  // 2. Await the params before using them
  const { id } = await context.params;
  const userId = Number(id);

  if (!userId) {
    return NextResponse.json(
      { error: "Invalid or missing user ID" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, name, student_no")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}