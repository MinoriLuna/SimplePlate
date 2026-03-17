import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { image } = await req.json(); // Base64 image string
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });

    const prompt = `
      Identify the main Malaysian dish in this image.

        SCORING LOGIC (0-100):
        - Give a HIGH score (80-100) for lean proteins (steamed/grilled), vegetables, and whole grains.
        - Give a MEDIUM score (50-79) for standard mixed meals (e.g., Nasi Lemak, Pasta).
        - Give a LOW score (<50) for deep-fried foods, high sugar drinks, or heavy processed foods.
        - Important: Do NOT penalize a score just because a single ingredient is missing vitamins (like plain chicken). 
            If it's a healthy cooking method, score it high.
      
      Return ONLY a JSON object:
      {
        "dish_name": "Name of the dish",
        "carbs_g": number,
        "protein_g": number,
        "fat_g": number,
        "vitamins": number (0-100),
        "nourish_score": number (0-100)
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