import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
import fs from "fs";
import parseCSV from "csv-parser";

const openai = new OpenAI({ apiKey: process.env.GPT_KEY });

async function gptCall(): Promise<void> {
  const job = await openai.fineTuning.jobs.create({
    training_file: "test.jsonl",
    model: "gpt-4o-2024-08-06",
    method: {
      type: "dpo",
      dpo: {
        hyperparameters: { beta: 0.1 },
      },
    },
  });

  console.log(job);
}

async function fakeGPTCall(): Promise<string[]> {
  return ["file1", "file2", "file3"];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  return new Promise<void>((resolve, reject) => {
    //gptCall()
    fakeGPTCall()
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
