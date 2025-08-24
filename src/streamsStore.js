const fs = require('fs');
const path = require('path');

const MAP_PATH = path.join(__dirname, '..', 'data', 'streams.json');

function loadMap() {
  try {
    const raw = fs.readFileSync(MAP_PATH, 'utf8');
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

let cache = loadMap();

function getSourceByMovieId(id) {
  if (!cache) cache = loadMap();
  return cache[String(id)];
}

function setAll(mapping) {
  cache = mapping || {};
  try {
    const dir = path.dirname(MAP_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(MAP_PATH, JSON.stringify(cache, null, 2));
  } catch (e) {
    console.warn('streamsStore: failed to write map:', e.message);
  }
}

module.exports = { getSourceByMovieId, setAll, MAP_PATH };