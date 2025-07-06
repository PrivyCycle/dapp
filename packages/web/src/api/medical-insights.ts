import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import OpenAI from "openai";

const OFFICIAL_PROVIDERS = {
  "llama-3.3-70b-instruct": "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
  "deepseek-r1-70b": "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3"
};

const INITIAL_FUND_AMOUNT = 0.1;

async function queryAI(prompt: string): Promise<string | null> {
  try {
    const privateKey = process.env.ZG_PRIVATE_KEY || "d16114e4de6de4381a93008616f048268b6ccf9e5d1403bd2a897e62ced7e2f2";
    const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
    const wallet = new ethers.Wallet(privateKey, provider);
    const broker = await createZGComputeNetworkBroker(wallet);

    try {
      await broker.ledger.getLedger();
    } catch {
      await broker.ledger.addLedger(INITIAL_FUND_AMOUNT);
      await broker.ledger.getLedger();
    }

    const selectedProvider = OFFICIAL_PROVIDERS["llama-3.3-70b-instruct"];
    try {
      await broker.inference.acknowledgeProviderSigner(selectedProvider);
    } catch (error: unknown) {
      if (error instanceof Error && !error.message.includes('already acknowledged')) {
        throw error;
      }
    }

    const { endpoint, model } = await broker.inference.getServiceMetadata(selectedProvider);
    const headers = await broker.inference.getRequestHeaders(selectedProvider, prompt);
    const openai = new OpenAI({ baseURL: endpoint, apiKey: "" });
    
    const requestHeaders: Record<string, string> = {};
    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        requestHeaders[key] = value;
      }
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
    } catch {
      // Ignore response processing errors
    }
    
    return aiResponse;
  } catch (error) {
    console.error('AI query failed:', error);
    return null;
  }
}

export async function getMedicalInsights(prompt: string): Promise<{ insights: string; confidence: number; timestamp: string } | null> {
  try {
    const response = await queryAI(prompt);
    
    if (!response) {
      return null;
    }

    return { 
      insights: response,
      confidence: 0.85,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Medical insights error:', error);
    return null;
  }
}
