import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { dish_name, portion_size } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("--- New AI Request ---");
    console.log(`Dish: ${dish_name}, Portion: ${portion_size}`);

    const prompt = `
      Analyze this log: "${dish_name}" with portion size "${portion_size}".
        
        PORTION LOGIC:
        - If "Cup / Glass": Treat as a liquid beverage (250ml-300ml). Focus on sugar/carbs.
        - If "Small": Treat as a snack or 0.5x standard serving.
        - If "Normal / Plate": Treat as a standard 1.0x meal serving.
        - If "Large": Treat as 1.5x to 2.0x serving (e.g., "Tambah Nasi").

        SCORING LOGIC (0-100):
        - Give a HIGH score (80-100) for lean proteins (steamed/grilled), vegetables, and whole grains.
        - Give a MEDIUM score (50-79) for standard mixed meals (e.g., Nasi Lemak, Pasta).
        - Give a LOW score (<50) for deep-fried foods, high sugar drinks, or heavy processed foods.
        - Important: Do NOT penalize a score just because a single ingredient is missing vitamins (like plain chicken). 
          If it's a healthy cooking method, score it high.

        Return ONLY a JSON object with:
        {
          "carbs_g": number,
          "protein_g": number,
          "fat_g": number,
          "vitamins": number,
          "nourish_score": number (0-100)
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