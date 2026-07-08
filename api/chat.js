// api/chat.js
export default async function handler(req, res) {
    // Configurer les headers CORS pour autoriser ton fichier HTML
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Méthode non autorisée" });
    }

    try {
        const { parts } = req.body;

        // Récupération de la clé API cachée dans les variables d'environnement Vercel
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: "La clé API Gemini est manquante sur le serveur Vercel." });
        }

        const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        // Appel sécurisé à Google Gemini depuis les serveurs de Vercel
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts }] })
        });

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur interne du serveur Serverless." });
    }
}