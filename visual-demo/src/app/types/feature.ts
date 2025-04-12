import { Dayjs } from "dayjs";

export type Category = {
  name: string;
  features: Feature[];
};

export type Feature = {
  descr: string;
  timestamp: Dayjs;
  childFeatures: Feature[];
};

// Tentative types I am hoping the parsing team will give us

// export type Category = {
//   name: string;
//   features: Feature[];
// };

// export type Data = {
//   description: string;
//   date: Dayjs;
//   visible: boolean;
// };

// export type Feature = {
//   id: number;
//   category: string;
//   children: Feature[];
//   metadata: Data;
// };
