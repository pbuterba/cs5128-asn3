import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import "dotenv/config";


const openai = new OpenAI({apiKey: process.env.GPT_KEY});

function query(numCategories: string, csv: string): string {
    return 'You are a precise assistant that returns only structured JSON. You do not explain anything. You return a clean and valid JSON object exactly in the specified format.' + `Your task is to:
    1. Derive exactly ${numCategories} meaningful and distinct category names based on feature semantics.
    2. Assign one of these categories to each feature.
    3. Identify related features and list their IDs as 'children' for each feature (based on similarity).
    4. Return only a strict JSON object with this structure:
    
    {
      "categories": ["Category A", "Category B", "..."],
      "features": [
        {
          "id": 1,
          "category": "Category A",
          "children": [4, 5]
        },
        {
          "id": 2,
          "category": "Category B",
          "children": []
        }
      ]
    }
    
    ### Rules:
    - Derive exactly ${numCategories} categories and use only those.
    - Do not create extra or missing categories.
    - Each feature gets one category.
    - Children must be identified by feature ID (numeric).
    - Children are related features based on similarity.
    - Do not include any explanations.
    - Output must be valid JSON.
    
    Below is the feature list in CSV format:
    
    \`\`\`
    ${csv}
    \`\`\`
    `
}

export default async function handler(req: NextApiRequest,
    res: NextApiResponse<any>) {
    const numCategories = req.query.numCategories ?? "";
    const csv = req.body.csv ?? "";
    const response = await openai.responses.create({
        model: "gpt-4o-mini",
        input: "hello" //query(numCategories as string, csv),

    });
    console.log(response);
}