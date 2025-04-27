const express = require('express');
const cors = require('cors');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
require('dotenv').config();

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

const serviceAccount = require('./plaid-service-account.json');

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const app = express();
app.use(cors());
app.use(express.json());

const isSandbox = process.env.PLAID_ENV === 'sandbox'; 

const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(config);

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
  res.send(' Backend is alive!');
});

app.post('/api/exchange_public_token', async (req, res) => {
  const { public_token, uid } = req.body;

  if (!public_token || !uid) {
    return res.status(400).json({ error: 'Missing public_token or uid' });
  }

  try {
    const response = await client.itemPublicTokenExchange({ public_token });
    const access_token = response.data.access_token;

    await db.collection('users').doc(uid).set(
      {
        plaid: {
          access_token,
          item_id: response.data.item_id,
          linkedAt: new Date().toISOString(),
        },
      },
      { merge: true }
    );

    res.json({ success: true });
    console.log(` Access token saved for user ${uid}`);
  } catch (error) {
    console.error('❌ Failed to exchange token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Exchange failed' });
  }
});

app.post('/api/sync_transactions', async (req, res) => {
  const { uid } = req.body;

  if (!uid) return res.status(400).json({ error: 'Missing uid' });

  try {
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const access_token = userSnap.data()?.plaid?.access_token;
    if (!access_token) {
      return res.status(400).json({ error: 'No access_token stored for this user' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();

    const plaidResponse = await client.transactionsGet({
      access_token,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    });

    const transactions = plaidResponse.data.transactions;
    console.log(`📦 Retrieved ${transactions.length} transactions for ${uid}`);

    const batch = db.batch();
    let totalSyncedAmount = 0;
    let syncedCount = 0;

    for (const tx of transactions.filter(t => t.amount < 0)) {
      const txId = tx.transaction_id;
      const txRef = userRef.collection('transactions').doc(txId);
      const existingTx = await txRef.get();

      if (!existingTx.exists) {
        const amount = Math.abs(tx.amount);
        batch.set(txRef, {
          amount,
          category: tx.category?.[0] || 'Uncategorized',
          description: tx.name,
          date: tx.date,
          source: 'plaid',
        });

        totalSyncedAmount += amount;
        syncedCount++;
      } else {
        console.log(`⚠️ Skipping duplicate: ${txId}`);
      }
    }

    if (syncedCount > 0) {
      batch.update(userRef, {
        totalSpent: FieldValue.increment(totalSyncedAmount),
      });
      await batch.commit();
    }

    res.json({ success: true, count: syncedCount });
  } catch (error) {
    console.error('❌ Error syncing transactions:', error.response?.data || error.message);
    res.status(500).json({ error: 'Transaction sync failed' });
  }
});





const PORT = 5005;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
