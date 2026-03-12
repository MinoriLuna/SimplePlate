import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { dish_name, portion_size } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("--- New AI Request ---");
    console.log(`Dish: ${dish_name}, Portion: ${portion_size}`);

    const prompt = `
      Analyze this meal: "${dish_name}" with portion size "${portion_size}".
      Estimate the nutritional values based on standard Malaysian/International food data.
      Return ONLY a JSON object with these exact keys:
      {
        "carbs_g": number,
        "protein_g": number,
        "fat_g": number,
        "vitamins": number (score 0-100 based on micronutrient density),
        "nourish_score": number (overall healthiness 0-100)
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Raw AI Response:", text);
    
    // Clean JSON formatting from AI response
    const cleanJson = text.replace(/```json|```/g, "").trim();
    console.log("Cleaned JSON:", cleanJson);

    return new Response(cleanJson, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return new Response(JSON.stringify({ error: "Analysis failed" }), { status: 500 });
  }
}