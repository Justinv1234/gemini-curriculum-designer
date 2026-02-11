import AnthropicBedrock from "@anthropic-ai/bedrock-sdk";

let client: AnthropicBedrock | null = null;

export function getAnthropicClient(): AnthropicBedrock {
  if (!client) {
    client = new AnthropicBedrock({
      awsRegion: process.env.AWS_REGION || "us-east-1",
    });
  }
  return client;
}
