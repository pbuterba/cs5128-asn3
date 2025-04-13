import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
import fs from "fs";
import parseCSV from "csv-parser";

// const openai = new OpenAI({ apiKey: process.env.GPT_KEY });

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
  const jsonFilePath = `./data/${fileName}.jsonl`;
  const dataDir = "./data";
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const jsonlContent = jsonObjects.map((obj) => JSON.stringify(obj)).join("\n");
  fs.writeFileSync(jsonFilePath, jsonlContent);
}

async function gptCall(csvContent: string[], fileName: string): Promise<void> {
  createJsonFile(csvContent, fileName);
  const jsonFilePath = `./data/${fileName}.jsonl`;
  // const file = await openai.files.create({
  //   file: fs.createReadStream(jsonFilePath),
  //   purpose: "fine-tune",
  // });
  // const fineTune = await openai.fineTuning.jobs.create({
  //   training_file: file.id,
  //   model: "gpt-3.5-turbo",
  // });
  // let page = await openai.fineTuning.jobs.list({ limit: 1 });
}

async function fakeGPTCall(
  csvContent: string[],
  fileName: string
): Promise<string> {
  createJsonFile(csvContent, fileName);
  return fileName;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const csv = JSON.parse(req.body).csv ?? [];
  const fileName = JSON.parse(req.body).fileName ?? "test";
  return new Promise<void>((resolve, reject) => {
    fakeGPTCall(csv, fileName)
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
