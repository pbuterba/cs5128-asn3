import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import "dotenv/config";
import csv from "csv-parser";
import fs from "fs";
import { features } from "process";
import { metadata } from "@/app/layout";
import { makeTree } from "../../app/utilities/structure_data";

type FeatureId = number;

interface FeatureDefinition {
  id: FeatureId;
  category: string;
  children: FeatureId[];
}

const openai = new OpenAI({ apiKey: process.env.GPT_KEY });

const query = (numCategories: number) => `
  Analyze the features from the embedded JSON data in the vector store. Based on the meaning/semantics of those features, define exactly ${numCategories} distinct and meaningful category names. Assign one of these 4 categories to each feature. For each feature, find related features (based on similarity) and list their IDs as children.

Important constraints:
- Only 4 categories are allowed.
- Every feature must have exactly one of these ${numCategories} categories.
- Children must be feature IDs (numbers).
- A feature cannot appear as a child for more than one parent.
- Avoid circular dependencies: A feature cannot be a child of a feature that is already its child (directly or indirectly). In other words, if feature A is a child of feature B (or any of its descendants), then feature B and any of its ancestors cannot be assigned as children of feature A.

Return a single JSON object with:
- A\`categories\` array (listing the ${numCategories} categories — each only once).
- A \`features\` array where each feature includes:
  - Its \`id\`
  - Its \`category\`
  - Its \`children\` (an array of related feature IDs)

Expected Output Format (example):
{
  "categories": ["Performance", "Usability", "Security", "Integration"],
  "features": [
    {"id": 1, "category": "Performance", "children": [3, 4]},
    {"id": 2, "category": "Security", "children": [5]},
    {"id": 3, "category": "Usability", "children": []},
    {"id": 4, "category": "Integration", "children": []},
    {"id": 5, "category": "Performance", "children": []}
  ]
}

Do not include any explanations or extra text — just return a single, valid JSON object string.
`;

function getAssistantIdAndFileId(fileName: string): {
  assistantId: string;
  fileId: string;
} {
  const mappingFileLocation = "./data/file-name-mappings.json";
  const assistants = fs.readFileSync(mappingFileLocation, "utf-8");
  const assistant = JSON.parse(assistants).find(
    (assistant: any) => assistant.fileName === fileName
  );
  return {
    assistantId: assistant ? assistant.assistantId : "",
    fileId: assistant ? assistant.fileId : "",
  };
}

async function gptCall(
  numCategories: number,
  fileName: string
): Promise<any> {
  const { assistantId, fileId } = getAssistantIdAndFileId(fileName);
  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: "user",
        content: query(numCategories),
        // Attach the new file to the message.
        attachments: [{ file_id: fileId, tools: [{ type: "file_search" }] }],
      },
    ],
  });


  return new Promise((resolve, reject) => {
    const streamController = openai.beta.threads.runs
      .stream(thread.id, {
        assistant_id: assistantId,
      })
      .on("messageDone", async (event) => {
        try {
          let response = "";
          if (event.content[0].type === "text") {
            const { text } = event.content[0];
            const { annotations } = text;
            const citations: string[] = [];
            let index = 0;
            for (const annotation of annotations) {
              text.value = text.value.replace(annotation.text, `[${index}]`);
              const { file_citation } = annotation as any;
              if (file_citation) {
                const citedFile = await openai.files.retrieve(
                  file_citation.file_id
                );
                citations.push(`[${index}] ${citedFile.filename}`);
              }
              index++;
            }
            response = text.value;
          }
          const features = parseFeatures(response);
          resolve(features);
        } catch (error) {
          reject(error);
        }
      });
  });
}

function parseFeatures(res: string): any {
  const cleaned = res
    .replace(/^```(?:json)?\s*\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  if (!cleaned) {
    throw new Error("Input string is empty after cleaning.");
  }

  let parseRes;
  try {
    parseRes = JSON.parse(cleaned);
  } catch (error) {
    console.error("Error parsing JSON. Cleaned input:", cleaned);
    throw error;
  }

  if (!parseRes.features || !Array.isArray(parseRes.features)) {
    throw new Error(
      "Invalid JSON: Expected an object with a 'features' array."
    );
  }

  return {
    categories: parseRes.categories,
    features: parseRes.features.map(
      (feature: any): FeatureDefinition => ({
        id: feature.id,
        category: feature.category,
        children: feature.children,
      })
    ),
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const numCategories = Number(req.query.numCategories) ?? 4;
  const fileName = req.body.fileName ?? "";
  return new Promise<void>((resolve, reject) => {
    gptCall(numCategories, fileName as string)
      //fakeGptCall(numCategories as string, "")
      .then((response) => {
        res.statusCode = 200;
        res.end(JSON.stringify({categories: response.categories, features: makeTree(response.features, fileName)}));
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
