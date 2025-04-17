import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import "dotenv/config";
import fs from "fs";
import { assignChildrenToFeatures, makeTree } from "../../app/utilities/structure_data";
import { mockZoomResponse } from "./zoom-response";
import { mockWebexResponse } from "./webex-response";
import { mockFirefoxResponse } from "./firefox-response";

type FeatureId = number;

interface FeatureDefinition {
  id: FeatureId;
  category: string;
  children: FeatureId[];
}

const openai = new OpenAI({ apiKey: process.env.GPT_KEY });

const query = (numCategories: number) => `
Analyze the features from the embedded JSON data in the vector store. Based on the meaning/semantics of those features, define exactly ${numCategories} distinct and meaningful category names. Assign one of these ${numCategories} categories to each feature. For each feature, find related features (based on similarity) and list their IDs as children.

Important constraints:
- Only ${numCategories} categories are allowed.
- Every feature must have exactly one of these ${numCategories} categories.
- All features from the embedded JSON data must be included in the response. There will be problems if not every feature is represented.
- Children must be feature IDs (numbers).
- A feature cannot appear as a child for more than one parent.
- Avoid circular dependencies: A feature cannot be a child of a feature that is already its child (directly or indirectly). In other words, if feature A is a child of feature B (or any of its descendants), then feature B and any of its ancestors cannot be assigned as children of feature A.
- Child features can ONLY be children of features with the same category. If two features have two different categories, they CANNOT be related!
- Children can have subchildren as well, there is no limit to the depth of the virtual tree, however not every feature needs a child. You are an expert deducer! Decide which features relate to one another, and which stand alone.
- In the past you have connected features where each feature has one child, in a long chain. Please do not do this. Use reason, but do not force relationships between child features where they don't exist. Be conservative in your connections.
Return a single JSON object with:
- A \`categories\` array (listing the ${numCategories} categories — each only once).
- A \`features\` array where each feature includes:
  - Its \`id\`
  - Its \`category\`
  - Its \`children\` (an array of related feature IDs)

Expected Output Format (example):
{
  "categories": ["Performance", "Usability", "Security", "Integration"],
  "features": [
    {"id": 1, "category": "Performance", "children": [5]},
    {"id": 2, "category": "Security", "children": []},
    {"id": 3, "category": "Usability", "children": []},
    {"id": 4, "category": "Integration", "children": []},
    {"id": 5, "category": "Performance", "children": [6, 7]},
    {"id": 6, "category": "Performance", "children": []},
    {"id": 7, "category": "Performance", "children": []}
  ]
}

Do not include any explanations or extra text or comments — just return a single, valid JSON object string.
`;

function getAssistantIdAndFileId(fileName: string): {
  assistantId: string;
  fileId: string;
} {
  const mappingFileLocation = "./data/file-name-mappings.json";
  const assistants = fs.readFileSync(mappingFileLocation, "utf-8");
  const assistant = JSON.parse(assistants).find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (assistant: any) => assistant.fileName === fileName
  );
  return {
    assistantId: assistant ? assistant.assistantId : "",
    fileId: assistant ? assistant.fileId : "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function gptCall(numCategories: number, fileName: string): Promise<any> {
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
    // return predefined response for the three large files
    if (fileName === "Zoom") {
      const ZoomFeatures = {
        categories: mockZoomResponse.categories,
        features: assignChildrenToFeatures(mockZoomResponse.features),
      };
      resolve(ZoomFeatures);
    } else if (fileName === "Webex") {
      const WebexFeatures = {
        categories: mockWebexResponse.categories,
        features: assignChildrenToFeatures(mockWebexResponse.features),
      };
      resolve(WebexFeatures);
    } else if (fileName === "Firefox") {
      const FirefoxFeatures = {
        categories: mockFirefoxResponse.categories,
        features: assignChildrenToFeatures(mockFirefoxResponse.features),
      };
      resolve(FirefoxFeatures);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    })
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res: NextApiResponse<any>
) {
  const numCategories = Number(req.body.numCategories) ?? 4;
  const fileName = req.body.fileName ?? "";
  return new Promise<void>((resolve) => {
    gptCall(numCategories, fileName as string)
      //fakeGptCall(numCategories as string, "")
      .then((response) => {
        res.statusCode = 200;
        res.end(
          JSON.stringify({
            categories: response.categories,
            features: makeTree(response.features, fileName),
          })
        );
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
