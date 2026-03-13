import db from "@/app/lib/db";

interface Log {
  date: string;
  morning_in: string | null;
  morning_out: string | null;
  afternoon_in: string | null;
  afternoon_out: string | null;
}

export default async function TimeLog({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;
  const userId = id;

  // GET USER
  const userResult = await db.query(
    `SELECT id, name, student_no FROM users WHERE id = $1`,
    [userId]
  );

  const user = userResult.rows[0];

  // GET ATTENDANCE
  const logsResult = await db.query(
    `
    SELECT
      date,
      MAX(time_in) FILTER (WHERE session='morning') AS morning_in,
      MAX(time_out) FILTER (WHERE session='morning') AS morning_out,
      MAX(time_in) FILTER (WHERE session='afternoon') AS afternoon_in,
      MAX(time_out) FILTER (WHERE session='afternoon') AS afternoon_out
    FROM attendance
    WHERE user_id = $1
    GROUP BY date
    ORDER BY date DESC
    `,
    [userId]
  );

  const logs: Log[] = logsResult.rows;

  return (

    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 border-b pb-6">

        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
          IMG
        </div>

        <div>

          <h2 className="text-xl font-semibold text-[#7D1C4A] uppercase">
            {user?.name}
          </h2>

          <p className="text-sm text-slate-500  text-[#7D1C4A] uppercase ">
            ID: {user?.student_no}
          </p>

        </div>

      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="w-full text-left border-collapse">

          <thead>

            <tr className="text-slate-400 text-sm uppercase">

              <th className="p-3 border-b text-[#7D1C4A] uppercase">Date</th>
              <th className="p-3 border-b text-[#7D1C4A] uppercase">Morning In</th>
              <th className="p-3 border-b text-[#7D1C4A] uppercase">Morning Out</th>
              <th className="p-3 border-b text-[#7D1C4A] uppercase">Afternoon In</th>
              <th className="p-3 border-b text-[#7D1C4A] uppercase">Afternoon Out</th>

            </tr>

          </thead>

          <tbody>

            {logs.map((log, index) => (

              <tr key={index} className="hover:bg-slate-50">

              <td className="p-3 border-b text-[#7D1C4A] uppercase">
                {log.date ? new Date(log.date).toLocaleDateString() : "--"}
              </td>

              <td className="p-3 border-b text-[#7D1C4A] uppercase">
                {log.morning_in ? new Date(log.morning_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}
              </td>

              <td className="p-3 border-b text-[#7D1C4A] uppercase">
                {log.morning_out ? new Date(log.morning_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}
              </td>

              <td className="p-3 border-b text-[#7D1C4A] uppercase">
                {log.afternoon_in ? new Date(log.afternoon_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}
              </td>

              <td className="p-3 border-b text-[#7D1C4A] uppercase">
                {log.afternoon_out ? new Date(log.afternoon_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}
              </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}