import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the API with your key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Export the model for use in your API routes
export const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });