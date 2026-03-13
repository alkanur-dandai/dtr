import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

export async function POST(req: Request) {
  const { userId, action } = await req.json();

  const now = new Date();
  const hour = now.getHours();

  let session: "morning" | "afternoon";

  // SESSION RULES
  if (hour >= 7 && hour < 12) {
    session = "morning";
  } 
  else if (hour >= 13 && hour < 18) {
    session = "afternoon";
  } 
  else {
    return NextResponse.json(
      { error: "Attendance not allowed at this time" },
      { status: 400 }
    );
  }

  const today = new Date().toISOString().split("T")[0];

  try {

    // CHECK EXISTING RECORD
    const { data: record, error: fetchError } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .eq("session", session)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    // =========================
    // TIME IN
    // =========================
    if (action === "time_in") {

      if (record?.time_in) {
        return NextResponse.json(
          { error: "Already timed in for this session" },
          { status: 400 }
        );
      }

      // CREATE NEW RECORD
      if (!record) {

        const { error } = await supabase
          .from("attendance")
          .insert({
            user_id: userId,
            date: today,
            session: session,
            time_in: new Date().toISOString(),
          });

        if (error) throw error;

      } 
      else {

        const { error } = await supabase
          .from("attendance")
          .update({
            time_in: new Date().toISOString(),
          })
          .eq("id", record.id);

        if (error) throw error;

      }

      return NextResponse.json({
        message: `Time in recorded (${session})`,
      });
    }

    // =========================
    // TIME OUT
    // =========================
    if (action === "time_out") {

      if (!record?.time_in) {
        return NextResponse.json(
          { error: "You must time in first" },
          { status: 400 }
        );
      }

      if (record.time_out) {
        return NextResponse.json(
          { error: "Already timed out for this session" },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from("attendance")
        .update({
          time_out: new Date().toISOString(),
        })
        .eq("id", record.id);

      if (error) throw error;

      return NextResponse.json({
        message: `Time out recorded (${session})`,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );

  }
}