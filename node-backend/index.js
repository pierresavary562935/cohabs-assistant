const http = require("http");
const https = require("https");
require("dotenv").config();

const PORT = 3001;

// Fonction pour appeler l'API OpenAI
function callOpenAI(prompt, callback) {
  const data = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 100,
  });

  const options = {
    hostname: "api.openai.com",
    path: "/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  };

  const req = https.request(options, (res) => {
    let body = "";

    res.on("data", (chunk) => {
      body += chunk;
    });

    res.on("end", () => {
      try {
        if (res.statusCode === 200) {
          const response = JSON.parse(body);
          const aiMessage = response.choices[0].message.content;
          callback(null, aiMessage);
        } else {
          console.error("Erreur API OpenAI:", res.statusCode, body);
          callback(`Erreur API OpenAI: ${res.statusCode} - ${body}`, null);
        }
      } catch (e) {
        console.error("Erreur lors du parsing:", e);
        callback("Erreur lors du parsing de la réponse.", null);
      }
    });
  });

  req.on("error", (e) => {
    console.error("Erreur de requête:", e);
    callback(`Erreur de requête: ${e.message}`, null);
  });

  req.write(data);
  req.end();
}
// Middleware CORS
function enableCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Autorise toutes les origines
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Fonction pour gérer les routes
function routeHandler(req, res) {
  enableCORS(res); // Active CORS pour chaque requête
  const { method, url } = req;

  // Route : GET /api/status
  if (method === "GET" && url === "/api/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "OK", message: "Serveur opérationnel" }));

    // Route : GET /api/time
  } else if (method === "GET" && url === "/api/time") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ time: new Date().toISOString() }));

    // Route : POST /api/openai
  } else if (method === "POST" && url === "/api/openai") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const { prompt } = JSON.parse(body);

        if (!prompt) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Le prompt est requis." }));
          return;
        }

        // Appel à OpenAI
        callOpenAI(prompt, (err, aiResponse) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err }));
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ response: aiResponse }));
          }
        });
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Requête JSON invalide." }));
      }
    });

    // Route inconnue
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Route non trouvée." }));
  }
}

// Création du serveur
const server = http.createServer(routeHandler);

// Lancement du serveur
server.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur http://localhost:${PORT}`);
});
