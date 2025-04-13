export interface Feature {
   id: number,
   category: string,
   children: number[]
}

interface Metadata {
   date: Date,
   description: string
}

export interface FeatureTreeNode {
   id: number,
   category: string,
   children: Feature[],
   metadata: Metadata
}

export interface FeatureData {
   id: number,
   description: string,
   date: string,
   category: string
}