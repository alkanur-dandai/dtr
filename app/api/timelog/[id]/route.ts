import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {

  const result = await pool.query(
    `
    SELECT 
      date,

      MAX(CASE WHEN session='morning' THEN time_in END) AS morning_in,
      MAX(CASE WHEN session='morning' THEN time_out END) AS morning_out,

      MAX(CASE WHEN session='afternoon' THEN time_in END) AS afternoon_in,
      MAX(CASE WHEN session='afternoon' THEN time_out END) AS afternoon_out

    FROM attendance
    WHERE user_id=$1
    GROUP BY date
    ORDER BY date DESC
    `,
    [params.id]
  );

  return NextResponse.json(result.rows);

}