import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEYS = [
  "AIzaSyBs3obwfDSN3cuqiEIeYRNB9tcvOKt5FDk",
  "AIzaSyD2pkwIQVqFaZSb1klw2CC7koYTKFZ508s",
  "AIzaSyAgh-Oo1DOqO0Wn16rRB491J-06V6ib5XQ"
];

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash-lite"
];

export function getDynamicConfig() {
  const randomKey = API_KEYS[Math.floor(Math.random() * API_KEYS.length)];
  const randomModel = MODELS[Math.floor(Math.random() * MODELS.length)];
  
  const genAI = new GoogleGenerativeAI(randomKey);
  const model = genAI.getGenerativeModel({ model: randomModel });
  
  return { model, modelName: randomModel };
}
