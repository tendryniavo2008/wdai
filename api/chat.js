// api/chat.js
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Méthode non autorisée." });
    }

    try {
        const { parts } = req.body;
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: "Clé API manquante sur Vercel." });
        }

        // NOUVELLE URL COMPATIBLE AVEC LES NOUVELLES CLÉS GOOGLE / FIREBASE
        const GEMINI_URL = `https://firebasevertexai.googleapis.com/v1beta/projects/worldai-4ec87/locations/us-central1/publishers/google/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const payload = {
            contents: [
                {
                    role: "user",
                    parts: parts
                }
            ]
        };

        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Gestion des erreurs serveurs
        if (data.error) {
            return res.status(200).json({ 
                candidates: [{ content: { parts: [{ text: `Erreur Configuration API : ${data.error.message}` }] } }] 
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}
