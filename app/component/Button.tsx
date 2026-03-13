"use client";

interface Props {
  label: string;
  color: string;
  disabled?: boolean;
  onClick: () => void;
}

export default function ActionButton({
  label,
  color,
  onClick,
  disabled = false
}: Props) {

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`px-3 py-1 text-white rounded 
      ${disabled ? "bg-gray-400 cursor-not-allowed" : color}`}
    >
      {label}
    </button>
  );
}