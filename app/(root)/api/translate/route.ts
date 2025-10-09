import { NextRequest, NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";



export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, language } = body

    console.log(body);


    if (!text.trim() || !language) return NextResponse.json({ translation: null }, { status: 204 })

    const client = new InferenceClient(process.env.AI_API_KEY!);

    const chatCompletion = await client.chatCompletion({
      provider: "nebius",
      model: "meta-llama/Llama-3.3-70B-Instruct",
      messages: [
        {
          role: "user",
          content: `translate '${text}' into ${language}. Only return the translated sentence. Do not add explanations or breakdowns.`
        },
      ],
    });

    const translation = chatCompletion.choices[0].message.content


    return NextResponse.json({ translation, language }, { status: 200 });
  } catch (err: any) {
    console.error("Translation API error:", err);
    return NextResponse.json(
      { message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
