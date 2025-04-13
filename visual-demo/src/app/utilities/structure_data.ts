import { readFileSync } from 'fs'
import { Feature, FeatureTreeNode, FeatureData } from '../types/features';

export function makeTree(dataList: Feature[], fileName: string): FeatureTreeNode[] | null {
   //Read JSONL file
   let featureDataString: string;
   try {
      featureDataString = readFileSync('../../../data/' + fileName, 'utf8');
   } catch(error) {
      console.error("The file %s does not exist", fileName);
      return null;
   }

   //Parse JSON
   let featureData: FeatureData[];
   try {
      featureData = JSON.parse(featureDataString);
   } catch(error) {
      console.error("Data file %s contains invalid JSON", fileName);
   }

   let tree: FeatureTreeNode[] = [];
   dataList.forEach((feature) =>  {
      //Get metadata from file
      let metadata: FeatureData | null = null;
      for(let i = 0; i < featureData.length; i++) {
         if(featureData[i].id == feature.id) {
            metadata = featureData[i];
            break;
         }
      }

      //Check that metadata was found
      if(metadata == null) {
         console.error("Feature %i has no matching entry in data file %s", feature.id, fileName);
         return null;
      }

      //Format tree node
      const dateComponents: string[] = metadata.date.split("-");
      let categoryNode: FeatureTreeNode = {
         id: feature.id,
         category: feature.category,
         children: [],
         metadata: {
            date: new Date(parseInt(dateComponents[2]), parseInt(dateComponents[0]), parseInt(dateComponents[1])),
            description: metadata.description
         }
      }
      
      //Check the rest of the list for children, and encorporate into tree structure - Ibrahim

      //Add node to tree
      tree.push(categoryNode);
   });

export function makeTree(dataList: Feature[]): FeatureTreeNode[] {
  const nodeMap: Record<number, FeatureTreeNode> = {};

  dataList.forEach((feature) => {
    nodeMap[feature.id] = {
      id: feature.id,
      category: feature.category,
      children: [],
      metadata: metadataMap[feature.id],
    };
  });

  dataList.forEach((feature) => {
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

function addChildrenRecursively(childId: number, nodeMap: Record<number, FeatureTreeNode>, dataList: Feature[]): void {
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
