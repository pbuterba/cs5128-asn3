"use client";
import { useState, useEffect, createRef, useRef } from "react";
import Sidebar from "../app/Sidebar";   // Corrected import path
import "../app/globals.css"; // Correct path to styles directory
import { useCallback } from "react";
import Coral from "./components/coral";
import { Category, Feature, fTreeToCategories } from "./types/feature";
import dayjs from "dayjs";
import Loader from "./components/loader";
import { mockZoomData } from "@/mockZoom";

export default function Home() {
  // Mock data structure for the categories and features, passed as props to the Coral component (dayjs objects are converted to ISO strings for serialization)
  const [categories, setCategories] = useState([
  // {
  //   name: "Networking",
  //   visible: true, // Added 'visible' attribute to category
  //   features: [
  //     {
  //       childFeatures: [
  //         {
  //           childFeatures: [{
  //             childFeatures: [],
  //             description: "Networking 2.5",
  //             timestamp: dayjs().add(3, 'year').add(1, 'month').toISOString(),
  //             visible: true, // Added 'visible' attribute to feature
  //           }],
  //           description: "Networking 2",
  //           timestamp: dayjs().add(3, 'year').add(1, 'month').toISOString(),
  //           visible: true, // Added 'visible' attribute to feature
  //         },
  //         {
  //           childFeatures: [],
  //           description: "Networking 3",
  //           timestamp: dayjs().add(4, 'year').add(3, 'month').toISOString(),
  //           visible: true, // Added 'visible' attribute to feature
  //         },
  //         {
  //           childFeatures: [],
  //           description: "Networking 4",
  //           timestamp: dayjs().add(5, 'year').add(1, 'month').toISOString(),
  //           visible: true, // Added 'visible' attribute to feature
  //         }
  //       ],
  //       description: "Networking 1",
  //       timestamp: dayjs().add(3, 'year').toISOString(),
  //       visible: true, // Added 'visible' attribute to feature
  //     },
  //     {
  //       childFeatures: [
  //         {
  //           childFeatures: [],
  //           description: "Networking 6",
  //           timestamp: dayjs().add(3, 'year').add(1, 'month').toISOString(),
  //           visible: true, // Added 'visible' attribute to feature
  //         },
  //         {
  //           childFeatures: [],
  //           description: "Networking 7",
  //           timestamp: dayjs().add(3, 'year').add(3, 'month').toISOString(),
  //           visible: true, // Added 'visible' attribute to feature
  //         },
  //         {
  //           childFeatures: [],
  //           description: "Networking 8",
  //           timestamp: dayjs().add(6, 'year').add(1, 'month').toISOString(),
  //           visible: true, // Added 'visible' attribute to feature
  //         }
  //       ],
  //       description: "Networking 5",
  //       timestamp: dayjs().add(3, 'year').toISOString(),
  //       visible: true, // Added 'visible' attribute to feature
  //     }
  //   ]
  // },
  // {
  //   name: "OS",
  //   visible: true, // Added 'visible' attribute to category
  //   features: [
  //     {
  //       childFeatures: [],
  //       description: "OS 1",
  //       timestamp: dayjs().add(3, 'year').toISOString(),
  //       visible: true, // Added 'visible' attribute to feature
  //     }
  //   ]
  // },
  // {
  //   name: "User Interface",
  //   visible: true, // Added 'visible' attribute to category
  //   features: [
  //     {
  //       childFeatures: [],
  //       description: "UI 1",
  //       timestamp: dayjs().add(3, 'year').toISOString(),
  //       visible: true, // Added 'visible' attribute to feature
  //     }
  //   ]
  // },
  // {
  //   name: "API",
  //   visible: true, // Added 'visible' attribute to category
  //   features: [
  //     {
  //       childFeatures: [],
  //       description: "API 1",
  //       timestamp: dayjs().add(3, 'year').toISOString(),
  //       visible: true, // Added 'visible' attribute to feature
  //     }
  //   ]
  // },
  // {
  //   name: "QA",
  //   visible: true, // Added 'visible' attribute to category
  //   features: [
  //     {
  //       childFeatures: [],
  //       description: "QA 1",
  //       timestamp: dayjs().add(3, 'year').toISOString(),
  //       visible: true, // Added 'visible' attribute to feature
  //     }
  //   ]
  // },
  // {
  //   name: "DevOps",
  //   visible: true, // Added 'visible' attribute to category
  //   features: [
  //     {
  //       childFeatures: [],
  //       description: "DevOps 1",
  //       timestamp: dayjs().add(3, 'year').toISOString(),
  //       visible: true, // Added 'visible' attribute to feature
  //     }
  //   ]
  // }
] as Category[]);

const [fileNames, setFileNames] = useState<string[]>([]);
  const [features] = useState<string[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [numCategories, setNumCategories] = useState(4);
  const [hoveredFeature, setHoveredFeature] = useState<Feature | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
  const coralContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isLoading, setLoading] = useState(false);
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const fileName = file.name.replace('.csv', '');
      setFileNames(prevFiles => [...prevFiles, fileName]);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const csvContent = event.target.result as string;
          const lines = csvContent.split('\n');
          
          // Process each line while preserving commas in content
          const processedLines = lines.map(line => {
            // Check if the line contains quoted content
            if (line.includes('"')) {
              // Keep the line as is if it contains quoted content
              return line;
            } else {
              // For non-quoted content, just trim whitespace
              return line.trim();
            }
          });
          
          // Send the processed CSV to the backend
          fetch("/api/file/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              csv: processedLines,
              fileName: file.name.replace('.csv', '')
            }),
          })
            .then((response) => response.json())
            .then((json) => console.log("File Uploaded:", json))
            .then(() => setLoading(false))
            .catch((error) => {console.error("Error uploading file:", error); setLoading(false)});
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle file selection from dropdown
  const handleFileSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFileName = e.target.value;
    setSelectedFileName(newFileName);
  };

  // Handle number of categories change
  const handleNumCategoriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    // Cap the value between 1 and 10
    const cappedValue = Math.min(Math.max(value, 1), 10);
    if (!isNaN(cappedValue)) {
      setNumCategories(cappedValue);
    }
  };

  const onFeatureHover = useCallback((feature: Feature | null, x?: number, y?: number) => {
    setHoveredFeature(feature);
    if (x !== undefined && y !== undefined) {
      setCursorPosition({ x, y });
    }
  }, []);

  const onCategoryToggle = useCallback( (category: Category) => {
    const catIndex = categories.indexOf(category);
    const catCopy: Category[] = [...categories];
    catCopy[catIndex].visible = !catCopy[catIndex].visible;
    setCategories(catCopy);
  }, [categories]);

  const onFeatureToggle = useCallback( (feature: Feature) => {
    const toggleFeature: (features: Feature[], feature: Feature) => boolean = (features: Feature[], feature: Feature) => features.some(
      (f: Feature) => f.description === feature.description
        ? f.visible = !f.visible
        : toggleFeature(f.childFeatures, feature)
      );
    const catCopy: Category[] = [...categories];
    categories.forEach((category: Category, i) => {
      const features = [...category.features]
      toggleFeature(features, feature);
      catCopy[i].features = features;
    });
    setCategories(catCopy);
  }, [categories]);

  // const sidebarToggleFeature = useCallback( (feature: Feature, on: boolean) => {
  //   if (on) 
  // }, [categories]);

  // Fetch available files and create resize observer for the Coral component
  useEffect(() => {
    fetch("/api/file/available", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((json) => setFileNames(json))
      .then(() => setLoading(false));

      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          if (entry.target === coralContainerRef.current) {
            const { width, height } = entry.contentRect;
            setContainerSize({ width, height });
          }
        }
      });
  
      if (coralContainerRef.current) {
        resizeObserver.observe(coralContainerRef.current);
      }
  
      return () => {
        if (coralContainerRef.current) {
          resizeObserver.unobserve(coralContainerRef.current);
        }
      };
    }, []);

    // Fetch features when a file is selected or the number of categories changes
    // This may be able to be moved into the individual category number and file name change handlers, but for now we're putting it here...
    useEffect(() => {
      // Make request to fetch features when a new file is selected or the number of categories changes
      // In principle, we should only make this request when a new file/number of categories is selected and the results don't already exist
      setLoading(true);
      if (!selectedFileName || !numCategories) return;
      fetch("/api/features", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName: selectedFileName, numCategories: numCategories }),
      })
        .then((response) => response.json())
        .then((json) => setCategories(fTreeToCategories(json.features, json.categories)))
        .then(() => setLoading(false))
        .catch(() => setLoading(false));

      // this should return a list of FeatureTreeNodes that we (me and Ethan) can then massage to fit the Coral component's needs
    }
    ,[selectedFileName, numCategories]);

  return (
    <div>
      {isLoading ? <Loader /> : <div/>}
      <div className="layout-container">
        <Sidebar categories={categories} onFeatureToggle={onFeatureToggle} onCategoryToggle={onCategoryToggle}/>

        <div className="main-content">
          <h1>{selectedFileName ? `${selectedFileName} Coral Plot` : "Untitled Coral Plot"}</h1>
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
                max="10"
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
          <div style={{ position: 'relative', height: '100%', width: '100%' }} ref={coralContainerRef}>
            <div className="plot">
              <Coral width={containerSize.width} height={containerSize.height} categories={categories} onFeatureHover={onFeatureHover}/>
            </div>
            {hoveredFeature && (
            <div style={{
              position: 'fixed',
              top: cursorPosition ? cursorPosition.y - 60 : 0,
              left: cursorPosition ? cursorPosition.x + 10 : 0,
              backgroundColor: '#111',
              color: 'white',
              border: '1px solid #444',
              borderRadius: '8px',
              padding: '10px',
              opacity: 0.8,
              maxWidth: '250px',
              fontSize: '14px',
            }}>
              <strong>Description:</strong> {hoveredFeature.description}<br />
              <strong>Timestamp:</strong> {dayjs(hoveredFeature.timestamp).format("YYYY-MM-DD")}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// "use client";
// import { useState, useEffect } from "react";

// export default function Home() {
//   const exampleCsv = [
//     "description,date,category",
//     "This feature allows users to schedule and join meetings seamlessly.,01-02-2022,video conferencing",
//     "It provides screen sharing and collaborative tools.,02-02-2022,project management",
//     "Users can record meetings for later review.,03-02-2022,analytics",
//     "The system integrates with calendars to remind of upcoming meetings.,04-02-2022,collaboration",
//     "It supports virtual backgrounds and noise suppression for clear communications.,05-02-2022,screen sharing",
//     "Secure authentication for participants is enabled.,06-02-2022,live chat",
//     "A customizable waiting room enhances meeting security.,07-02-2022,remote meetings",
//     "Users can chat, share files, and collaborate during meetings.,08-02-2022,file sharing",
//     "The user interface is intuitive and user-friendly.,09-02-2022,CRM",
//     "The platform supports high-definition video and audio.,10-02-2022,marketing",
//     "It allows for breakout rooms to facilitate small group discussions.,11-02-2022,video conferencing",
//     "The feature is accessible on various devices across operating systems.,12-02-2022,project management",
//     "Real-time transcription is available for enhanced accessibility.,13-02-2022,analytics",
//     "The tool supports multiple languages for global teams.,14-02-2022,collaboration",
//     "Interactive whiteboard features enable dynamic presentations.,15-02-2022,screen sharing",
//     "Event scheduling is integrated with automated reminders.,16-02-2022,live chat",
//     "It offers robust analytics on meeting performance and engagement.,17-02-2022,remote meetings",
//     "The platform includes end-to-end encryption for maximum privacy.,18-02-2022,file sharing",
//     "Scheduling features automatically sync with users' calendars.,19-02-2022,CRM",
//     "It delivers smooth integration with third-party productivity apps.,20-02-2022,marketing",
//   ];

//   useEffect(() => {
//     fetch("/api/file/upload", {
//       method: "POST",
//       body: JSON.stringify({ fileName: "test2", csv: exampleCsv }),
//     })
//       .then((response) => response.json())
//       .then((json) => console.log("File Created With Name:", json));
//   }, []);

//   useEffect(() => {
//     fetch("/api/file/available", {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     })
//       .then((response) => response.json())
//       .then((json) => console.log("File Names available:", json));
//   }, []);

//   useEffect(() => {
//     fetch("/api/features", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ fileName: "test", numCategories: 3 }),
//     })
//       .then((response) => response.json())
//       .then((json) => console.log("Provided Features:", json));
//   }, []);

//   return (
//     <div>
//       <h1>Next.js API</h1>
