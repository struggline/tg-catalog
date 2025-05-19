import { OpenAiRequest, OpenAiResponse } from "./types";

export async function callAi({ key, history }: OpenAiRequest) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: history,
            max_tokens: 150
        }),
        headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${key}`
        }
    });

    return (await res.json()) as OpenAiResponse;
}
