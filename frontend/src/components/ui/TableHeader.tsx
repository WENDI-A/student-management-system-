import React from "react";

export function TableHeader({ headers }: { headers: React.ReactNode[] }) {
  return (
    <thead>
      <tr className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
        {headers.map((header, idx) => (
          <th
            key={idx}
            className="px-2 sm:px-4 py-2 text-left whitespace-nowrap font-semibold"
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );
} 