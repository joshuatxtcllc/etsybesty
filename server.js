
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Etsy API configuration
const etsyConfig = {
  appName: process.env.ETSY_APP_NAME,
  apiKey: process.env.ETSY_API_KEY,
  sharedSecret: process.env.ETSY_SHARED_SECRET
};

if (!etsyConfig.apiKey) {
  console.error('Missing Etsy API credentials. Please set up environment variables.');
}

// API endpoint for Etsy config
app.get('/api/config', (req, res) => {
  res.json({
    apiKey: etsyConfig.apiKey
  });
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

// Handle store export to Etsy
app.post('/api/export-to-etsy', async (req, res) => {
  try {
    const { components } = req.body;
    
    // This would typically use the Etsy API to update the store
    // For now, we'll just return a success response
    
    // In a real implementation, you would:
    // 1. Validate the user's Etsy credentials
    // 2. Format the components into Etsy's expected format
    // 3. Make API calls to update store sections, about, policies, etc.
    
    console.log('Export request received with components:', components);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({
      success: true,
      message: 'Store layout successfully exported to Etsy'
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: 'Failed to export store to Etsy'
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
