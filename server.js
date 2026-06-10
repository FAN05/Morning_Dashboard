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
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'de-DE,de;q=0.9',
        'Referer': 'https://www.mvg.de/',
        'Origin': 'https://www.mvg.de',
        'Cache-Control': 'no-cache',
      }
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: `MVG returned ${response.status}` });
    }
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/locations', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'query required' });
  try {
    const url = `https://www.mvg.de/api/bgw-pt/v3/locations?query=${encodeURIComponent(query)}&limitStationTypes=STATION`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'application/json',
        'Referer': 'https://www.mvg.de/',
        'Origin': 'https://www.mvg.de',
      }
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
