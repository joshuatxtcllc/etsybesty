const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); // Import node-fetch
const app = express();

// Etsy API configuration
const etsyConfig = {
  appName: process.env.ETSY_APP_NAME,
  apiKey: process.env.ETSY_API_KEY,
  sharedSecret: process.env.ETSY_SHARED_SECRET
};

// Middleware to make Etsy config available to client
app.use((req, res, next) => {
  res.locals.etsyApiKey = etsyConfig.apiKey;
  next();
});

app.use(express.static(path.join(__dirname, '.')));
app.use(express.json());

// API endpoints
app.get('/api/etsy/analyze', async (req, res) => {
  try {
    const { keyword, category, priceRange } = req.query;
    const apiResponse = await fetch(`https://openapi.etsy.com/v3/application/listings/active?keywords=${keyword}&category=${category}`, {
      headers: {
        'x-api-key': etsyConfig.apiKey
      }
    });
    if (!apiResponse.ok) {
      throw new Error(`Etsy API responded with status: ${apiResponse.status}`);
    }
    const data = await apiResponse.json();
    res.json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to fetch data from Etsy API'
    });
  }
});

app.get('/api/etsy/competitors', async (req, res) => {
  try {
    const { keyword } = req.query;
    const apiResponse = await fetch(`https://openapi.etsy.com/v3/application/shops?keywords=${keyword}`, {
      headers: {
        'x-api-key': etsyConfig.apiKey
      }
    });
    if (!apiResponse.ok) {
      throw new Error(`Etsy API responded with status: ${apiResponse.status}`);
    }
    const data = await apiResponse.json();
    res.json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to fetch data from Etsy API'
    });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});