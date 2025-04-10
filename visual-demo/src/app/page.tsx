"use client";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    fetch("/api/file/upload", {
      method: "POST",
      body: JSON.stringify({ fileName: "test2", csv: exampleCsv }),
    })
      .then((response) => response.json())
      .then((json) => console.log("File Created With Name:", json));
  }, []);

  useEffect(() => {
    fetch("/api/file/available", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((json) => console.log("File Names available:", json));
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
      .then((json) => console.log("Provided Features:", json));
  }, []);

  return (
    <div>
      <h1>Next.js API</h1>
    </div>
  );
}
