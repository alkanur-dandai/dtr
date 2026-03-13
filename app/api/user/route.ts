import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase/server";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
