'use client'

import { useCallback } from "react";
import Coral from "./components/coral";
import styles from "./page.module.css";
import { Category, Feature } from "./types/feature";
import dayjs from "dayjs";

export default function Home() {
  // Mock data structure for the categories and features, passed as props to the Coral component (dayjs objects are converted to ISO strings for serialization)
  const categories: Category[] = [
    {
        name: "Networking",
        features: [
          {
            childFeatures: [
              {
                childFeatures: [],
                description: "Networking 2",
                timestamp: dayjs().add(3, 'year').add(1, 'month').toISOString(),
              },
              {
                childFeatures: [],
                description: "Networking 3",
                timestamp: dayjs().add(4, 'year').add(3, 'month').toISOString(),
              },
              {
                childFeatures: [],
                description: "Networking 4",
                timestamp: dayjs().add(5, 'year').add(1, 'month').toISOString(),
              }
            ],
            description: "Networking 1",
            timestamp: dayjs().add(3, 'year').toISOString(),
          },
          {
            childFeatures: [
              {
                childFeatures: [],
                description: "Networking 6",
                timestamp: dayjs().add(3, 'year').add(1, 'month').toISOString(),
              },
              {
                childFeatures: [],
                description: "Networking 7",
                timestamp: dayjs().add(3, 'year').add(3, 'month').toISOString(),
              },
              {
                childFeatures: [],
                description: "Networking 8",
                timestamp: dayjs().add(6, 'year').add(1, 'month').toISOString(),
              }
            ],
            description: "Networking 5",
            timestamp: dayjs().add(3, 'year').toISOString(),
          }
        ]
    },
    {
        name: "OS",
        features: [
          {
            childFeatures: [
            ],
            description: "OS 1",
            timestamp: dayjs().add(3, 'year').toISOString(),
          }
        ]
    },
    {
        name: "User Interface",
        features: [
          {
            childFeatures: [
            ],
            description: "UI 1",
            timestamp: dayjs().add(3, 'year').toISOString(),
          }
        ]
    },
    {
        name: "API",
        features: [
          {
            childFeatures: [
            ],
            description: "API 1",
            timestamp: dayjs().add(3, 'year').toISOString(),
          }
        ]
    },
    {
        name: "QA",
        features: [
          {
            childFeatures: [
            ],
            description: "QA 1",
            timestamp: dayjs().add(3, 'year').toISOString(),
          }
        ]
    },
    {
        name: "DevOps",
        features: [
          {
            childFeatures: [
            ],
            description: "DevOps 1",
            timestamp: dayjs().add(3, 'year').toISOString(),
          }
        ]
    },
    
  ];

  // onFeatureHover function to handle hover events on features (highlighting in side bar or showing details in a popup)
  const onFeatureHover = useCallback( (feature: Feature) =>{
    if (feature) {
      console.log("Hovered feature:", feature.description);
    } else {
      console.log("No feature hovered");
    }
  }, []);

  return (
    <div className={styles.page}>
      <Coral width={600} height={600} categories={categories} onFeatureHover={onFeatureHover}/>
    </div>
  );
}
