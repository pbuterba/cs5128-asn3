import React, { useState } from 'react';

// Sidebar component
const Sidebar = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const categories = [
    "Logging",
    "Networking",
    "User Experience",
    "Visual Fidelity",
    "Communication",
    "Audio"
  ];

  return (
    <div className="sidebar">
      <ul>
        {categories.map((category) => (
          <li key={category}>
            <div
              className="dropdown-header"
              onClick={() => toggleDropdown(category)}
            >
              <span>{category}</span>
              <span>{activeDropdown === category ? '▲' : '▼'}</span>
            </div>
            {activeDropdown === category && (
              <ul className="dropdown-list">
                {[...Array(5)].map((_, index) => (
                  <li key={`${category}-feature-${index}`}>
                    <span>Feature {index + 1}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
