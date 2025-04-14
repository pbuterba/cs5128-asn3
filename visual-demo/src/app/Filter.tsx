// src/components/Filter.tsx

import React from 'react';

const Filter = () => {
  return (
    <div className="filters">
      <label>Filter by Category:</label>
      <select>
        <option>Category 1</option>
        <option>Category 2</option>
        <option>Category 3</option>
      </select>
      {/* Additional filter options can go here */}
    </div>
  );
};

export default Filter;
