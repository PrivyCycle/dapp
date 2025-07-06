#!/usr/bin/env ts-node

import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import OpenAI from "openai";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const OFFICIAL_PROVIDERS = {
  "llama-3.3-70b-instruct": "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
  "deepseek-r1-70b": "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3"
};

const TEST_QUERY = "What is the capital of France? Please answer in one sentence.";
const FALLBACK_FEE = 0.01;
const INITIAL_FUND_AMOUNT = 0.1; // 0.1 OG tokens

async function computeFlow(prompt: string) {
  // Copy of testComputeFlow, but parameterized by prompt
  // Only the relevant parts for the endpoint, no console logs
  const privateKey = "d16114e4de6de4381a93008616f048268b6ccf9e5d1403bd2a897e62ced7e2f2";
  const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
  const wallet = new ethers.Wallet(privateKey, provider);
  const broker = await createZGComputeNetworkBroker(wallet);

  // Ensure ledger exists
  let ledgerInfo;
  try {
    ledgerInfo = await broker.ledger.getLedger();
  } catch {
    await broker.ledger.addLedger(INITIAL_FUND_AMOUNT);
    ledgerInfo = await broker.ledger.getLedger();
  }

  // Use the first official provider (llama-3.3-70b-instruct)
  const selectedProvider = OFFICIAL_PROVIDERS["llama-3.3-70b-instruct"];
  try {
    await broker.inference.acknowledgeProviderSigner(selectedProvider);
  } catch (error: any) {
    if (!error.message.includes('already acknowledged')) throw error;
  }

  const { endpoint, model } = await broker.inference.getServiceMetadata(selectedProvider);
  const headers = await broker.inference.getRequestHeaders(selectedProvider, prompt);
  const openai = new OpenAI({ baseURL: endpoint, apiKey: "" });
  const requestHeaders: Record<string, string> = {};
  Object.entries(headers).forEach(([key, value]) => {
    if (typeof value === 'string') requestHeaders[key] = value;
  });
  const completion = await openai.chat.completions.create(
    {
      messages: [{ role: "user", content: prompt }],
      model: model,
    },
    { headers: requestHeaders }
  );
  const aiResponse = completion.choices[0].message.content;
  const chatId = completion.id;
  try {
    await broker.inference.processResponse(selectedProvider, aiResponse || "", chatId);
  } catch {}
  return aiResponse;
}

const app = express();
app.use(express.json());

app.post("/generate", async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "Missing or invalid 'prompt' in request body" });
    return;
  }
  try {
    const response = await computeFlow(prompt);
    res.json({ response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 LLM API server listening on port ${PORT}`);
  });
}