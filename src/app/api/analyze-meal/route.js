import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { dish_name, portion_size, health_goal } = await req.json();

    const goalContext = health_goal === "lose_weight"
      ? "USER GOAL: Lose weight — apply a slight penalty to high-calorie, high-fat, or sugary foods."
      : health_goal === "maintain"
      ? "USER GOAL: Maintain weight. Score based on overall nutritional balance."
      : "USER GOAL: Eat cleaner. Reward whole, minimally processed foods; penalise heavily processed or junk food.";

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    console.log("--- New AI Request ---");
    console.log(`Dish: ${dish_name}, Portion: ${portion_size}, Goal: ${health_goal}`);

    const prompt = `
      ${goalContext}

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
          
        SPECIAL RULES:
        - If it's a healthy cooking method, score it high.
        - NEUTRAL (0): If the item is plain water, plain tea (no sugar), or black coffee (no sugar/milk). 
          Return exactly 0 for these.
        - CAFFEINE/SUGAR (10-30): If it has no "food" value but contains bad elements 
          (e.g., Kopi O with sugar, sugary sodas, energy drinks, or deep-fried snacks with no protein).
        - If the meal is not recognized or is too vague such as random strings, return a score of 0 with a note that it couldn't be analyzed due to it not being a recognized food item."
          
        Return ONLY a JSON object with:
        {
          "carbs_g": number,
          "protein_g": number,
          "fat_g": number,
          "vitamins": number,
          "nourish_score": number (0-100),
          "score_note": string (1-2 sentences in plain English explaining why this specific dish received its score. Mention the dish name and its key nutritional characteristics or cooking method. If score is 0 and unrecognised, say so briefly.)
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