const HEADERS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

exports.handler = async (event) => {
  const url = event.queryStringParameters?.url;

  if (!url || !url.includes('zillow.com')) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Please provide a valid Zillow URL.' }),
    };
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'follow',
    });

    if (response.status === 403 || response.status === 429) {
      return {
        statusCode: 503,
        headers: HEADERS,
        body: JSON.stringify({
          error: 'Zillow blocked this request. Enter the details manually from the listing.',
        }),
      };
    }

    const html = await response.text();

    // Zillow embeds all property data in a __NEXT_DATA__ script tag
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!match) {
      return {
        statusCode: 422,
        headers: HEADERS,
        body: JSON.stringify({
          error: 'Could not read Zillow data — the page may have changed or been blocked.',
        }),
      };
    }

    const nextData = JSON.parse(match[1]);

    // Try multiple paths — Zillow's structure changes over time
    let property = null;

    const gdpCache = nextData?.props?.pageProps?.gdpClientCache;
    if (gdpCache) {
      for (const key of Object.keys(gdpCache)) {
        const candidate = gdpCache[key]?.property;
        if (candidate?.price) { property = candidate; break; }
      }
    }

    if (!property) {
      const redux = nextData?.props?.pageProps?.initialReduxState;
      property = redux?.gdp?.fullPageRenderData?.property;
    }

    if (!property) {
      return {
        statusCode: 422,
        headers: HEADERS,
        body: JSON.stringify({
          error: 'Found the Zillow page but could not extract property data.',
        }),
      };
    }

    // Build address string
    const addr = property.address;
    const address = addr
      ? `${addr.streetAddress}, ${addr.city}, ${addr.state} ${addr.zipcode}`
      : null;

    // Estimate taxes from rate if available, else from annual amount
    let annualTaxes = null;
    if (property.propertyTaxRate && property.price) {
      annualTaxes = Math.round(property.price * property.propertyTaxRate / 100);
    } else if (property.taxHistory?.[0]?.taxPaid) {
      annualTaxes = property.taxHistory[0].taxPaid;
    }

    // Determine likely unit count from homeType / description
    const homeType = (property.homeType || '').toLowerCase();
    let unitCount = null;
    if (homeType.includes('duplex') || homeType.includes('two')) unitCount = 2;
    else if (homeType.includes('triplex') || homeType.includes('three')) unitCount = 3;
    else if (homeType.includes('quadruplex') || homeType.includes('four') || homeType.includes('quad')) unitCount = 4;
    else if (homeType.includes('multi')) unitCount = 2; // safe default

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        price: property.price || null,
        annualTaxes,
        monthlyHOA: property.monthlyHoaFee || 0,
        rentZestimate: property.rentZestimate || null,
        address,
        homeType: property.homeType || null,
        unitCount,
        bedrooms: property.bedrooms || null,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: `Something went wrong: ${err.message}` }),
    };
  }
};
