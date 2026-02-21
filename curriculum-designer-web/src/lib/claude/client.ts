import AnthropicBedrock from "@anthropic-ai/bedrock-sdk";

let client: AnthropicBedrock | null = null;

export function getAnthropicClient(): AnthropicBedrock {
  if (!client) {
    client = new AnthropicBedrock({
      awsRegion: "us-east-1",
      skipAuth: true,
      defaultHeaders: {
        Authorization: `Bearer ${process.env.AWS_BEARER_TOKEN_BEDROCK}`,
      },
    });
  }
  return client;
}
