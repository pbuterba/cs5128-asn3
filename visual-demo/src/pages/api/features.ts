import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import "dotenv/config";
import csv from "csv-parser";
import fs from "fs";
import { features } from "process";
import { metadata } from "@/app/layout";

type FeatureId = number;

interface Features {
  categories: string[];
  features: FeatureDefinition[];
}

interface FeatureDefinition {
  id: FeatureId;
  category: string;
  children: FeatureId[];
}

//const openai = new OpenAI({ apiKey: process.env.GPT_KEY });

function csvToJson1WithIds(csvData: string, outputPath: string): void {
  const lines = csvData.trim().split("\n");
  if (lines.length < 2) {
    console.error("CSV must contain at least a header and one data row.");
    return;
  }

  const headers = lines[0].split(",").map((h) => h.trim());
  const outputLines: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",").map((cell) => cell.trim());
    if (row.length !== headers.length) continue; // skip malformed rows

    const rowObject: Record<string, string | number> = { id: i };
    headers.forEach((header, idx) => {
      rowObject[header] = row[idx];
    });

    outputLines.push(JSON.stringify(rowObject));
  }

  fs.writeFileSync(outputPath, outputLines.join("\n"), "utf-8");
  console.log(`Wrote ${outputLines.length} records to ${outputPath}`);
}

function query(numCategories: string, fileId: string): string {
  //This is going to change a lot
  return (
    "You are a precise assistant that returns only structured JSON. You do not explain anything. You return a clean and valid JSON object exactly in the specified format." +
    `Your task is to:
    1. Derive exactly ${numCategories} meaningful and distinct category names based on feature semantics.
    2. Assign one of these categories to each feature.
    3. Identify related features and list their IDs as 'children' for each feature (based on similarity).
    4. Only return categories in first object response, but use the same set of categories for every response.

    {"categories": ["Category A", "Category B", "..."], "features": [{"id": 1, "category": "Category A", "children": [4, 5]}, {"id": 2, "category": "Category B", "children": []}]}

    ### Rules:
    - Derive exactly ${numCategories} categories and use only those.
    - Do not create extra or missing categories.
    - Each feature gets one category.
    - Children must be identified by feature ID (numeric).
    - Children are related features based on similarity.
    - Do not include any explanations.
    - Output must be valid JSON.
    - A single response only contains 10 feature objects.
    - Only the first response should contain the categories, but the same set of categories should be used when categorizing every feature in the list.
    - The response should only be a json object as a string that we can parse using JSON.parse.
    `
  );
}

async function gptCall(
  numCategories: string,
  fileName: string
): Promise<Features> {
  let requestNumber = 0;
  let features: Features = { categories: [], features: [] };

  // while (requestNumber < globalCSV.length / 10) {
  //   const response = await openai.responses.create({
  //     model: "gpt-4o-mini",
  //     input: requestNumber === 0 ? query("5", globalCSV) : "again",
  //   });
  //   console.log(response);
  //   if (response) {
  //     parseFeatures(response.output_text, requestNumber, features);
  //   }
  //   requestNumber += 1;
  // }
  return features;
}

async function fakeGptCall(
  numCategories: string,
  fileName: string
): Promise<any> {
  return {
    categories: ["video conferencing", "project management", "analytics"],
    features: [
      {
        id: 1,
        category: "video conferencing",
        children: [
          {
            id: 2,
            category: "project management",
            children: [
              {
                id: 4,
                category: "project management",
                children: [],
                metadata: {
                  description:
                    "This feature allows users to schedule and join meetings seamlessly.",
                  date: "01-02-2022",
                },
              },
              {
                id: 5,
                category: "analytics",
                children: [],
                metadata: {
                  description:
                    "This feature allows users to schedule and join meetings seamlessly.",
                  date: "01-02-2022",
                },
              },
              {
                id: 6,
                category: "project management",
                children: [],
                metadata: {
                  description:
                    "This feature allows users to schedule and join meetings seamlessly.",
                  date: "01-02-2022",
                },
              },
            ],
            metadata: {
              description:
                "This feature allows users to schedule and join meetings seamlessly.",
              date: "01-02-2022",
            },
          },
          {
            id: 3,
            category: "analytics",
            children: [],
            metadata: {
              description:
                "This feature allows users to schedule and join meetings seamlessly.",
              date: "01-02-2022",
            },
          },
        ],
        metadata: {
          description:
            "This feature allows users to schedule and join meetings seamlessly.",
          date: "01-02-2022",
        },
      },
    ],
  };
}

function parseFeatures(
  res: string,
  requestNum: number,
  currentFeatures: Features
): void {
  let cleaned = res
    .replace(/^```json\s*/, "")
    .replace(/```$/, "")
    .trim();
  let parseRes = JSON.parse(cleaned);

  if (requestNum === 0) {
    currentFeatures.categories = parseRes.categories;
  }
  parseRes?.features?.map((feature: any): FeatureDefinition => {
    return {
      id: feature.id,
      category: feature.category,
      children: feature.children,
    } as FeatureDefinition;
  });

  currentFeatures.features = [...currentFeatures.features, parseRes?.features];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const numCategories = req.query.numCategories ?? "";
  const csv = req.body.csv ?? "";
  return new Promise<void>((resolve, reject) => {
    // gptCall(numCategories as string, csv)
    fakeGptCall(numCategories as string, csv)
      .then((response) => {
        res.statusCode = 200;
        res.end(JSON.stringify(response));
        resolve();
      })
      .catch((error) => {
        console.log(error);
        res.json(error);
        res.status(405).end();
        resolve();
      });
  });
}
