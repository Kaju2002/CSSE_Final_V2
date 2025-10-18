import React, { useState } from 'react';
import { Pagination } from './Pagination';

export default function PaginatedList() {
  const itemsPerPage = 5;
  const totalItems = 42; // example
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);

  // Generate mock data for demo
  const items = Array.from({ length: totalItems }, (_, i) => `Item ${i + 1}`);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Paginated Item List
        </h1>

        <ul className="divide-y divide-gray-200 mb-6">
          {currentItems.map((item, index) => (
            <li
              key={index}
              className="py-3 px-2 hover:bg-gray-50 transition rounded-lg"
            >
              {item}
            </li>
          ))}
        </ul>

        {/* Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          maxVisiblePages={5}
          showFirstLast={true}
        />
      </div>
    </div>
  );
}
