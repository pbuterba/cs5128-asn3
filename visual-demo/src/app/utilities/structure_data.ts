import { readFileSync } from 'fs'
import { FeatureNode, FeatureTreeNode } from '../types/features';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const metadataMap: Record<number, Record<string, any>> = {};

export function assignChildrenToFeatures(features: FeatureNode[]): FeatureNode[] {
  const categoryMap: Record<string, FeatureNode[]> = {};
  const assignedChildren = new Set<number>(); // Keep track of assigned child IDs
  const rootProbability = 0.7; // Increased probability of a feature being a root

  // Group features by category for faster lookup
  for (const feature of features) {
    if (!categoryMap[feature.category]) {
      categoryMap[feature.category] = [];
    }
    categoryMap[feature.category].push(feature);
  }

  for (const parent of features) {
    // Determine if the current feature should have children
    if (Math.random() < rootProbability) {
      parent.children = []; // Assign no children, making it a potential root
      continue; // Move to the next feature
    }

    const sameCategoryFeatures = categoryMap[parent.category];
    // Filter out children that are not already assigned and have a smaller ID
    const potentialChildren = sameCategoryFeatures.filter(
      (child) => child.id < parent.id && !assignedChildren.has(child.id)
    );

    const numberOfChildren = Math.floor(
      Math.random() * Math.min(4, potentialChildren.length + 1)
    );
    const selectedChildren: number[] = [];

    // Randomly select children from the potential children
    while (selectedChildren.length < numberOfChildren && potentialChildren.length > 0) {
      const randomIndex = Math.floor(Math.random() * potentialChildren.length);
      const selectedChild = potentialChildren.splice(randomIndex, 1)[0]; // Remove to avoid duplicates for this parent
      selectedChildren.push(selectedChild.id);
      assignedChildren.add(selectedChild.id); // Mark as assigned
    }

    parent.children = selectedChildren;
  }
  return features;
}

export function makeTree(dataList: FeatureNode[], fileName: string): FeatureTreeNode[] | null {
   //Read JSONL file
   let featureDataString: string;
   try {
      featureDataString = readFileSync('./data/' + fileName + '.json', 'utf8');
   } catch(error) {
      console.error("The file %s does not exist", fileName + '.json');
      console.error(error);
      return null;
   }

   // Parse JSON
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   let featureData: any[];
   try {
      featureData = JSON.parse(featureDataString);
   } catch(error) {
      console.error("Data file %s contains invalid JSON", fileName);
      console.error(error);
      return null;
   }

   // Fill in metadata map
   featureData.forEach((dataEntry) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const metadata: Record<string, any> = {};
      Object.keys(dataEntry).forEach((key) => {
        if(key != 'id') {
          try {
            const dateComponents: string[] = dataEntry[key].split("-");
            const date = new Date(parseInt(dateComponents[2]), parseInt(dateComponents[0]), parseInt(dateComponents[1]));
            if(isNaN(date.getTime())) {
              throw new Error();
            }
            metadata['date'] = date;
          } catch(error) {
            metadata[key] = dataEntry[key];
            console.error(error);
          }
        }
      });
      metadataMap[dataEntry.id] = metadata;
   });
  
  const nodeMap: Record<number, FeatureTreeNode> = {};
  dataList.forEach((feature) => {
    nodeMap[feature.id] = {
      id: feature.id,
      category: feature.category,
      children: [],
      metadata: metadataMap[feature.id],
    };
  });
  
  dataList.forEach((feature: FeatureNode) => {
    feature.children.forEach((childId) => {
      if (nodeMap[childId]) {
        nodeMap[feature.id].children.push(nodeMap[childId]);
        if (dataList.some((f) => f.id === childId && f.children.length > 0)) {
          addChildrenRecursively(childId, nodeMap, dataList);
        }
      }
    });
  });

  const allIds = new Set(dataList.map((n) => n.id));
  const childIds = new Set(dataList.flatMap((n) => n.children));
  const rootIds = [...allIds].filter((id) => !childIds.has(id));
  return rootIds.map((rootId) => nodeMap[rootId]);
}

function addChildrenRecursively(childId: number, nodeMap: Record<number, FeatureTreeNode>, dataList: FeatureNode[]): void {
  const child = nodeMap[childId];

  const childrenOfChild = dataList.find((feature) => feature.id === childId)?.children;

  if (childrenOfChild && childrenOfChild.length > 0) {
    childrenOfChild.forEach((nestedChildId) => {
      if (nodeMap[nestedChildId]) {
        child.children.push(nodeMap[nestedChildId]);
        addChildrenRecursively(nestedChildId, nodeMap, dataList);
      }
    });
  }
}
