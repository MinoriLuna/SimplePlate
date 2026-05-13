import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { meals, totals } = await req.json();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-flash-lite",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are a realistic, witty Nutrition Assistant for the app "SimplePlate". 
      Analyze the user's week. Avoid boring "diet culture" advice like plain Greek yogurt, steamed kale, or dry brown rice. 

      INPUT DATA:
      - Weekly Food List: ${meals.join(", ")}
      - Nutrient Totals: Carbs ${totals.carbs}g, Protein ${totals.protein}g, Fat ${totals.fat}g, Vitamins ${totals.vitamins}mg.

      CORE PHILOSOPHY:
      - Support the user like a chill, health-conscious friend.
      - Focus on "crowding out" bad habits by adding good stuff, rather than just banning "fun" food.
      - Be witty but helpful.

      REQUIRED OUTPUT FORMAT (JSON):
      {
          "insight": "A 1-sentence summary of their pattern. Identify their 'Main Character' food and one thing that's missing.",
          "improvement": "One specific, actionable goal for next week (e.g., 'Aim for 3 colorful plates').",
          "alternative_suggestion": {
              "power_up": "Option A: What to ADD to their favorite frequent meal to make it better (e.g., 'Throw some frozen peas into your daily ramen').",
              "flavor_swap": "Option B: A tastier, smarter version of their 'weakness' food (e.g., 'Swap the deep-fried nuggets for air-fried spicy wings')."
          }
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