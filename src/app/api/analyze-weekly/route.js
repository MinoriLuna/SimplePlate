import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { meals, totals } = await req.json();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-flash-lite-preview",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
        Analyze this weekly food list: ${meals.join(", ")}.
        Nutrient Totals: Carbs ${totals.carbs}g, Protein ${totals.protein}g, Fat ${totals.fat}g.
        
        Return JSON:
        {
            "insight": "1-sentence summary of their diet pattern.",
            "improvement": "1 specific goal (e.g., 'Eat more fiber').",
            "alternative_suggestion": "1 healthy meal suggestion."
        }
        `;

    const result = await model.generateContent(prompt);
    return new Response(result.response.text(), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}