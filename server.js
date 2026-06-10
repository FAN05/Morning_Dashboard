const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/departures', async (req, res) => {
  const { globalId, limit = 8 } = req.query;
  if (!globalId) return res.status(400).json({ error: 'globalId required' });
  try {
    const url = `https://www.mvg.de/api/bgw-pt/v3/departures?globalId=${encodeURIComponent(globalId)}&limit=${limit}&offsetInMinutes=0`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
