// api/express-server.tsx

import axios from 'axios';

type Language = 'fr' | 'en' | 'nl';
interface Availability {
    houseName: string;
    availableRooms: number;
    city: string;
    address: string;
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

// Fetch server status
export const fetchServerStatus = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/status`);
        return response.data.message;
    } catch (err) {
        console.error("Error fetching server status:", err);
        throw new Error("Server error");
    }
};

// Fetch availabilities
export const fetchAvailabilities = async (): Promise<Availability[]> => {
    try {
        const response = await axios.get(`${API_URL}/api/availabilities`);
        return response.data;
    } catch (err) {
        console.error("Error fetching availabilities:", err);
        throw new Error("Failed to fetch availabilities");
    }
};

// Call OpenAI API
export const fetchOpenAi = async (
    user_prompt: string,
    chatHistory: { role: string; content: string }[],
    availabilities: Availability[],
    language: Language,
    userApiKey: string
) => {
    try {
        const languagePrompts: Record<Language, string> = {
            fr: `Voici l'historique de la conversation:\n${chatHistory.map((msg) => `${msg.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.content}`).join('\n')}.
          Voici les disponibilités actuelles:\n${availabilities.map((availability) => '🏠 Maison: ' + availability.houseName + '\n🛏️ Chambres disponibles: ' + availability.availableRooms + '\nVille: ' + availability.city + '\nAdresse: ' + availability.address).join('\n')}.
          \n\nMessage utilisateur: ${user_prompt}\n\nRéponse:`,
            en: `Here is the conversation history:\n${chatHistory.map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}.
          Here are the current availabilities:\n${availabilities.map((availability) => '🏠 House: ' + availability.houseName + '\n🛏️ Available rooms: ' + availability.availableRooms + '\nCity: ' + availability.city + '\nAddress: ' + availability.address).join('\n')}.
          \n\nUser message: ${user_prompt}\n\nResponse:`,
            nl: `Hier is de gespreksgeschiedenis:\n${chatHistory.map((msg) => `${msg.role === 'user' ? 'Gebruiker' : 'Assistent'}: ${msg.content}`).join('\n')}.
          Hier zijn de huidige beschikbaarheden:\n${availabilities.map((availability) => '🏠 Huis: ' + availability.houseName + '\n🛏️ Beschikbare kamers: ' + availability.availableRooms + '\nStad: ' + availability.city + '\nAdres: ' + availability.address).join('\n')}.
          \n\nGebruikersbericht: ${user_prompt}\n\nReactie:`,
        };

        const finalPrompt = languagePrompts[language];

        const response = await axios.post(
            `${API_URL}/api/openai`,
            { prompt: finalPrompt },
            {
                headers: {
                    'Authorization': `Bearer ${userApiKey}`,
                },
            }
        );

        return response.data.response;
    } catch (err) {
        console.error("Error calling OpenAI:", err);
        throw new Error("Failed to get response from OpenAI");
    }
};