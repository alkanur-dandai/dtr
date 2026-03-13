import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

export async function POST(req: Request) {
  const { userId, action } = await req.json();

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const timeDecimal = hour + minute / 60; // convert to decimal for comparison
  const today = new Date().toISOString().split("T")[0];

  let session: "morning" | "afternoon";

  // ==========================
  // SESSION RULES
  // ==========================
  if (timeDecimal >= 6 && timeDecimal < 12) {
    session = "morning";
  } else if (timeDecimal >= 12 && timeDecimal < 18) {
    session = "afternoon";
  } else {
    return NextResponse.json(
      { error: "Attendance allowed only from 6:00 AM to 5:59 PM" },
      { status: 400 }
    );
  }

  try {
    // ==========================
    // AUTO CLOSE MORNING AT 12 PM
    // ==========================
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

    // ==========================
    // AUTO CLOSE AFTERNOON AT 5 PM
    // ==========================
    const { data: afternoonRecord } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .eq("session", "afternoon")
      .maybeSingle();

    if (afternoonRecord && !afternoonRecord.time_out) {
      const autoAfternoonTime = new Date();
      autoAfternoonTime.setHours(17, 0, 0, 0); // 5:00 PM

      // Only auto close if current time is past 5:00 PM
      if (now >= autoAfternoonTime) {
        await supabase
          .from("attendance")
          .update({ time_out: autoAfternoonTime.toISOString() })
          .eq("id", afternoonRecord.id);
      }
    }

    // ==========================
    // GET CURRENT SESSION RECORD
    // ==========================
    const { data: record } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .eq("session", session)
      .maybeSingle();

    // ==========================
    // TIME IN
    // ==========================
    if (action === "time_in") {
      if (record?.time_in) {
        return NextResponse.json(
          { error: "Already timed in for this session" },
          { status: 400 }
        );
      }

      if (!record) {
        await supabase.from("attendance").insert({
          user_id: userId,
          date: today,
          session,
          time_in: now.toISOString(),
        });
      } else {
        await supabase
          .from("attendance")
          .update({ time_in: now.toISOString() })
          .eq("id", record.id);
      }

      return NextResponse.json({
        message: `Time in recorded (${session})`,
      });
    }

    // ==========================
    // TIME OUT
    // ==========================
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
        .update({ time_out: now.toISOString() })
        .eq("id", record.id);

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