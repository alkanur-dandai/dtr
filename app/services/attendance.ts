export async function handleAttendanceAction(
  userId: number,
  action: "time_in" | "time_out"
) {

  const res = await fetch("/api/attendance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      action,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
}