import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

export async function POST(req: Request) {
  const { userId, action } = await req.json();

  const now = new Date();
  const hour = now.getHours();
  const today = new Date().toISOString().split("T")[0];

  let session: "morning" | "afternoon";

  // SESSION RULES
  if (hour >= 6 && hour < 12) {
    session = "morning";
  } else if (hour >= 12 && hour < 18) {
    session = "afternoon";
  } else {
    return NextResponse.json(
      { error: "Attendance allowed only from 6AM to 6PM" },
      { status: 400 }
    );
  }

  try {

    // ===============================
    // AUTO CLOSE MORNING AT 12PM
    // ===============================
    if (session === "afternoon") {

      const { data: morningRecord } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .eq("session", "morning")
        .maybeSingle();

      if (morningRecord && !morningRecord.time_out) {

        const noon = new Date();
        noon.setHours(12, 0, 0, 0);

        await supabase
          .from("attendance")
          .update({ time_out: noon.toISOString() })
          .eq("id", morningRecord.id);

      }
    }

    // ===============================
    // CHECK CURRENT SESSION RECORD
    // ===============================
    const { data: record } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .eq("session", session)
      .maybeSingle();

    // ===============================
    // TIME IN
    // ===============================
    if (action === "time_in") {

      if (record?.time_in) {
        return NextResponse.json(
          { error: "Already timed in for this session" },
          { status: 400 }
        );
      }

      if (!record) {

        await supabase
          .from("attendance")
          .insert({
            user_id: userId,
            date: today,
            session,
            time_in: now.toISOString()
          });

      } else {

        await supabase
          .from("attendance")
          .update({
            time_in: now.toISOString()
          })
          .eq("id", record.id);

      }

      return NextResponse.json({
        message: `Time in recorded (${session})`
      });
    }

    // ===============================
    // TIME OUT
    // ===============================
    if (action === "time_out") {

      if (!record?.time_in) {
        return NextResponse.json(
          { error: "You must time in first" },
          { status: 400 }
        );
      }

      if (record.time_out) {
        return NextResponse.json(
          { error: "Already timed out" },
          { status: 400 }
        );
      }

      await supabase
        .from("attendance")
        .update({
          time_out: now.toISOString()
        })
        .eq("id", record.id);

      return NextResponse.json({
        message: `Time out recorded (${session})`
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