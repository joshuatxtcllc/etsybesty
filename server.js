
const express = require('express');
const path = require('path');
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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
