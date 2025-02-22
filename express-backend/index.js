const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  "https://cohabs-assistant.vercel.app", // Front-end en production
  // "http://localhost:3000", // Front-end en développement
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Non autorisé par CORS"));
      }
    },
  })
);
// pour parser les requêtes JSON
app.use(express.json());

// call server status
app.get("/api/status", (req, res) => {
  console.log("GET /api/status");
  res.json({ message: "Ok." });
});

// call availabilities
app.get("/api/fake-availabilities", (req, res) => {
  const availabilities = require("./availabilities");

  console.log("GET /api/availabilities", availabilities);
  res.status(200).json(availabilities);
});

// call real availabilities
// Updated /api/availabilities route
app.get("/api/availabilities", async (req, res) => {
  try {
    // External API URL (replace with the actual URL if needed)
    const externalApiUrl =
      "https://production.eks.cohabs.com/properties/houses/filter";

    // Make the API request
    const response = await axios.get(externalApiUrl);

    // Assuming the data is in response.data.filteredHouses.houses
    const houses = response.data.filteredHouses?.houses || [];

    // Format or filter the data if needed
    const availabilities = houses.map((house) => ({
      id: house.id,
      name: house.name,
      unitCount: house.unitCount,
      city: house.city,
      district: house.district,
      rentFrom: house.rentFrom,
      roomsCount: house.roomsCount,
      isComingSoon: house.isComingSoon,
      picture: house.picture,
      latitude: house.latitude,
      longitude: house.longitude,
      fullSlug: house.fullSlug,
    }));

    // Return the formatted data
    res.status(200).json(availabilities);
  } catch (error) {
    console.error("Error fetching availabilities:", error.message);
    res.status(500).json({ error: "Failed to fetch availabilities" });
  }
});

// call OpenAI
app.post("/api/openai", async (req, res) => {
  const userApiKey = req.headers.authorization?.split(" ")[1]; // get api key from header
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt requis" });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a friendly Cohabs assistant. Respond briefly and helpfully to user messages. Always end with a short compliment about both Cohabs and the user.",
          },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userApiKey}`,
        },
      }
    );

    const aiMessage = response.data.choices[0].message.content;
    res.json({ response: aiMessage });
  } catch (error) {
    console.error("Erreur lors de l'appel à OpenAI:", error.message);
    res.status(500).json({ error: "Erreur lors de l'appel à OpenAI" });
  }
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur http://localhost:${PORT}`);
});
