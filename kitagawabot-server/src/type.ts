export interface gptResponseType {
  "choices":
    {
      "finish_reason": string;
      "index": number;
      "message": {
        "content": string;
        "role": "assistant" | "user" | "system";
      };
      "logprobs": null | string;
    }[];
  "created": number;
  "id": string;
  "model": "gpt-4o-mini";
  "object": string;
  "usage": {
    "completion_tokens": number;
    "prompt_tokens": number;
    "total_tokens": number;
  }
}