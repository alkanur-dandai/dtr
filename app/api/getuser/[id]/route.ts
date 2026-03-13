// import { NextResponse } from "next/server";
// import db from "@/app/lib/db";

// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {

//   const userId = params.id;

//   const userResult = await db.query(
//     `SELECT id, name, student_no FROM users WHERE id = $1`,
//     [userId]
//   );

//   if (userResult.rows.length === 0) {
//     return NextResponse.json(
//       { error: "User not found" },
//       { status: 404 }
//     );
//   }

//   const logsResult = await db.query(
//     `
//     SELECT
//       date,
//       MAX(time_in) FILTER (WHERE session='morning') AS morning_in,
//       MAX(time_out) FILTER (WHERE session='morning') AS morning_out,
//       MAX(time_in) FILTER (WHERE session='afternoon') AS afternoon_in,
//       MAX(time_out) FILTER (WHERE session='afternoon') AS afternoon_out
//     FROM attendance
//     WHERE user_id = $1
//     GROUP BY date
//     ORDER BY date DESC
//     `,
//     [userId]
//   );

//   return NextResponse.json({
//     user: userResult.rows[0],
//     logs: logsResult.rows
//   });

// }