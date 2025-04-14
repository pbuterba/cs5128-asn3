import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
import fs from "fs";

const openai = new OpenAI({ apiKey: process.env.GPT_KEY });

function createJsonFile(csvContent: string[], fileName: string) {
  if (!csvContent) {
    return;
  }
  const csvHeaders = csvContent[0].split(",").map((item) => item.trim());
  const jsonObjects: any[] = [];

  csvContent.forEach((line, index) => {
    if (index === 0) return;
    const values = line.split(",").map((item) => item.trim());
    if (values.length !== csvHeaders.length) {
      console.error(
        `Line ${index + 1} does not match the number of headers. Skipping...`
      );
      return;
    }
    const tempObject: any = { id: index };
    values.forEach((value, i) => {
      tempObject[csvHeaders[i]] = value;
    });
    jsonObjects.push(tempObject);
  });
  const jsonFilePath = `./data/${fileName}.json`;
  const dataDir = "./data";
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(jsonFilePath, JSON.stringify(jsonObjects), "utf-8");
}

async function gptCall(csvContent: string[], fileName: string): Promise<void> {
  createJsonFile(csvContent, fileName);
  const mappingFileLocation = "./data/file-name-mappings.json";
  const assistants: any[] = JSON.parse(
    fs.readFileSync(mappingFileLocation, "utf-8")
  );
  if (assistants.some((assistant) => assistant.fileName === fileName)) {
    console.error("File has already been save with that name");
    return;
  }
  const jsonFilePath = `./data/${fileName}.json`;
  const assistant = await openai.beta.assistants.create({
    instructions:
      "You are a precise assistant that returns only structured JSON. You do not explain anything. You return a clean and valid JSON object exactly in the specified format.",
    name: fileName + " Assistant",
    tools: [{ type: "file_search" }],
    model: "gpt-4o",
  });

  const file = await openai.files.create({
    file: fs.createReadStream(jsonFilePath),
    purpose: "assistants",
  });

  let vectorStore = await openai.vectorStores.create({
    name: fileName + " Vector Store",
  });

  await openai.beta.assistants.update(assistant.id, {
    tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
  });

  assistants.push({ fileId: file.id, assistantId: assistant.id, fileName });
  fs.writeFileSync(mappingFileLocation, JSON.stringify(assistants), "utf-8");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // Parse the request body directly since it's now JSON
  const { csv, fileName } = req.body;
  
  return new Promise<void>((resolve, reject) => {
    // fakeGPTCall(csv, fileName)
    gptCall(csv, fileName)
      .then((response) => {
        res.statusCode = 200;
        res.end(JSON.stringify({ fileName: response }));
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
