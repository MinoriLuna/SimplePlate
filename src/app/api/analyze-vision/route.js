import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { image } = await req.json(); // Base64 image string
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    const prompt = `
      Identify the main food item in this image. 
      Be concise (e.g., "Nasi Lemak", "Chicken Chop", "Miso Soup").
      If the food is not recognizable or the image is too vague, respond with "Unrecognized food item".

      Return ONLY a JSON object:
      {
        "dish_name": "Name of the dish"
      }
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: image.split(",")[1], mimeType: "image/jpeg" } }
    ]);

    const response = JSON.parse(result.response.text());
    return new Response(JSON.stringify(response), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}