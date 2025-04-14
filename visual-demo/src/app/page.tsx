"use client";
import { useState, useEffect } from "react";
import Sidebar from "../app/Sidebar";   // Corrected import path
import CoralPlot from "../app/CoralPlot";   // Corrected import path
import "../app/globals.css"; // Correct path to styles directory

export default function Home() {
  const exampleCsv = [
    "description,date,category",
    "This feature allows users to schedule and join meetings seamlessly.,01-02-2022,video conferencing",
    "It provides screen sharing and collaborative tools.,02-02-2022,project management",
    "Users can record meetings for later review.,03-02-2022,analytics",
    "The system integrates with calendars to remind of upcoming meetings.,04-02-2022,collaboration",
    "It supports virtual backgrounds and noise suppression for clear communications.,05-02-2022,screen sharing",
    "Secure authentication for participants is enabled.,06-02-2022,live chat",
    "A customizable waiting room enhances meeting security.,07-02-2022,remote meetings",
    "Users can chat, share files, and collaborate during meetings.,08-02-2022,file sharing",
    "The user interface is intuitive and user-friendly.,09-02-2022,CRM",
    "The platform supports high-definition video and audio.,10-02-2022,marketing",
    "It allows for breakout rooms to facilitate small group discussions.,11-02-2022,video conferencing",
    "The feature is accessible on various devices across operating systems.,12-02-2022,project management",
    "Real-time transcription is available for enhanced accessibility.,13-02-2022,analytics",
    "The tool supports multiple languages for global teams.,14-02-2022,collaboration",
    "Interactive whiteboard features enable dynamic presentations.,15-02-2022,screen sharing",
    "Event scheduling is integrated with automated reminders.,16-02-2022,live chat",
    "It offers robust analytics on meeting performance and engagement.,17-02-2022,remote meetings",
    "The platform includes end-to-end encryption for maximum privacy.,18-02-2022,file sharing",
    "Scheduling features automatically sync with users' calendars.,19-02-2022,CRM",
    "It delivers smooth integration with third-party productivity apps.,20-02-2022,marketing",
  ];

  const [fileNames, setFileNames] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [numCategories, setNumCategories] = useState(6);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setSelectedFile(file);
      // Add the new file to the fileNames list
      setFileNames(prevFiles => [...prevFiles, file.name]);
      setSelectedFileName(file.name);
      // You can then process the file (upload it to the server, read it, etc.)
      console.log("File selected:", file);
    }
  };

  // Handle file selection from dropdown
  const handleFileSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFileName(e.target.value);
  };

  // Handle number of categories change
  const handleNumCategoriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      // Cap the value between 1 and 6
      const cappedValue = Math.min(Math.max(value, 1), 6);
      setNumCategories(cappedValue);
    }
  };

  // Handle file upload (example)
  useEffect(() => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("csv", selectedFile);

      fetch("/api/file/upload", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((json) => console.log("File Uploaded:", json))
        .catch((error) => console.error("Error uploading file:", error));
    }
  }, [selectedFile]);

  // Fetch available files
  useEffect(() => {
    fetch("/api/file/available", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((json) => setFileNames(json));
  }, []);

  return (
    <div className="layout-container">
      <Sidebar numCategories={numCategories} />

      <div className="main-content">
        <h1>Untitled Coral Plot of WebEx Features</h1>

        {/* Add CSV Upload Button and Dropdown */}
        <div className="csv-upload-section">
          <button onClick={() => document.getElementById("file-input")?.click()}>
            Upload CSV
          </button>
          <input
            id="file-input"
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <select 
            value={selectedFileName} 
            onChange={handleFileSelect}
            className="file-dropdown"
          >
            <option value="">Select a CSV file</option>
            {fileNames.map((fileName: string, index: number) => (
              <option key={index} value={fileName}>
                {fileName}
              </option>
            ))}
          </select>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div>
            <label>Number of Categories</label>
            <input 
              type="number" 
              value={numCategories}
              onChange={handleNumCategoriesChange}
              min="1"
              max="6"
            />
          </div>
          <div>
            <label>Filter</label>
            <input type="text" placeholder="Filter String" />
            <button>Filter</button>
          </div>
          <div>
            <label>Start Date</label>
            <input type="date" defaultValue="2024-08-01" />
          </div>
          <div>
            <label>End Date</label>
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
        </div>

        <CoralPlot />

        <div>
          <ul>
            {fileNames.map((fileName: string, index: number) => (
              <li key={index}>{fileName}</li>
            ))}
          </ul>
        </div>

        <div>
          <ul>
            {Array.isArray(features) && features.map((feature: string, index: number) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
