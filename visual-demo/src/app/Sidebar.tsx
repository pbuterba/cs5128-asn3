"use client";
import React, { useState } from "react";

// Sidebar component
const Sidebar = () => {
  const [activeDropdowns, setActiveDropdowns] = useState<{ [key: string]: boolean }>({});

  const toggleDropdown = (name: string) => {
    setActiveDropdowns((prev) => ({
      ...prev,
      [name]: !prev[name], // Toggle the state of the clicked dropdown
    }));
  };

  const categories = [
    "Logging",
    "Networking",
    "User Experience",
    "Visual Fidelity",
    "Communication",
    "Audio",
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
              <span>{activeDropdowns[category] ? "▲" : "▼"}</span>
            </div>
            {activeDropdowns[category] && (
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
