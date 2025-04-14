"use client";
import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Category, Feature } from "./types/feature";
import { rainbow } from "./components/colors";

interface SidebarProps {
  categories: Category[]
}

// Sidebar component
const Sidebar = ({ categories }: SidebarProps) => {
  const [activeDropdowns, setActiveDropdowns] = useState<{ [key: string]: boolean }>({});
  const [visibleItems, setVisibleItems] = useState<{ [key: string]: boolean }>(() => {
    // Initialize all categories and features to visible (true)
    const initialState: { [key: string]: boolean } = {};

    categories.forEach(category => {
      initialState[category.name] = true;
      // Initialize all features under each category to visible
      [...Array(5)].forEach((_, index) => {
        initialState[`${category}-feature-${index}`] = true;
      });
    });

    return initialState;
  });

  const toggleDropdown = (name: string) => {
    setActiveDropdowns((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const toggleVisibility = (itemId: string, isCategory: boolean = false) => {
    setVisibleItems((prev) => {
      const newState = { ...prev };
      const newVisibility = !prev[itemId];
      newState[itemId] = newVisibility;

      // If this is a category toggle, update all features under this category
      if (isCategory) {
        [...Array(5)].forEach((_, index) => {
          const featureId = `${itemId}-feature-${index}`;
          newState[featureId] = newVisibility;
        });
      }

      return newState;
    });
  };

  return (
    <div className="sidebar">
      <h2>Feature Visibility</h2>
      <ul className="category-list">
        {categories.map((category: Category, i) => (
          <li key={category.name} className="category-item">
            <div className="category-header">
              <div
                className="dropdown-header"
                onClick={() => toggleDropdown(category.name)}
                style={{ borderLeft: `4px solid ${rainbow(categories.length, i)}` }}
              >
                <span>{category.name}</span>
                {activeDropdowns[category.name] ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              <button
                className="visibility-toggle"
                onClick={() => toggleVisibility(category.name, true)}
                title={visibleItems[category.name] ? "Hide Category" : "Show Category"}
              >
                {visibleItems[category.name] ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {activeDropdowns[category.name] && (
              <ul className="dropdown-list">
                {category.features.map((feature: Feature, index) => {
                  const featureId = `${category.name}-feature-${index}`;
                  return (
                    <li key={featureId} className="feature-item">
                      <span>{feature.description}</span>
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
