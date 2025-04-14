import { Feature, FeatureTreeNode, Metadata } from "../types/features";

const metadataMap: Record<number, Metadata> = {
  1: { description: "Hello Hello Hello...", date: "04-13-2025" },
  2: { description: "Hello Hello...", date: "04-14-2025" },
};

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
