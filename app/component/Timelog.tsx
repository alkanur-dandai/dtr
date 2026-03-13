interface Log {
  date: string;
  morning_in: string | null;
  morning_out: string | null;
  afternoon_in: string | null;
  afternoon_out: string | null;
}

interface Props {
  name: string;
  student_no: string;
  logs: Log[];
}

function formatTime(time: string | null) {

  if (!time) return "-";

  return new Date(time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

}

export default function TimeLogs({
  name,
  student_no,
  logs
}: Props) {

  return (

    <div className="min-h-screen bg-gray-50 p-6">

      <div className="flex gap-4 mb-6">

        <div className="w-16 h-16 bg-gray-200 rounded-full" />

        <div>

          <h2 className="text-xl font-semibold">
            {name}
          </h2>

          <p className="text-gray-500">
            ID: {student_no}
          </p>

        </div>

      </div>

      <table className="w-full">

        <thead>

          <tr className="text-gray-500">

            <th>Date</th>
            <th>Morning In</th>
            <th>Morning Out</th>
            <th>Afternoon In</th>
            <th>Afternoon Out</th>

          </tr>

        </thead>

        <tbody>

          {logs.map((log, i) => (

            <tr key={i}>

              <td>{log.date}</td>
              <td>{formatTime(log.morning_in)}</td>
              <td>{formatTime(log.morning_out)}</td>
              <td>{formatTime(log.afternoon_in)}</td>
              <td>{formatTime(log.afternoon_out)}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
}