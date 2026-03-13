"use client";

import { useEffect, useState } from "react";
import ActionButton from "./component/Button";
import { handleAttendanceAction } from "./services/attendance";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AddUserModal from "./component/AddUserModal"; 


interface User {
  id: number;
  name: string;
  student_no: string;
  time_in?: string | null;
  time_out?: string | null;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch("/api/user");
        const data = await response.json();

        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error("Failed to fetch:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  async function refreshUsers() {
    try {
      const response = await fetch("/api/user");
      const data = await response.json();

      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    }
  }

  async function handleAction(
    userId: number,
    action: "time_in" | "time_out"
  ) {
    try {
      const result = await handleAttendanceAction(userId, action);

      alert(result.message);

      // refresh users after action
      refreshUsers();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }

  /* LOADING SCREEN */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold text-gray-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* HEADER */}
      <header className="bg-white p-6 rounded-lg shadow-sm mb-6 flex items-center justify-between">

        <div className="flex items-center gap-5">

          <div className="w-24 h-24 rounded-full border-4 border-[#7D1C4A] overflow-hidden"></div>

          <div>
            <span className="text-m font-bold text-[#7D1C4A] uppercase">
              Student No:
            </span>

            <div className="text-[#7D1C4A] font-medium"></div>
          </div>

        </div>

              <button
        onClick={() => setShowModal(true)}
        className="bg-[#7D1C4A] text-white px-5 py-2 rounded-lg"
      >
        + Add User
      </button>

      <AddUserModal
  show={showModal}
  onClose={() => setShowModal(false)}
/>
      </header>

      {/* LOGS */}
      <main className="bg-white p-10 rounded-lg shadow-sm border-t-8 border-[#7D1C4A] min-h-[400px]">

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Daily Time Record
        </h2>

        <div className="space-y-2 uppercase">

          {/* IF NO USERS */}
          {users.length === 0 && (
            <p className="text-gray-500">No users found.</p>
          )}

          {/* USER LIST */}
          {users.map((user) => (
            <div
              key={user.id}
              className="p-3 bg-yellow-50 border border-yellow-200 rounded flex justify-between items-center"
            >

              {/* USER INFO */}
              <div>
                <p className="font-semibold text-[#7D1C4A]">
                  {user.name}
                </p>

                <p className="text-sm text-gray-600">
                  {user.student_no}
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2">

                <ActionButton
                  label="Time In"
                  color="bg-[#7D1C4A]"
                  disabled={user.time_in !== null && user.time_in !== undefined}
                  onClick={() => handleAction(user.id, "time_in")}
                />

                <ActionButton
                  label="Time Out"
                  color="bg-[#7D1C4A]"
                  disabled={user.time_out !== null && user.time_out !== undefined}
                  onClick={() => handleAction(user.id, "time_out")}
                />

                <ActionButton
                  label="view log"
                  color="bg-[#84B179]"
                  onClick={() => router.push(`/userprofile/${user.id}`)}
                />

              </div>

            </div>
          ))}

        </div>

      </main>

    </div>
  );
}