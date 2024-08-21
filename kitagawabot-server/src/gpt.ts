import { gptResponseType } from "./type";

export const gptResponse = async (text: string, apiKey: string) => {
  const res = await fetch ('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      "model": "gpt-4o-mini",
      "messages": [
        {
          "role": "user",
          "content": text
        }
      ]
    })
  })
  const json = await res.json() as gptResponseType;
  return json.choices[0].message.content;
}