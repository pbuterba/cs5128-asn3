"use client";
import { useState, useEffect } from "react";
import Sidebar from "../app/Sidebar";   // Corrected import path
import CoralPlot from "../app/CoralPlot";   // Corrected import path
import Filter from "../app/Filter";   // Corrected import path
import "../app/globals.css"; // This assumes globals.css is in src/
 // Correct path to styles directory


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

  const [fileNames, setFileNames] = useState([]);
  const [features, setFeatures] = useState<string[]>([]); // Correctly initialize as an empty array

  // Handle file upload
  useEffect(() => {
    fetch("/api/file/upload", {
      method: "POST",
      body: JSON.stringify({ fileName: "test2", csv: exampleCsv }),
    })
      .then((response) => response.json())
      .then((json) => console.log("File Created With Name:", json));
  }, []);

  // Fetch available files
  useEffect(() => {
    fetch("/api/file/available", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((json) => setFileNames(json)); // Set available file names in state
  }, []);

  useEffect(() => {
    fetch("/api/features", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileName: "test", numCategories: 3 }),
    })
      .then((response) => response.json())
      .then((json) => {
        console.log("Features data:", json); // Inspect the response format
        if (Array.isArray(json)) {
          setFeatures(json); // Set features if the response is an array
        } else {
          console.error("Invalid data format for features:", json);
          setFeatures([]); // Fallback to an empty array if the data isn't valid
        }
      })
      .catch((error) => {
        console.error("Error fetching features:", error);
        setFeatures([]); // Fallback in case of an error
      });
  }, []);

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="main-content">
        <h1>Untitled Coral Plot of WebEx Features</h1>
        
        {/* Filters Section */}
        <div className="filters-section">
          <div>
            <label>Number of Categories</label>
            <input type="number" defaultValue={6} />
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

        {/* Coral Plot */}
        <CoralPlot />
        
        {/* Displaying Available File Names */}
        <div>
          <h2>Available Files:</h2>
          <ul>
            {fileNames.map((fileName: string, index: number) => (
              <li key={index}>{fileName}</li>
            ))}
          </ul>
        </div>

        {/* Displaying Features */}
        <div>
          <h2>Provided Features:</h2>
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