import { Feature, FeatureTreeNode } from '../types/features';

export function makeTree(dataList: Feature[], fileName: string): FeatureTreeNode[] {
   let tree: FeatureTreeNode[] = [];
   dataList.forEach((feature) =>  {
      //Get metadata from file - Preston
      //Check the rest of the list for children, and encorporate into tree structure - Ibrahim
   });

   return tree;
}