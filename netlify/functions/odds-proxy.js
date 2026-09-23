// Relaie les appels vers The Odds API côté serveur.
// La clé vit uniquement ici (variable d'environnement Netlify ODDS_API_KEY),
// elle ne transite jamais par le navigateur.
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const token = process.env.ODDS_API_KEY;
  if (!token) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "ODDS_API_KEY n'est pas configuré sur Netlify (Site settings > Environment variables)." }),
    };
  }

  const path = event.queryStringParameters && event.queryStringParameters.path;
  if (!path) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Paramètre "path" manquant.' }) };
  }

  const separator = path.includes('?') ? '&' : '?';
  const url = `https://api.the-odds-api.com/v4/${path}${separator}apiKey=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url);
    const text = await res.text();
    return {
      statusCode: res.status,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: 'Échec de la requête vers The Odds API : ' + err.message }),
    };
  }
};
