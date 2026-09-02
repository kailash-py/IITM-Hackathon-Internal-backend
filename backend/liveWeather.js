/**
 * Free live telemetry (no API key):
 * - Open-Meteo forecast: temp, humidity, rain, soil moisture, elevation
 * - Open-Meteo flood: river discharge where the global model has a cell
 *
 * Not available without official keys: IMD AWS, CWC gauge water-level (m).
 * Water level here is estimated from rain + discharge so the flood model still gets a number.
 */

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

async function fetchPoint(lat, lng) {
  const forecastUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation,soil_moisture_0_to_7cm` +
    `&daily=precipitation_sum&forecast_days=1&timezone=Asia%2FKolkata`;

  const forecast = await fetchJson(forecastUrl);
  const cur = forecast.current || {};
  const dailyRain = Number(forecast.daily?.precipitation_sum?.[0] ?? cur.precipitation ?? 0);
  const hourlyRain = Number(cur.precipitation ?? 0);
  const rainMm = Math.max(dailyRain, hourlyRain);
  const temp = Number(cur.temperature_2m ?? 28);
  const humidity = Number(cur.relative_humidity_2m ?? 70);
  const soilFrac = cur.soil_moisture_0_to_7cm;
  const soilPct = soilFrac == null ? Math.min(95, 35 + rainMm * 0.15) : Math.round(Number(soilFrac) * 1000) / 10;
  const elevation = Number(forecast.elevation ?? 20);

  let discharge = null;
  try {
    const flood = await fetchJson(
      `https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lng}&daily=river_discharge&forecast_days=1`
    );
    discharge = Number(flood.daily?.river_discharge?.[0]);
    if (!Number.isFinite(discharge)) discharge = null;
  } catch {
    discharge = null;
  }

  const river = discharge != null ? discharge : 800 + rainMm * 8;
  const waterLevel = Math.min(12, Math.max(1.4, 2.4 + rainMm / 90 + river / 2500));

  return {
    source: "Open-Meteo",
    lat,
    lng,
    temperature: temp,
    humidity,
    rainfallMm: Math.round(rainMm * 10) / 10,
    soilMoisture: Math.min(99, Math.max(5, soilPct)),
    elevation,
    riverDischarge: Math.round(river),
    waterLevelM: Math.round(waterLevel * 10) / 10,
    riverDischargeLive: discharge != null,
    waterLevelEstimated: true,
    time: cur.time || forecast.daily?.time?.[0],
  };
}

function applyToHabitation(hab, live) {
  hab.flood_features = hab.flood_features || {};
  hab.landslide_features = hab.landslide_features || {};

  hab.flood_features["Latitude"] = hab.location?.lat ?? live.lat;
  hab.flood_features["Longitude"] = hab.location?.lng ?? live.lng;
  hab.flood_features["Rainfall (mm)"] = live.rainfallMm;
  hab.flood_features["Temperature (AC)"] = live.temperature;
  hab.flood_features["Humidity (%)"] = live.humidity;
  hab.flood_features["River Discharge (mA3/s)"] = live.riverDischarge;
  hab.flood_features["Water Level (m)"] = live.waterLevelM;
  if (live.elevation) hab.flood_features["Elevation (m)"] = live.elevation;

  hab.landslide_features["Temperature (C)"] = Math.round(live.temperature);
  hab.landslide_features["Humidity (%)"] = Math.round(live.humidity);
  hab.landslide_features["Precipitation (mm)"] = Math.round(live.rainfallMm);
  hab.landslide_features["Soil Moisture (%)"] = Math.round(live.soilMoisture);
  if (live.elevation) hab.landslide_features["Elevation (m)"] = Math.round(live.elevation);

  hab.liveTelemetry = live;
}

async function applyLiveToAll(habitations) {
  const results = [];
  for (const hab of habitations) {
    const lat = hab.location?.lat || 10.1077;
    const lng = hab.location?.lng || 76.3546;
    try {
      const live = await fetchPoint(lat, lng);
      applyToHabitation(hab, live);
      results.push({ id: hab.id, name: hab.name, ok: true, live });
    } catch (err) {
      results.push({ id: hab.id, name: hab.name, ok: false, error: err.message });
    }
  }
  return results;
}

module.exports = { fetchPoint, applyToHabitation, applyLiveToAll };
