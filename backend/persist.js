const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const STATE_FILE = path.join(DATA_DIR, "state.json");

function loadState() {
  try {
    if (!fs.existsSync(STATE_FILE)) return null;
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
  } catch (err) {
    console.error("[PERSIST] load failed:", err.message);
    return null;
  }
}

function saveState(state) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error("[PERSIST] save failed:", err.message);
  }
}

module.exports = { loadState, saveState, STATE_FILE };
