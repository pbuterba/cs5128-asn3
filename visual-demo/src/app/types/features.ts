export interface FeatureNode {
   id: number,
   category: string,
   children: number[]
}

export interface FeatureTreeNode {
   id: number,
   category: string,
   children: FeatureTreeNode[],
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   metadata: Record<string, any>
}