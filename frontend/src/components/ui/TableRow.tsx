import React from "react";

export function TableRow({
  cells,
  className = "",
  onClick,
}: {
  cells: React.ReactNode[];
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      className={
        "border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors " +
        className
      }
      onClick={onClick}
    >
      {cells.map((cell, idx) => (
        <td
          key={idx}
          className="px-2 sm:px-4 py-2 whitespace-nowrap text-gray-900 dark:text-gray-100"
        >
          {cell}
        </td>
      ))}
    </tr>
  );
} 