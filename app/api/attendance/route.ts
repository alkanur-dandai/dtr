import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

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

    const existing = await pool.query(
      `SELECT * FROM attendance
       WHERE user_id=$1 AND date=CURRENT_DATE AND session=$2`,
      [userId, session]
    );

    const record = existing.rows[0];

    if (action === "time_in") {

      if (record?.time_in) {
        return NextResponse.json(
          { error: "Already timed in for this session" },
          { status: 400 }
        );
      }

      if (!record) {

        await pool.query(
          `INSERT INTO attendance (user_id,date,session,time_in)
           VALUES ($1,CURRENT_DATE,$2,NOW())`,
          [userId, session]
        );

      } else {

        await pool.query(
          `UPDATE attendance
           SET time_in = NOW()
           WHERE id=$1`,
          [record.id]
        );

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

      await pool.query(
        `UPDATE attendance
         SET time_out = NOW()
         WHERE id=$1`,
        [record.id]
      );

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