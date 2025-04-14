"use client";
import React, { useState, RefObject, useRef } from "react";
import { FaEye, FaEyeSlash, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Category, Feature } from "./types/feature";
import { rainbow } from "./components/colors";

interface SidebarProps {
  categories: Category[]
  onFeatureToggle: ((feature: Feature) => void)
  onCategoryToggle: ((category: Category) => void)
}

// Sidebar component
const Sidebar = ({ categories, onFeatureToggle, onCategoryToggle }: SidebarProps) => {
  const onFeatureToggleRef = useRef<typeof onFeatureToggle>(null);
  onFeatureToggleRef.current = onFeatureToggle; 
  const onCategoryToggleRef = useRef<typeof onCategoryToggle>(null);
  onCategoryToggleRef.current = onCategoryToggle;

  const [activeDropdowns, setActiveDropdowns] = useState<{ [key: string]: boolean }>({});
  const [visibleItems, setVisibleItems] = useState<{ [key: string]: boolean }>(() => {
    // Initialize all categories and features to visible (true)
    const initialState: { [key: string]: boolean } = {};

    categories.forEach(category => {
      initialState[category.name] = true;
      // Initialize all features under each category to visible
      category.features.forEach((_, index) => {
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

  const toggleFeature = (feature: Feature) => {
    onFeatureToggleRef.current?.(feature);
  };

  const toggleCategory = (category: Category) => {
    onCategoryToggleRef.current?.(category);
  }

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
                onClick={() => toggleCategory(category)}
                title={category.visible ? "Hide Category" : "Show Category"}
              >
                {category.visible ? <FaEye /> : <FaEyeSlash />}
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
                        onClick={() => toggleFeature(feature)}
                        title={feature.visible ? "Hide Feature" : "Show Feature"}
                      >
                        {feature.visible ? <FaEye /> : <FaEyeSlash />}
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
