import { GoogleGenAI } from "@google/genai";
import { Measurements } from "../types";

// The AI client is initialized lazily to ensure process.env is available after shimming.
const getAIClient = () => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("Gemini API Key is missing. AI features will use fallback messages.");
      return null;
    }
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error("Failed to initialize Gemini AI:", e);
    return null;
  }
};

export const generateStyleAdvice = async (measurements: Measurements, stylePreference: string) => {
  const ai = getAIClient();
  if (!ai) return "Our style consultant suggests focusing on structured silhouettes that complement your natural proportions. Consider A-line cuts or tailored blazers for a timeless, elegant look.";
  
  try {
    const prompt = `Based on these measurements (in cm): Bust: ${measurements.bust}, Waist: ${measurements.waist}, Hips: ${measurements.hips}, Shoulder: ${measurements.shoulder}. 
    The user prefers ${stylePreference} styles. Suggest 3 specific silhouettes or clothing types that would flatter this body shape. Keep the tone elegant and professional.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Focus on silhouettes that highlight your natural waistline and offer a balanced proportion.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Our style consultant is currently unavailable. We recommend focusing on classic, well-fitted pieces.";
  }
};

export const generateProductDescription = async (productName: string) => {
  const ai = getAIClient();
  if (!ai) return "A masterpiece of bespoke tailoring, combining traditional techniques with contemporary elegance. Hand-finished for the perfect fit.";

  try {
    const prompt = `Write a luxurious, short marketing description (2 sentences) for a handcrafted clothing item named "${productName}". Mention the quality of stitching and premium materials.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    return response.text || "Exquisite craftsmanship meets timeless design in this bespoke creation.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Handcrafted with passion and precision using the finest materials.";
  }
};

export const generateEmailDraft = async (clientName: string, orderDetails: string, tailorName: string, tailorPhone: string) => {
  const ai = getAIClient();
  if (!ai) return `Dear ${clientName}, Your bespoke order for ${orderDetails} is now ready at our atelier. Please contact ${tailorName} at ${tailorPhone} to arrange your final fitting or collection.`;

  try {
    const prompt = `Draft a high-end, professional, and warm email to a client named ${clientName}. 
    Inform them that their bespoke order (${orderDetails}) is ready for pickup at our atelier. 
    Include the tailor's name (${tailorName}) and contact number (${tailorPhone}) for scheduling the pickup.
    Tone: Sophisticated, exclusive, and welcoming.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    return response.text || `Your bespoke order for ${orderDetails} is ready for collection.`;
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Dear ${clientName}, Your order (${orderDetails}) is ready for pickup. Please contact ${tailorName} at ${tailorPhone}.`;
  }
};