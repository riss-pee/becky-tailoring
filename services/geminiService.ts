
import { GoogleGenAI, Type } from "@google/genai";
import { Measurements } from "../types";

// Helper to safely initialize the AI client
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Style advice features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const ai = getAIClient();

export const generateStyleAdvice = async (measurements: Measurements, stylePreference: string) => {
  if (!ai) return "Our style consultant is currently offline. Please configure the API key.";
  
  try {
    const prompt = `Based on these measurements (in cm): Bust: ${measurements.bust}, Waist: ${measurements.waist}, Hips: ${measurements.hips}, Shoulder: ${measurements.shoulder}. 
    The user prefers ${stylePreference} styles. Suggest 3 specific silhouettes or clothing types that would flatter this body shape. Keep the tone elegant and professional.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Unable to generate advice at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Our style consultant is busy right now. Please try again later.";
  }
};

export const generateProductDescription = async (productName: string) => {
  if (!ai) return "Exquisite craftsmanship meet timeless design.";

  try {
    const prompt = `Write a luxurious, short marketing description (2 sentences) for a handcrafted clothing item named "${productName}". Mention the quality of stitching and premium materials.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    return response.text || "Exquisite craftsmanship meet timeless design.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Handcrafted with passion and precision.";
  }
};

export const generateEmailDraft = async (clientName: string, orderDetails: string, tailorName: string, tailorPhone: string) => {
  if (!ai) return `Dear ${clientName}, Your order (${orderDetails}) is ready for pickup. Please contact ${tailorName} at ${tailorPhone}.`;

  try {
    const prompt = `Draft a high-end, professional, and warm email to a client named ${clientName}. 
    Inform them that their bespoke order (${orderDetails}) is ready for pickup at our atelier. 
    Include the tailor's name (${tailorName}) and contact number (${tailorPhone}) for scheduling the pickup.
    Tone: Sophisticated, exclusive, and welcoming.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    return response.text || "Your order is ready for pickup.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Dear ${clientName}, Your order (${orderDetails}) is ready for pickup. Please contact ${tailorName} at ${tailorPhone}.`;
  }
};
