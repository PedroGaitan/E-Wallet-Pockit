import { GoogleGenerativeAI } from "@google/generative-ai";

// TU API KEY
const API_KEY = "AIzaSyBBoLkab0CY32KxZI-7SZ1rtWcC8uHL8c8"; 

const checkModels = async () => {
  try {
    // Hacemos un fetch directo porque el SDK a veces oculta estos detalles
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    console.log("=== MODELOS DISPONIBLES PARA TU API KEY ===");
    const availableModels = data.models
      .filter(m => m.supportedGenerationMethods.includes("generateContent")) // Solo los que generan texto/chat
      .map(m => m.name.replace("models/", "")); // Limpiamos el prefijo para que sea fácil de leer

    console.log(availableModels);
    
  } catch (error) {
    console.error("Error al listar modelos:", error);
  }
};

checkModels();