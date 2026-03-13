"use client";

import { supabase } from "@/app/lib/supabase";
import { useState } from "react";

interface Props {
  show: boolean;
  onClose: () => void;
}

export default function AddUserModal({ show, onClose }: Props) {
  const [name, setName] = useState("");
  const [studentNo, setStudentNo] = useState("");
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !studentNo) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("users")
      .insert([{ name, student_no: studentNo }]);

    setLoading(false);

    if (error) {
      alert("Error adding user: " + error.message);
    } else {
      alert("User added successfully!");
      setName("");
      setStudentNo("");
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-[#7D1C4A]">Add User</h2>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Student Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Student Number"
            value={studentNo}
            onChange={(e) => setStudentNo(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#7D1C4A] text-white rounded"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}