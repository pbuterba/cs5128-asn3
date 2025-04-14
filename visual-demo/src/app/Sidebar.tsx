"use client";
import React, { useState, useRef, JSX } from "react";
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
  };
  
  const FeatureItem = ({
    feature,
    path,
    onToggleDropdown,
    isOpen,
  }: {
    feature: Feature;
    path: string;
    onToggleDropdown: (path: string) => void;
    isOpen: boolean;
  }) => {
    const hasChildren = feature.childFeatures?.length > 0;
  
    return (
      <li key={path} className="feature-item" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Left: title + dropdown toggle */}
        <div
          className="dropdown-header"
          onClick={() => hasChildren && onToggleDropdown(path)}
          style={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            cursor: hasChildren ? "pointer" : "default",
            padding: "0.25rem 0.5rem",
            gap: "0.5rem",
          }}
        >
          <span>{feature.description}</span>
          {hasChildren && (
            <span className="dropdown-toggle">
              {isOpen ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          )}
        </div>
  
        {/* Right: visibility icon */}
        <button
          className="visibility-toggle"
          onClick={() => toggleFeature(feature)}
          title={feature.visible ? "Hide Feature" : "Show Feature"}
          style={{ marginLeft: "0.5rem", flexShrink: 0 }}
        >
          {feature.visible ? <FaEye /> : <FaEyeSlash />}
        </button>
      </li>
    );
  };

  const FeatureList = ({
    features,
    activeDropdowns,
    toggleDropdown,
    parentPath = "",
  }: {
    features: Feature[];
    activeDropdowns: Record<string, boolean>;
    toggleDropdown: (path: string) => void;
    parentPath?: string;
  }) => {
    const renderFeatures = (features: Feature[], parentPath = ""): JSX.Element[] => {
      let items: JSX.Element[] = [];
  
      features.forEach((feature, index) => {
        const path = parentPath ? `${parentPath}-child-${index}` : `${index}`;
        const isOpen = activeDropdowns[path] ?? false;
  
        items.push(
          <FeatureItem
            key={path}
            feature={feature}
            path={path}
            isOpen={isOpen}
            onToggleDropdown={toggleDropdown}
          />
        );
  
        if (isOpen && feature.childFeatures?.length) {
          const childItems = renderFeatures(feature.childFeatures, path);
          items = items.concat(childItems);
        }
      });
  
      return items;
    };
  
    return <ul className="feature-list">{renderFeatures(features, parentPath)}</ul>;
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
                onClick={() => toggleCategory(category)}
                title={category.visible ? "Hide Category" : "Show Category"}
              >
                {category.visible ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {activeDropdowns[category.name] && (
              <FeatureList
                key={`${category.name}-features-${i}`}
                features={category.features}
                activeDropdowns={activeDropdowns}
                toggleDropdown={toggleDropdown}
                parentPath={`${i}`}
              />
            )}    
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
