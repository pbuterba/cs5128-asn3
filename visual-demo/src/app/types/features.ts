export interface Feature {
   id: number,
   category: string,
   children: number[]
}

export interface FeatureTreeNode {
   id: number,
   category: string,
   children: FeatureTreeNode[],
   metadata: Record<string, any>
}