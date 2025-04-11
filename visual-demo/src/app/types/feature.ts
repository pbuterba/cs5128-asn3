import { Dayjs } from "dayjs";

export type Category = {
    name: string;
    features: Feature[];
};

export type Feature = {
    descr: string;
    timestamp: Dayjs;
    childFeatures: Feature[];
}