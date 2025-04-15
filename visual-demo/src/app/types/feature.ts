import dayjs from "dayjs";
import { FeatureTreeNode } from "./features";

export type Category = {
  name: string;
  features: Feature[];
  visible: boolean;
};

export type Feature = {
  description: string;
  timestamp: string;
  childFeatures: Feature[];
  visible: boolean;
};

export const fTreeToCategories = (featureNodes: FeatureTreeNode[], categories: string[]): Category[] => {
  console.log('helo');
  const finalCategories: Category[] = [];
  categories.forEach((category: string) => {
    const newCat: Category = {
      name: category,
      features: [],
      visible: true,
    };
    featureNodes.filter((fNode: FeatureTreeNode) => fNode.category === category).forEach((fTreeNode: FeatureTreeNode) => {
      newCat.features.push(fTreeToFeature(fTreeNode));
    });
    finalCategories.push(newCat);
  });
  console.log(finalCategories);
  return finalCategories;
};

const fTreeToFeature = (fNodeTree: FeatureTreeNode): Feature => {
  const newFeat: Feature = {
    timestamp: dayjs(fNodeTree.metadata["Release Date"]).toISOString(),
    description: fNodeTree.metadata["Feature Description"],
    visible: true,
    childFeatures: [],
  };
  fNodeTree.children.forEach((fTree: FeatureTreeNode) => {
    newFeat.childFeatures.push(fTreeToFeature(fTree));
  });
  return newFeat;
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
