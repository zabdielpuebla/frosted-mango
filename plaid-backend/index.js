const express = require('express');
const cors = require('cors');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const config = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(config);

// 🔑 New route to get a real link_token
app.post('/api/create_link_token', async (req, res) => {
  try {
    const response = await client.linkTokenCreate({
      user: { client_user_id: 'test-user-id' },
      client_name: 'My Budget App',
      products: ['auth', 'transactions'],
      country_codes: ['US'],
      language: 'en',
    });

    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('❌ Error creating link token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create link token' });
  }
});

app.get('/', (req, res) => {
  res.send('✅ Backend is alive!');
});

const PORT = 5005;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});


