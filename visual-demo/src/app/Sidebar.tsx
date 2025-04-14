"use client";
import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaChevronDown, FaChevronUp } from "react-icons/fa";

interface SidebarProps {
  numCategories: number;
}

// Sidebar component
const Sidebar = ({ numCategories }: SidebarProps) => {
  const [activeDropdowns, setActiveDropdowns] = useState<{ [key: string]: boolean }>({});
  const [visibleItems, setVisibleItems] = useState<{ [key: string]: boolean }>({});

  const toggleDropdown = (name: string) => {
    setActiveDropdowns((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const toggleVisibility = (itemId: string) => {
    setVisibleItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Generate categories based on numCategories
  const categories = [
    { name: "Logging", color: "#4CAF50" },
    { name: "Networking", color: "#2196F3" },
    { name: "User Experience", color: "#9C27B0" },
    { name: "Visual Fidelity", color: "#FF9800" },
    { name: "Communication", color: "#E91E63" },
    { name: "Audio", color: "#00BCD4" },
    { name: "Performance", color: "#FF5722" },
    { name: "Security", color: "#795548" },
    { name: "Integration", color: "#607D8B" },
    { name: "Analytics", color: "#009688" },
    { name: "Automation", color: "#673AB7" },
    { name: "Collaboration", color: "#3F51B5" },
    { name: "Customization", color: "#FFC107" },
    { name: "Mobile", color: "#8BC34A" },
    { name: "API", color: "#FF4081" },
    { name: "Storage", color: "#00BCD4" },
    { name: "Search", color: "#FF9800" },
    { name: "Notifications", color: "#9C27B0" },
    { name: "Reporting", color: "#4CAF50" },
    { name: "Workflow", color: "#2196F3" },
  ].slice(0, numCategories);

  return (
    <div className="sidebar">
      <h2>Feature Visibility</h2>
      <ul className="category-list">
        {categories.map((category) => (
          <li key={category.name} className="category-item">
            <div className="category-header">
              <div
                className="dropdown-header"
                onClick={() => toggleDropdown(category.name)}
                style={{ borderLeft: `4px solid ${category.color}` }}
              >
                <span>{category.name}</span>
                {activeDropdowns[category.name] ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              <button
                className="visibility-toggle"
                onClick={() => toggleVisibility(category.name)}
                title={visibleItems[category.name] ? "Hide Category" : "Show Category"}
              >
                {visibleItems[category.name] ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {activeDropdowns[category.name] && (
              <ul className="dropdown-list">
                {[...Array(5)].map((_, index) => {
                  const featureId = `${category.name}-feature-${index}`;
                  return (
                    <li key={featureId} className="feature-item">
                      <span>Feature {index + 1}</span>
                      <button
                        className="visibility-toggle"
                        onClick={() => toggleVisibility(featureId)}
                        title={visibleItems[featureId] ? "Hide Feature" : "Show Feature"}
                      >
                        {visibleItems[featureId] ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
