import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
import fs from "fs";
import parseCSV from "csv-parser";

async function gptCall(): Promise<string[]> {
  const mappingFileLocation = "./data/file-name-mappings.json";
  const assistants = JSON.parse(fs.readFileSync(mappingFileLocation, "utf-8"));
  return assistants.map((assistant: any) => assistant.fileName);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  return new Promise<void>((resolve, reject) => {
    gptCall()
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
