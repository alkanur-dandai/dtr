import { supabase } from "@/app/lib/supabase";
import { supabaseAdmin } from "@/app/lib/supabase/server";

interface Log {
  date: string;
  morning_in?: string | null;
  morning_out?: string | null;
  afternoon_in?: string | null;
  afternoon_out?: string | null;
}

export default async function TimeLog({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;   // ✅ FIX
  const userId = Number(id);

  if (!userId) {
    return <div className="p-6 text-red-500">Invalid or missing user ID</div>;
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, name, student_no")
    .eq("id", userId)
    .maybeSingle();

  if (!user) {
    return <div className="p-6 text-red-500">User not found</div>;
  }

  const { data: logsRaw } = await supabase
    .from("attendance")
    .select("date, session, time_in, time_out")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  const logs: Log[] = [];

  logsRaw?.forEach((log) => {
    let existing = logs.find((l) => l.date === log.date);

    if (!existing) {
      existing = { date: log.date };
      logs.push(existing);
    }

    if (log.session === "morning") {
      existing.morning_in = log.time_in;
      existing.morning_out = log.time_out;
    }

    if (log.session === "afternoon") {
      existing.afternoon_in = log.time_in;
      existing.afternoon_out = log.time_out;
    }
  });


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center gap-4 mb-8 border-b pb-6">
        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
          IMG
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#7D1C4A] uppercase">
            {user?.name || "--"}
          </h2>

          <p className="text-sm text-[#7D1C4A] uppercase">
            ID: {user?.student_no || "--"}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-sm uppercase">
              <th className="p-3 border-b text-[#7D1C4A]">Date</th>
              <th className="p-3 border-b text-[#7D1C4A]">Morning In</th>
              <th className="p-3 border-b text-[#7D1C4A]">Morning Out</th>
              <th className="p-3 border-b text-[#7D1C4A]">Afternoon In</th>
              <th className="p-3 border-b text-[#7D1C4A]">Afternoon Out</th>
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-500">
                  No attendance logs
                </td>
              </tr>
            )}

            {logs.map((log, index) => (
              <tr key={index} className="hover:bg-slate-50">
                <td className="p-3 border-b text-[#7D1C4A]">
                  {log.date
                    ? new Date(log.date).toLocaleDateString()
                    : "--"}
                </td>

                <td className="p-3 border-b text-[#7D1C4A]">
                  {log.morning_in
                    ? new Date(log.morning_in).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--"}
                </td>

                <td className="p-3 border-b text-[#7D1C4A]">
                  {log.morning_out
                    ? new Date(log.morning_out).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--"}
                </td>

                <td className="p-3 border-b text-[#7D1C4A]">
                  {log.afternoon_in
                    ? new Date(log.afternoon_in).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--"}
                </td>

                <td className="p-3 border-b text-[#7D1C4A]">
                  {log.afternoon_out
                    ? new Date(log.afternoon_out).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}