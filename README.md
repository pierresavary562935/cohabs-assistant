# 🏡 OpenAI Multi-language Assistant

Ce projet est une application full-stack combinant un **front-end React** et un **back-end Node.js/Express**. L'application intègre l'API **OpenAI** pour fournir des réponses basées sur l'historique de conversation et les disponibilités, tout en prenant en charge plusieurs langues (**français**, **anglais**, **néerlandais**).

## 📁 Structure du projet

```bash
cohabs-assistant/
├── express-backend/     # Application React
├── node-backend/        # API Node.js
├── express-backend/     # API Express
└── README.md
```

## 🚀 Démarrage rapide

### 📦 Prérequis
- Node.js (v16+ recommandé)
- npm ou yarn
- Clé API OpenAI

### 🖥️ Lancer le projet en local
1. Clone le repo :
```bash
git clone [https://github.com/user/repo.git](https://github.com/pierresavary562935/cohabs-assistant.git)
cd my-project
```

2. Installe les dépendances :


```bash
npm install
npm run init
npm start
```

## 🖥️ Lancer le projet en local maunellement
1. Back-end (API Express ou Node.js) :
```bash
cd back-end
node index.js ou npm start
# Serveur sur http://localhost:3000
```

2. Front-end (React) :
```bash
cd ../react-frontend
npm start
# Application sur http://localhost:3001
```

## 🧩 Fonctionnalités principales
	•	💬 Intégration OpenAI : Génère des réponses dynamiques basées sur l’historique de conversation et les disponibilités.
	•	🌐 Support multilingue : Français 🇫🇷, Anglais 🇬🇧, Néerlandais 🇳🇱.
	•	🏠 Gestion des disponibilités : Affiche les maisons et chambres disponibles.
	•	⚡ API Express : Communication sécurisée entre le front et OpenAI.

## 🛠️ Technologies utilisées
	•	Front-end : React, TypeScript
	•	Back-end : Express
	•	API : OpenAI GPT
	•	HTTP Client : Axios
	•	Styles : Tailwind CSS / CSS Modules

## 🧑‍💻 Auteur
	•	Pierre Savary

## 📄 License

Ce projet est sous licence MIT – Voir le fichier LICENSE.
