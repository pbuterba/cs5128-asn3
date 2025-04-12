import Coral from "./components/coral";
import styles from "./page.module.css";
import { Category } from "./types/feature";
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
                description: "",
                timestamp: dayjs().add(3, 'year').add(1, 'month').toISOString(),
              },
              {
                childFeatures: [],
                description: "",
                timestamp: dayjs().add(4, 'year').add(3, 'month').toISOString(),
              },
              {
                childFeatures: [],
                description: "",
                timestamp: dayjs().add(5, 'year').add(1, 'month').toISOString(),
              }
            ],
            description: "",
            timestamp: dayjs().add(3, 'year').toISOString(),
          },
          {
            childFeatures: [
              {
                childFeatures: [],
                description: "",
                timestamp: dayjs().add(3, 'year').add(1, 'month').toISOString(),
              },
              {
                childFeatures: [],
                description: "",
                timestamp: dayjs().add(3, 'year').add(3, 'month').toISOString(),
              },
              {
                childFeatures: [],
                description: "",
                timestamp: dayjs().add(6, 'year').add(1, 'month').toISOString(),
              }
            ],
            description: "",
            timestamp: dayjs().add(3, 'year').toISOString(),
          }
        ]
    },
    {
        name: "Networking",
        features: [
          {
            childFeatures: [
            ],
            description: "",
            timestamp: dayjs().add(3, 'year').toISOString(),
          }
        ]
    },
    {
        name: "Networking",
        features: [
          {
            childFeatures: [
            ],
            description: "",
            timestamp: dayjs().add(3, 'year').toISOString(),
          }
        ]
    },
    {
        name: "Networking",
        features: [
          {
            childFeatures: [
            ],
            description: "",
            timestamp: dayjs().add(3, 'year').toISOString(),
          }
        ]
    },
    {
        name: "Networking",
        features: [
          {
            childFeatures: [
            ],
            description: "",
            timestamp: dayjs().add(3, 'year').toISOString(),
          }
        ]
    },
    {
        name: "Networking",
        features: [
          {
            childFeatures: [
            ],
            description: "",
            timestamp: dayjs().add(3, 'year').toISOString(),
          }
        ]
    },
    
  ];

  return (
    <div className={styles.page}>
      <Coral width={600} height={600} categories={categories}/>
    </div>
  );
}
