import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

export async function POST(req: Request) {
  const { userId, action } = await req.json();

  const now = new Date();
  const hour = now.getHours();

  if (hour < 7 || hour >= 18) {
    return NextResponse.json(
      { error: "Attendance allowed only between 7AM and 6PM" },
      { status: 400 }
    );
  }

  let session: "morning" | "afternoon" = "morning";

  if (hour >= 12) {
    session = "afternoon";
  }

  try {

    const { data: record } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .eq("date", new Date().toISOString().split("T")[0])
      .eq("session", session)
      .single();

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
          date: new Date().toISOString().split("T")[0],
          session,
          time_in: new Date()
        });

      } else {

        await supabase
          .from("attendance")
          .update({ time_in: new Date() })
          .eq("id", record.id);

      }

      return NextResponse.json({
        message: `Time in recorded (${session})`
      });
    }

    if (action === "time_out") {

      if (!record?.time_in) {
        return NextResponse.json(
          { error: "Time in first" },
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
        .update({ time_out: new Date() })
        .eq("id", record.id);

      return NextResponse.json({
        message: `Time out recorded (${session})`
      });
    }

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );

  }
}