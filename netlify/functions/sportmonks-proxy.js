// Relaie les appels vers l'API Sportmonks côté serveur.
// Le jeton API vit uniquement ici (variable d'environnement Netlify SPORTMONKS_API_TOKEN),
// il ne transite jamais par le navigateur ni par un proxy tiers.
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const token = process.env.SPORTMONKS_API_TOKEN;
  if (!token) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "SPORTMONKS_API_TOKEN n'est pas configuré sur Netlify (Site settings > Environment variables)." }),
    };
  }

  const path = event.queryStringParameters && event.queryStringParameters.path;
  if (!path) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Paramètre "path" manquant.' }) };
  }

  const separator = path.includes('?') ? '&' : '?';
  const url = `https://api.sportmonks.com/v3/${path}${separator}api_token=${encodeURIComponent(token)}`;

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
      body: JSON.stringify({ error: 'Échec de la requête vers Sportmonks : ' + err.message }),
    };
  }
};
