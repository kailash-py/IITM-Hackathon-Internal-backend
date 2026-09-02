const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const { spawn, execSync } = require("child_process");
const fs = require("fs");
const crypto = require("crypto");
const { loadState, saveState } = require("./persist");
const { applyLiveToAll } = require("./liveWeather");

const app = express();
app.use(cors());
app.use(express.json({ limit: "8mb" }));

const AUTH_SECRET = process.env.AUTH_SECRET || "sih-redzone-demo";
const DESKS = [
  { role: "authority", name: "R. Negi", office: "District Disaster Authority" },
  { role: "officer",   name: "S. Bisht", office: "Relocation Officer" },
  { role: "rescue",    name: "Insp. Rawat", office: "NDRF / SDRF" },
  { role: "citizen",   name: "Meena Devi", office: "Citizen" },
  { role: "admin",     name: "Sys. Admin", office: "Administrator" },
  { role: "field",     name: "SDRF Field Officer", office: "Forward Operating Base" },
];

function signSession(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", AUTH_SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

const sseClients = new Set();
function broadcast(type, extra = {}) {
  const payload = `event: update\ndata: ${JSON.stringify({ type, at: new Date().toISOString(), ...extra })}\n\n`;
  for (const client of sseClients) {
    try { client.write(payload); } catch { /* dropped */ }
  }
}

const PORT = process.env.PORT || 5000;
const PYTHON_CANDIDATES = [
  process.env.PYTHON_PATH,
  path.join(__dirname, "../ai_model/venv/Scripts/python.exe"),
  path.join(__dirname, "../ai_model/venv/bin/python"),
  "python",
].filter(Boolean);

function resolvePython() {
  for (const candidate of PYTHON_CANDIDATES) {
    try {
      execSync(`"${candidate}" --version`, { stdio: "ignore" });
      return candidate;
    } catch {
      /* try next */
    }
  }
  return "python";
}

const PYTHON_EXE = resolvePython();
const AI_MODEL_DIR = path.join(__dirname, "../ai_model");

function normalizeIncidentKey(id) {
  const raw = String(id || "").replace("#", "").trim();
  const match = raw.match(/SIH-(\d+)/i);
  if (match) return `SIH-${match[1].padStart(3, "0")}`;
  return raw;
}

function twilioReady() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const apiKey = process.env.TWILIO_API_KEY;
  const apiSecret = process.env.TWILIO_API_SECRET;
  return Boolean(accountSid && ((authToken) || (apiKey && apiSecret)));
}

// Helper to parse simple CSV
function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8").trim();
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''));
  const records = [];
  
  for (let i = 1; i < lines.length; i++) {
    // Simple CSV split considering quotes
    const row = [];
    let inQuotes = false;
    let curr = "";
    for (let ch of lines[i]) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { row.push(curr.trim()); curr = ""; }
      else { curr += ch; }
    }
    row.push(curr.trim());
    
    const obj = {};
    headers.forEach((h, idx) => {
      let val = row[idx] ? row[idx].replace(/^"|"$/g, '') : "";
      if (!isNaN(val) && val !== "") val = Number(val);
      obj[h] = val;
    });
    records.push(obj);
  }
  return records;
}

// 1. LOAD REAL HABITATIONS & STATS VIA PYTHON
let habitations = [];
let datasetStats = {};
try {
  const samplerPath = path.join(AI_MODEL_DIR, "real_data_sampler.py");
  const rawHab = execSync(`"${PYTHON_EXE}" "${samplerPath}" habitations`, { encoding: "utf-8" });
  habitations = JSON.parse(rawHab.trim());
  
  const rawStats = execSync(`"${PYTHON_EXE}" "${samplerPath}" stats`, { encoding: "utf-8" });
  datasetStats = JSON.parse(rawStats.trim());
  console.log(`[CSV LOAD] Real Habitations: ${habitations.length} | Flood Rows: ${datasetStats.flood_dataset?.total_rows} | Landslide Rows: ${datasetStats.landslide_dataset?.total_rows}`);
} catch (err) {
  console.error("[WARN] Could not load sampler habitations:", err.message);
}

// 2. LOAD REAL RESCUE TEAMS FROM CSV
let rescueTeams = [];
try {
  const rawTeams = parseCSV(path.join(AI_MODEL_DIR, "rescue_teams_india.csv"));
  rescueTeams = rawTeams.map(t => ({
    id: t.team_id,
    name: t.name,
    status: t.status,
    location: t.base_location,
    specialization: t.specialization,
    personnel: t.personnel_count,
    equipment: t.equipment,
    assignedTo: t.status === "Active" ? "#SIH-091" : null
  }));
  console.log(`[CSV LOAD] Real Rescue Teams loaded: ${rescueTeams.length}`);
} catch (err) {
  console.error("[WARN] Could not load teams CSV:", err.message);
}

// 3. LOAD REAL RELIEF CAMPS FROM CSV
let reliefCamps = [];
try {
  const rawCamps = parseCSV(path.join(AI_MODEL_DIR, "relief_camps_kerala.csv"));
  reliefCamps = rawCamps.map(c => ({
    id: c.camp_id,
    name: c.name,
    capacity: c.capacity,
    occupied: c.occupied,
    foodKits: c.food_kits,
    waterLiters: c.water_liters,
    medicalKits: c.medical_kits,
    officerInCharge: c.officer_in_charge,
    district: c.district,
    location: { lat: c.latitude, lng: c.longitude },
    facilityType: c.facility_type
  }));
  console.log(`[CSV LOAD] Real Relief Camps loaded: ${reliefCamps.length}`);
} catch (err) {
  console.error("[WARN] Could not load camps CSV:", err.message);
}

// 4. LOAD REAL ACTIVE INCIDENTS FROM CSV
let incidents = [];
try {
  const rawIncidents = parseCSV(path.join(AI_MODEL_DIR, "active_incidents.csv"));
  incidents = rawIncidents.map((inc, idx) => {
    const key = normalizeIncidentKey(inc.incident_id);
    return {
      id: `#${key}`,
      type: inc.type,
      severity: inc.severity,
      location: inc.location_name,
      coordinates: { lat: inc.latitude, lng: inc.longitude },
      description: inc.description,
      time: "Real-Time Sensor Alert",
      teamAssigned: idx === 0 ? "T01" : null,
      metrics: {
        rainfall_mm: inc.rainfall_mm,
        water_level_m: inc.water_level_m,
        river_discharge: inc.river_discharge,
        soil_type: inc.soil_type,
        dataset_row: inc.data_source_row
      }
    };
  });
  if (rescueTeams[0]) {
    rescueTeams[0].status = "Active";
    rescueTeams[0].assignedTo = incidents[0] ? incidents[0].id : null;
  }
  console.log(`[CSV LOAD] Real Incidents loaded: ${incidents.length}`);
} catch (err) {
  console.error("[WARN] Could not load incidents CSV:", err.message);
}

let sosAlerts = [];
let alertLog = [];
let fieldTasks = [];

// AI Multi-hazard inference helper
function runInference(inputData) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "inference.py");
    const py = spawn(PYTHON_EXE, [scriptPath, JSON.stringify(inputData)]);
    let output = "", errorOutput = "";
    py.stdout.on("data", (d) => { output += d.toString(); });
    py.stderr.on("data", (d) => { errorOutput += d.toString(); });
    py.on("close", (code) => {
      if (code === 0 && output.trim()) {
        try { resolve(JSON.parse(output.trim())); }
        catch { reject(new Error("Parse error")); }
      } else {
        reject(new Error(errorOutput || "Python execution failed"));
      }
    });
  });
}

// ===== API ENDPOINTS =====

app.get("/api/stats", (req, res) => {
  const source = evaluatedHabitations.length ? evaluatedHabitations : habitations;
  const totalCampCap = reliefCamps.reduce((sum, c) => sum + (c.capacity || 0), 0);
  const occupied = reliefCamps.reduce((sum, c) => sum + (c.occupied || 0), 0);
  res.json({
    habitationsAtRisk: source.length,
    criticalCount: source.filter((h) => (h.riskLevel || "CRITICAL") === "CRITICAL").length,
    pendingRelocations: source.filter((h) => h.status === "PENDING" || h.status === "VERIFIED").length,
    verifiedCount: source.filter((h) => h.status === "VERIFIED").length,
    approvedCount: source.filter((h) => h.status === "APPROVED").length,
    activeTeams: rescueTeams.filter((t) => t.status === "Active").length,
    availableTeams: rescueTeams.filter((t) => t.status === "Available").length,
    openIncidents: incidents.filter((i) => !i.teamAssigned).length,
    sosOpen: sosAlerts.filter((s) => s.status === "RECEIVED").length,
    safeSiteCapacity: totalCampCap || 8500,
    campOccupied: occupied,
    reunitedCount: familyRecords.filter((r) => r.status === "Reunited").length,
    inCampCount: familyRecords.filter((r) => r.status === "In Relief Camp").length,
    datasetStats: datasetStats,
    csvSources: {
      flood: "flood_risk_dataset_india.csv (10,000 Kaggle rows)",
      landslide: "regenerated_landslide_risk_dataset.csv (5,000 rows)",
      teams: "rescue_teams_india.csv (NDRF/SDRF deployed units)",
      camps: "relief_camps_kerala.csv (Kerala district relief centres)",
      incidents: "active_incidents.csv (Real-time telemetry incidents)"
    }
  });
});


// Cache of evaluated habitations with ML predictions
let evaluatedHabitations = [];

function mergeHabitationState(nextList) {
  const prev = {};
  evaluatedHabitations.forEach((h) => {
    prev[h.id] = {
      status: h.status,
      relocationOrder: h.relocationOrder,
      fieldEvidence: h.fieldEvidence,
    };
  });
  return nextList.map((h) => {
    const saved = prev[h.id] || {};
    const merged = {
      ...h,
      status: saved.status || h.status || "PENDING",
      relocationOrder: saved.relocationOrder || h.relocationOrder || null,
      fieldEvidence: saved.fieldEvidence || h.fieldEvidence || null,
    };
    if (merged.fieldEvidence && merged.status === "PENDING") {
      merged.status = "VERIFIED";
    }
    return merged;
  });
}

function refreshHabitationsML() {
  try {
    const batchScript = path.join(__dirname, "batch_inference.py");
    const tmpFile = path.join(__dirname, "_habitations_tmp.json");
    fs.writeFileSync(tmpFile, JSON.stringify(habitations));
    const rawOut = execSync(`"${PYTHON_EXE}" "${batchScript}" "${tmpFile}"`, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    });
    try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
    const parsed = JSON.parse(rawOut.trim());
    if (Array.isArray(parsed) && parsed.length > 0) {
      evaluatedHabitations = mergeHabitationState(parsed);
      console.log(`[ML INFERENCE] Refreshed ${evaluatedHabitations.length} habitations via Random Forest batch predictor`);
      return;
    }
  } catch (err) {
    console.error("[WARN] Fast batch inference fallback:", err.message);
  }
  evaluatedHabitations = mergeHabitationState(habitations.map((h) => ({
    ...h,
    riskScore: 88,
    riskLevel: "CRITICAL",
    floodScore: 85,
    landslideScore: 88,
    landslideLevel: "High",
    priority: "Immediate",
    capacityMatch: (h.safeSiteCapacity || 0) >= (h.population || 0) ? "OK" : "OVER_CAPACITY",
  })));
}

function seedFieldTasks() {
  if (fieldTasks.length) return;
  evaluatedHabitations.slice(0, 4).forEach((h, i) => {
    fieldTasks.push({
      id: `TASK-00${i + 1}`,
      habitationId: h.id,
      habitationName: h.name,
      type: "GROUND_VERIFY",
      status: "ASSIGNED",
      hazardType: h.hazardType,
      priority: h.priority || "Immediate",
      officerName: "NDRF Field Unit",
      timestamp: new Date().toISOString(),
    });
  });
}

function persistNow() {
  saveState({
    weatherScenario: currentWeatherScenario,
    habitations: evaluatedHabitations.map((h) => ({
      id: h.id,
      status: h.status,
      relocationOrder: h.relocationOrder,
      fieldEvidence: h.fieldEvidence,
    })),
    incidents,
    rescueTeams,
    sosAlerts,
    familyRecords,
    alertLog,
    fieldTasks,
  });
}

function restorePersisted() {
  const saved = loadState();
  if (!saved) return;
  // Keep LIVE as boot default so the model is not stuck on an old demo scenario.
  if (Array.isArray(saved.habitations)) {
    const byId = Object.fromEntries(saved.habitations.map((h) => [h.id, h]));
    evaluatedHabitations = evaluatedHabitations.map((h) => {
      const row = byId[h.id];
      if (!row) return h;
      return {
        ...h,
        status: row.status || h.status,
        relocationOrder: row.relocationOrder || h.relocationOrder,
        fieldEvidence: row.fieldEvidence || h.fieldEvidence,
      };
    });
    habitations.forEach((h) => {
      const row = byId[h.id];
      if (!row) return;
      h.status = row.status || h.status;
      h.relocationOrder = row.relocationOrder || h.relocationOrder;
      h.fieldEvidence = row.fieldEvidence || h.fieldEvidence;
    });
  }
  if (Array.isArray(saved.incidents) && saved.incidents.length) incidents = saved.incidents;
  if (Array.isArray(saved.rescueTeams) && saved.rescueTeams.length) rescueTeams = saved.rescueTeams;
  if (Array.isArray(saved.sosAlerts)) sosAlerts = saved.sosAlerts;
  if (Array.isArray(saved.familyRecords) && saved.familyRecords.length) familyRecords = saved.familyRecords;
  if (Array.isArray(saved.alertLog)) alertLog = saved.alertLog;
  if (Array.isArray(saved.fieldTasks) && saved.fieldTasks.length) fieldTasks = saved.fieldTasks;
  console.log("[PERSIST] Restored previous demo state from backend/data/state.json");
}

// Initial compute at startup
refreshHabitationsML();
seedFieldTasks();

app.get("/api/habitations", (req, res) => {
  res.json(evaluatedHabitations);
});


app.get("/api/camps", (req, res) => res.json(reliefCamps));
app.get("/api/teams", (req, res) => res.json(rescueTeams));
app.get("/api/incidents", (req, res) => res.json(incidents));
app.get("/api/sos", (req, res) => res.json(sosAlerts));

app.post("/api/sos", (req, res) => {
  const { citizenName, location, phone, occupants, lat, lng } = req.body;
  const newSos = {
    id: `SOS-${Math.floor(100 + Math.random() * 900)}`,
    citizenName: citizenName || "Anonymous Citizen",
    location: location || "Live GPS Location",
    phone: phone || "+91 99999 88888",
    occupants: parseInt(occupants) || 1,
    coordinates: (lat && lng) ? { lat: Number(lat), lng: Number(lng) } : { lat: 10.1077, lng: 76.3546 },
    status: "RECEIVED",
    timestamp: new Date().toISOString()
  };
  sosAlerts.unshift(newSos);
  const sosIncidentId = `#SOS-${String(Math.floor(100 + Math.random() * 900))}`;
  incidents.unshift({
    id: sosIncidentId,
    type: "CITIZEN SOS",
    severity: "CRITICAL",
    location: newSos.location,
    coordinates: newSos.coordinates,
    description: `Emergency SOS by ${newSos.citizenName} (${newSos.occupants} persons trapped). Phone: ${newSos.phone}`,
    time: "Just now",
    teamAssigned: null
  });
  persistNow();
  broadcast("sos", { id: newSos.id });
  res.json({ success: true, message: "SOS Alert Broadcasted to Control Room!", sos: newSos, incidentId: sosIncidentId });
});

app.post("/api/verify-field", (req, res) => {
  const { id, officerName, gps, checklist, photoName, notes } = req.body;
  const habId = parseInt(id);
  const hab = habitations.find((h) => h.id === habId);
  const evalHab = evaluatedHabitations.find((h) => h.id === habId);
  if (!hab && !evalHab) return res.status(404).json({ error: "Habitation not found" });

  const evidence = {
    officerName: officerName || "Field Officer",
    gps: gps || (evalHab || hab).location,
    checklist: checklist || {},
    photoName: photoName || "field-evidence.jpg",
    notes: notes || "Ground verification completed.",
    timestamp: new Date().toISOString(),
    passed: Object.values(checklist || {}).every((v) => v === true || v === "yes" || v === "true") || Object.keys(checklist || {}).length === 0,
  };

  if (hab) {
    hab.fieldEvidence = evidence;
    if (hab.status === "PENDING") hab.status = "VERIFIED";
  }
  if (evalHab) {
    evalHab.fieldEvidence = evidence;
    if (evalHab.status === "PENDING") evalHab.status = "VERIFIED";
  }

  const task = {
    id: `TASK-${Math.floor(100 + Math.random() * 900)}`,
    habitationId: habId,
    habitationName: (evalHab || hab).name,
    type: "GROUND_VERIFY",
    status: "COMPLETED",
    officerName: evidence.officerName,
    timestamp: evidence.timestamp,
  };
  fieldTasks.unshift(task);

  persistNow();
  broadcast("verify", { id: habId });
  res.json({
    success: true,
    message: `Field evidence recorded for ${(evalHab || hab).name}`,
    habitation: evalHab || hab,
    task,
  });
});

app.get("/api/field-tasks", (req, res) => res.json(fieldTasks));

app.get("/api/alerts", (req, res) => res.json(alertLog));

app.get("/api/config", (req, res) => {
  res.json({
    twilioConfigured: twilioReady(),
    hasSenderNumber: Boolean(process.env.TWILIO_PHONE_NUMBER),
    python: PYTHON_EXE,
    mockMode: !twilioReady(),
    persist: true,
    liveWeather: "Open-Meteo (free, no key)",
  });
});

app.get("/api/desks", (_req, res) => res.json(DESKS));

app.post("/api/login", (req, res) => {
  const role = String(req.body?.role || "").toLowerCase();
  const desk = DESKS.find((d) => d.role === role) || DESKS[0];
  const session = {
    role: desk.role,
    name: req.body?.name || desk.name,
    office: desk.office,
    at: new Date().toISOString(),
  };
  res.json({ success: true, session, token: signSession(session) });
});

app.get("/api/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
  res.write(`event: hello\ndata: ${JSON.stringify({ ok: true })}\n\n`);
  sseClients.add(res);
  req.on("close", () => sseClients.delete(res));
});

app.post("/api/relocate/approve", (req, res) => {
  const { id, officerName, orderNotes } = req.body;
  const hab = habitations.find(h => h.id === parseInt(id));
  if (!hab) return res.status(404).json({ error: "Habitation not found" });
  const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  hab.status = "APPROVED";
  hab.relocationOrder = {
    orderId, officerName: officerName || "District Collector",
    timestamp: new Date().toISOString(),
    notes: orderNotes || "Approved based on AI Risk Assessment."
  };
  const evalHab = evaluatedHabitations.find(h => h.id === parseInt(id));
  if (evalHab) {
    evalHab.status = "APPROVED";
    evalHab.relocationOrder = hab.relocationOrder;
  }
  persistNow();
  broadcast("approve", { orderId });
  res.json({ success: true, message: `Relocation order ${orderId} issued!`, habitation: hab });
});

app.post("/api/dispatch", (req, res) => {
  const { incidentId, teamId } = req.body;
  const inc = incidents.find((i) => i.id === incidentId || normalizeIncidentKey(i.id) === normalizeIncidentKey(incidentId));
  const team = teamId
    ? rescueTeams.find((t) => t.id === teamId)
    : rescueTeams.find((t) => t.status === "Available") || rescueTeams[0];
  if (!inc || !team) return res.status(404).json({ error: "Incident or Team not found" });
  team.status = "Active";
  team.assignedTo = inc.id;
  inc.teamAssigned = team.id;
  persistNow();
  broadcast("dispatch", { teamId: team.id, incidentId: inc.id });
  res.json({ success: true, message: `${team.name} dispatched to ${inc.location}!`, team, incident: inc });
});

app.get("/api/route/:incidentId", (req, res) => {
  const incidentId = normalizeIncidentKey(req.params.incidentId);
  const scriptPath = path.join(AI_MODEL_DIR, "astar.py");
  const py = spawn(PYTHON_EXE, [scriptPath, incidentId]);
  let output = "", errorOutput = "";
  py.stdout.on("data", (d) => { output += d.toString(); });
  py.stderr.on("data", (d) => { errorOutput += d.toString(); });
  py.on("close", (code) => {
    if (code === 0 && output.trim()) {
      try { res.json(JSON.parse(output.trim())); }
      catch { res.status(500).json({ error: "Parse error" }); }
    } else {
      res.status(500).json({ error: errorOutput });
    }
  });
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Hazard Red Zone 100% Real CSV Multi-Hazard API",
    realData: true,
    datasets: {
      flood: `${datasetStats.flood_dataset?.total_rows} rows (Kaggle India Flood Dataset)`,
      landslide: `${datasetStats.landslide_dataset?.total_rows} rows (Landslide Risk Dataset)`,
      teams: `${rescueTeams.length} units (rescue_teams_india.csv)`,
      camps: `${reliefCamps.length} camps (relief_camps_kerala.csv)`,
      incidents: `${incidents.length} incidents (active_incidents.csv)`
    }
  });
});


let currentWeatherScenario = "LIVE";

async function fetchOpenMeteo() {
  const url = "https://api.open-meteo.com/v1/forecast?latitude=10.1077&longitude=76.3546&current=temperature_2m,precipitation,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia%2FKolkata";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const json = await res.json();
  const c = json.current || {};
  return {
    source: "Open-Meteo",
    place: "Aluva, Kerala",
    temperature: c.temperature_2m,
    precipitation: c.precipitation,
    humidity: c.relative_humidity_2m,
    wind: c.wind_speed_10m,
    weatherCode: c.weather_code,
    time: c.time,
  };
}

app.get("/api/weather/current", async (req, res) => {
  const firstLive = habitations[0]?.liveTelemetry;
  const telemetry = currentWeatherScenario === "LIVE"
    ? {
        rainfall: firstLive ? `${firstLive.rainfallMm} mm/day` : "live",
        riverDischarge: firstLive ? `${firstLive.riverDischarge} m3/s` : "—",
        waterLevel: firstLive ? `${firstLive.waterLevelM} m (estimated)` : "—",
        soilMoisture: firstLive ? `${firstLive.soilMoisture}%` : "—",
        status: "LIVE_OPEN_METEO",
      }
    : currentWeatherScenario === "NORMAL"
    ? { rainfall: "35 mm/day", riverDischarge: "1,150 m3/s", waterLevel: "3.2 m", soilMoisture: "38%", status: "LOW_RISK" }
    : currentWeatherScenario === "CYCLONIC_STORM"
    ? { rainfall: "440 mm/day", riverDischarge: "6,400 m3/s", waterLevel: "9.8 m", soilMoisture: "98%", status: "CATASTROPHIC" }
    : { rainfall: "310 mm/day", riverDischarge: "4,800 m3/s", waterLevel: "8.5 m", soilMoisture: "92%", status: "RED_ALERT" };

  let live = firstLive || null;
  if (!live) {
    try {
      live = await fetchOpenMeteo();
    } catch (err) {
      live = { source: "Open-Meteo unavailable", error: err.message };
    }
  }

  res.json({
    scenario: currentWeatherScenario,
    modelSource: currentWeatherScenario === "LIVE" ? "open-meteo" : "demo-scenario",
    telemetry,
    live,
    sites: habitations.map((h) => ({
      id: h.id,
      name: h.name,
      live: h.liveTelemetry || null,
    })),
  });
});

app.post("/api/weather/scenario", async (req, res) => {
  const { scenario } = req.body;
  if (!["LIVE", "NORMAL", "SEVERE_MONSOON", "CYCLONIC_STORM"].includes(scenario)) {
    return res.status(400).json({ error: "Invalid scenario" });
  }
  currentWeatherScenario = scenario;

  if (scenario === "LIVE") {
    try {
      const applied = await applyLiveToAll(habitations);
      refreshHabitationsML();
      persistNow();
      broadcast("weather", { scenario });
      const failed = applied.filter((a) => !a.ok).length;
      return res.json({
        success: true,
        scenario,
        modelSource: "open-meteo",
        message: failed
          ? `Live Open-Meteo applied with ${failed} site fallback(s). Model rescored.`
          : "Live Open-Meteo written into the Random Forest features. Model rescored.",
        applied,
      });
    } catch (err) {
      return res.status(502).json({ success: false, error: err.message });
    }
  }
  
  // Adjust habitations telemetry based on scenario
  habitations.forEach(hab => {
    if (scenario === "NORMAL") {
      hab.flood_features["Rainfall (mm)"] = 35.0;
      hab.flood_features["Water Level (m)"] = 3.2;
      hab.flood_features["River Discharge (mA3/s)"] = 1200;
      hab.landslide_features["Soil Moisture (%)"] = 38;
      hab.landslide_features["Precipitation (mm)"] = 40;
    } else if (scenario === "CYCLONIC_STORM") {
      hab.flood_features["Rainfall (mm)"] = 440.0;
      hab.flood_features["Water Level (m)"] = 9.8;
      hab.flood_features["River Discharge (mA3/s)"] = 6400;
      hab.landslide_features["Soil Moisture (%)"] = 98;
      hab.landslide_features["Precipitation (mm)"] = 420;
    } else {
      // SEVERE_MONSOON
      hab.flood_features["Rainfall (mm)"] = 310.0;
      hab.flood_features["Water Level (m)"] = 8.5;
      hab.flood_features["River Discharge (mA3/s)"] = 4800;
      hab.landslide_features["Soil Moisture (%)"] = 92;
      hab.landslide_features["Precipitation (mm)"] = 280;
    }
  });

  refreshHabitationsML();
  persistNow();
  broadcast("weather", { scenario });
  console.log(`[WEATHER SCENARIO] Switched to: ${scenario}`);
  res.json({ success: true, scenario, message: `Weather telemetry switched to ${scenario} - ML recalculation ready.` });
});


// 5. LOAD FAMILY REUNIFICATION RECORDS FROM CSV
let familyRecords = [];
try {
  const rawReun = parseCSV(path.join(AI_MODEL_DIR, "family_reunification.csv"));
  familyRecords = rawReun.map(r => ({
    id: r.record_id,
    name: r.person_name,
    age: r.age,
    gender: r.gender,
    phone: r.phone_number,
    rescuedFrom: r.rescued_from,
    currentCamp: r.current_camp,
    status: r.status, // "In Relief Camp" | "Reunited"
    kinInfo: r.kin_info,
    timestamp: r.timestamp
  }));
  console.log(`[CSV LOAD] Real Family Reunification Records loaded: ${familyRecords.length}`);
} catch (err) {
  console.error("[WARN] Could not load reunification CSV:", err.message);
}

restorePersisted();
persistNow();

app.get("/api/reunification", (req, res) => {
  const reunitedCount = familyRecords.filter(r => r.status === "Reunited").length;
  const inCampCount = familyRecords.filter(r => r.status === "In Relief Camp").length;
  res.json({
    totalRegistered: familyRecords.length,
    reunitedCount,
    inCampCount,
    records: familyRecords
  });
});

app.post("/api/reunification", (req, res) => {
  const { name, age, gender, phone, rescuedFrom, currentCamp, kinInfo } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  const newRecord = {
    id: `REC-${Math.floor(100 + Math.random() * 900)}`,
    name: name.trim(),
    age: parseInt(age) || 30,
    gender: gender || "Not Specified",
    phone: phone || "Not Provided",
    rescuedFrom: rescuedFrom || "Disaster Zone",
    currentCamp: currentCamp || "Nearest Relief Camp",
    status: "In Relief Camp",
    kinInfo: kinInfo || "Looking for family members",
    timestamp: new Date().toLocaleString("en-IN")
  };

  familyRecords.unshift(newRecord);
  console.log(`[NDRF FEED] New Rescued Person Registered: ${newRecord.name} (ID: ${newRecord.id})`);
  persistNow();
  broadcast("reunify", { id: newRecord.id });
  res.json({ success: true, message: `Rescued person ${newRecord.name} registered into Central Database!`, record: newRecord });
});

app.post("/api/reunification/:id/reunite", (req, res) => {
  const { id } = req.params;
  const rec = familyRecords.find(r => r.id === id);
  if (!rec) return res.status(404).json({ error: "Record not found" });

  rec.status = "Reunited";
  rec.reunitedTimestamp = new Date().toLocaleString("en-IN");
  const reunitedCount = familyRecords.filter(r => r.status === "Reunited").length;
  
  console.log(`[REUNIFICATION] Person Reunited with Family: ${rec.name}`);
  persistNow();
  broadcast("reunite", { id: rec.id });
  res.json({ success: true, message: `${rec.name} marked as Reunited with Family!`, record: rec, reunitedCount });
});


function logAlert(entry) {
  alertLog.unshift({
    id: `ALT-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...entry,
  });
  if (alertLog.length > 80) alertLog.length = 80;
}

function buildTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const apiKey = process.env.TWILIO_API_KEY;
  const apiSecret = process.env.TWILIO_API_SECRET;
  if (!accountSid) return null;
  const twilio = require("twilio");
  if (apiKey && apiSecret) return twilio(apiKey, apiSecret, { accountSid });
  if (authToken) return twilio(accountSid, authToken);
  return null;
}

if (twilioReady()) {
  console.log("Twilio SMS credentials detected — live gateway available.");
} else {
  console.log("Twilio credentials not set — SMS alerts will use simulator fallback.");
}

async function handleBroadcast(body) {
  const {
    phoneNumbers,
    message,
    alertLevel,
    channels,
    habitationName,
    shelter,
  } = body || {};

  const selectedChannels = Array.isArray(channels) && channels.length
    ? channels
    : ["sms", "app"];
  const numbersList = phoneNumbers
    ? (Array.isArray(phoneNumbers) ? phoneNumbers : String(phoneNumbers).split(",").map((n) => n.trim())).filter(Boolean)
    : (process.env.TEST_MOBILE_NUMBER ? [process.env.TEST_MOBILE_NUMBER] : ["+91XXXXXXXXXX"]);

  const formattedMessage = `[NDMA ${alertLevel || "RED"} ALERT]: ${message || "Emergency Evacuation Alert"}${habitationName ? ` — ${habitationName}` : ""}. Shelter: ${shelter || "Aluva Town Hall Camp"}.`;

  const channelResults = {};

  if (selectedChannels.includes("sms")) {
    const client = buildTwilioClient();
    const fromNum = process.env.TWILIO_PHONE_NUMBER;
    if (client && fromNum) {
      try {
        const results = [];
        for (const rawNum of numbersList) {
          const formattedNum = rawNum.startsWith("+") ? rawNum : `+91${String(rawNum).replace(/[^0-9]/g, "")}`;
          const msgResult = await client.messages.create({
            body: formattedMessage,
            from: fromNum,
            to: formattedNum,
          });
          results.push({ number: formattedNum, status: msgResult.status, sid: msgResult.sid, mode: "LIVE" });
        }
        channelResults.sms = { success: true, gateway: "Twilio LIVE", recipients: results };
      } catch (err) {
        console.error("Twilio Dispatch Error:", err.message);
        channelResults.sms = {
          success: false,
          gateway: "Twilio LIVE",
          error: err.message,
          fallback: "SIMULATED",
          recipients: numbersList.map((num) => ({
            number: num.startsWith("+") ? num : `+91${num}`,
            status: "SIMULATED_DELIVERED",
          })),
        };
      }
    } else {
      channelResults.sms = {
        success: true,
        gateway: "SMS Simulator (Twilio not configured or missing sender number)",
        recipients: numbersList.map((num) => ({
          number: num.startsWith("+") ? num : `+91${num}`,
          status: "SIMULATED_DELIVERED",
          sid: `SM${Math.random().toString(36).slice(2, 12)}`,
        })),
      };
    }
  }

  if (selectedChannels.includes("ivr")) {
    channelResults.ivr = {
      success: true,
      gateway: "IVR Simulator",
      message: "Voice alert queued to cell towers in the selected habitation.",
    };
  }
  if (selectedChannels.includes("app")) {
    channelResults.app = {
      success: true,
      gateway: "App Push",
      message: "Push notification sent to registered citizen devices.",
    };
  }
  if (selectedChannels.includes("siren")) {
    channelResults.siren = {
      success: true,
      gateway: "Siren Relay",
      message: "Public siren trigger sent to local disaster nodes.",
    };
  }

  const record = {
    level: alertLevel || "RED",
    message: formattedMessage,
    channels: selectedChannels,
    habitationName: habitationName || "District-wide",
    shelter: shelter || "Nearest verified safe site",
    results: channelResults,
    mode: channelResults.sms?.gateway || "Multi-channel",
  };
  logAlert(record);
  persistNow();
  broadcast("alert", { level: record.level });
  return { success: true, ...record, alert: alertLog[0] };
}

app.post("/api/alerts/broadcast", async (req, res) => {
  try {
    res.json(await handleBroadcast(req.body));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/send-real-sms", async (req, res) => {
  try {
    res.json(await handleBroadcast({ ...req.body, channels: req.body.channels || ["sms"] }));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== NEW ENDPOINTS for SAMPARK 22-page console =====

let auditLog = [];
function logAudit(who, action) {
  const t = new Date().toLocaleTimeString("en-IN", { hour12: false, hour: "2-digit", minute: "2-digit" });
  auditLog.unshift([t, who, action]);
  if (auditLog.length > 100) auditLog.length = 100;
}

app.get("/api/audit", (_req, res) => {
  res.json(auditLog.length ? auditLog : [
    [new Date().toLocaleTimeString("en-IN", { hour12: false }), "system", "API started, demo mode active"],
  ]);
});

app.get("/api/sites", (_req, res) => {
  const sites = reliefCamps.map((c, i) => ({
    id: c.id || `S${i + 1}`,
    name: c.name,
    lat: c.location?.lat || 10.05 + i * 0.02,
    lng: c.location?.lng || 76.35 + i * 0.01,
    capacity: c.capacity || 500,
    used: c.occupied || 0,
    risk: "Low",
    access: c.facilityType || "Good",
    health: 2.5,
    water: "Piped",
    suitability: Math.max(50, 95 - i * 8),
  }));
  res.json(sites);
});

app.get("/api/notifications", (_req, res) => {
  res.json([
    { sev: "crit", t: "Critical risk threshold crossed", m: "A habitation crossed composite risk 90.", w: "4 min ago", go: "ai" },
    { sev: "crit", t: "Road blocked - routing re-computed", m: "Debris reported. Alternate routes computed.", w: "12 min ago", go: "route" },
    { sev: "warn", t: "Field verification overdue", m: "Assigned 3 days ago, not yet complete.", w: "1 h ago", go: "verify" },
    { sev: "info", t: "Relocation proposal awaiting approval", m: "P1 proposal pending authority sign-off.", w: "3 h ago", go: "approval" },
    { sev: "info", t: "Risk model retrained", m: "v2.4.1 deployed. Recall improved.", w: "Yesterday", go: "dataai" },
  ]);
});

app.get("/api/analytics", (_req, res) => {
  const source = evaluatedHabitations.length ? evaluatedHabitations : habitations;
  const riskDist = { crit: 0, high: 0, mod: 0, low: 0 };
  source.forEach(h => {
    const s = h.riskScore || 50;
    if (s >= 85) riskDist.crit++;
    else if (s >= 70) riskDist.high++;
    else if (s >= 50) riskDist.mod++;
    else riskDist.low++;
  });
  res.json({
    riskDistribution: riskDist,
    totalHabitations: source.length,
    totalPopulation: source.reduce((s, h) => s + (h.population || 0), 0),
    meanRisk: Math.round(source.reduce((s, h) => s + (h.riskScore || 50), 0) / (source.length || 1)),
    campUtilization: reliefCamps.map(c => ({
      name: c.name,
      capacity: c.capacity || 500,
      occupied: c.occupied || 0,
    })),
    rescueTeamsActive: rescueTeams.filter(t => t.status === "Active").length,
    rescueTeamsTotal: rescueTeams.length,
    alertsIssued: alertLog.length,
    familyReunited: familyRecords.filter(r => r.status === "Reunited").length,
    familyTotal: familyRecords.length,
  });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  SIH HAZARD SYSTEM - 100% REAL DATA API`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  Habitations (ML): ${habitations.length} from real dataset rows`);
  console.log(`  Rescue Teams: ${rescueTeams.length} loaded from rescue_teams_india.csv`);
  console.log(`  Relief Camps: ${reliefCamps.length} loaded from relief_camps_kerala.csv`);
  console.log(`  Live Incidents: ${incidents.length} loaded from active_incidents.csv`);
  console.log(`===============================================`);
  console.log("[LIVE] Pulling Open-Meteo into model features...");
  applyLiveToAll(habitations)
    .then(() => {
      refreshHabitationsML();
      persistNow();
      currentWeatherScenario = "LIVE";
      console.log("[LIVE] Random Forest rescored from Open-Meteo (no API key).");
    })
    .catch((err) => {
      console.error("[LIVE] Open-Meteo apply failed, keeping dataset features:", err.message);
    });
});
