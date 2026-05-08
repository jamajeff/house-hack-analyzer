const Anthropic = require('@anthropic-ai/sdk');

const HEADERS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed.' }) };
  }

  try {
    const { imageData, mediaType } = JSON.parse(event.body);

    if (!imageData) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'No image provided.' }) };
    }

    const client = new Anthropic();

    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType || 'image/png',
                data: imageData,
              },
            },
            {
              type: 'text',
              text: `Extract property listing data from this screenshot. Return ONLY a JSON object with these fields (use null if not found):
{
  "price": number,
  "annualTaxes": number,
  "monthlyHOA": number,
  "rentZestimate": number,
  "address": string,
  "unitCount": number or null,
  "bedrooms": number or null
}

Rules:
- price: the listing/asking price in dollars (no commas)
- annualTaxes: annual property tax amount in dollars
- monthlyHOA: monthly HOA fee in dollars, 0 if none shown
- rentZestimate: monthly rent estimate in dollars
- unitCount: 2 for duplex, 3 for triplex, 4 for quadplex, null if single family or unclear
- Return only valid JSON, no explanation or markdown.`,
            },
          ],
        },
      ],
    });

    const text = message.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { statusCode: 422, headers: HEADERS, body: JSON.stringify({ error: 'Could not extract property data from the screenshot.' }) };
    }

    const data = JSON.parse(jsonMatch[0]);
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: `Something went wrong: ${err.message}` }) };
  }
};
