import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const apiKey = process.env.OMNIROUTE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OMNIROUTE_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.OMNIROUTE_BASE_URL ||
      "http://localhost:20128/v1";

    const model =
      process.env.OMNIROUTE_MODEL ||
      "no-think/zenmux/anthropic/claude-sonnet-4.6";

    const response = await fetch(
      `${baseUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 1500,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "OmniRoute request failed.",
        },
        { status: response.status }
      );
    }

    const text =
      data?.choices?.[0]?.message?.content;

    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}