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

app.get('/mensa', async (req, res) => {
  try {
    const url = 'https://www.studierendenwerk-muenchen-oberbayern.de/gastronomie/speiseplan/speiseplan_411_-de.html';
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'de-DE,de;q=0.9' }
    });
    const html = await response.text();

    // Find today's section (date format YYYY-MM-DD)
    const today = new Date().toISOString().slice(0, 10);
    const startMarker = `heute_${today}`;
    const startIdx = html.indexOf(startMarker);
    if (startIdx === -1) return res.json([]);

    // Cut from today's section to the next day section
    const sectionStart = html.indexOf('<ul class="c-menu-dish-list">', startIdx);
    const sectionEnd   = html.indexOf('c-schedule__item', sectionStart + 10);
    const section      = sectionEnd > 0 ? html.slice(sectionStart, sectionEnd) : html.slice(sectionStart, sectionStart + 20000);

    // Extract category + dish name pairs from today's section
    const meals = [];
    const itemRe = /<li[^>]+js-menu__list-item[^>]*>[\s\S]*?<span class="stwm-artname">(.*?)<\/span>[\s\S]*?<p class="c-menu-dish__title">(.*?)<\/p>[\s\S]*?<\/li>/g;
    const SKIP = ['vegan', 'tagessu', 'dessert', 'obst', 'süßsp', 'fisch'];
    let m;
    while ((m = itemRe.exec(section)) !== null) {
      const cat  = m[1].replace(/<[^>]+>/g, '').trim();
      const name = m[2].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
      if (!cat || !name) continue; // skip items without a proper category label
      const catLower = cat.toLowerCase();
      if (!SKIP.some(s => catLower.includes(s))) meals.push({ category: cat, name });
    }

    res.json(meals);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
