# Hazard Red Zone Alert & Rescue Coordination System

SIH 26191 · Team **The Invincible Trident** (IIT Madras BS Degree Programme)

Two-phase prototype: proactive multi-hazard carrying-capacity planning, then real-time alerts, landslide-aware rescue routing, and family reunification.

## How to run

You need Node.js 18+ and Python 3.10+ with pandas, scikit-learn, and joblib.

```bash
cd sih-hazard-system
npm install

python -m pip install -r ai_model/requirements.txt

cd backend
npm install
# optional: copy .env.example to .env and add Twilio keys
npm start
```

In a second terminal:

```bash
cd sih-hazard-system
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). On Windows you can also double-click `start_project.bat`.

Windows one-liner from this folder:

```bat
start_project.bat
```

## Environment variables

All secrets live in `backend/.env` (never commit it). See `backend/.env.example`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No (default 5000) | API port |
| `PYTHON_PATH` | No | Python used for Random Forest + A* |
| `TWILIO_ACCOUNT_SID` | No | Live SMS |
| `TWILIO_AUTH_TOKEN` | No | Twilio auth token (or use API key pair) |
| `TWILIO_API_KEY` / `TWILIO_API_SECRET` | No | Alternate Twilio auth |
| `TWILIO_PHONE_NUMBER` | For live SMS | Sender number |
| `TEST_MOBILE_NUMBER` | No | Default demo recipient |

If Twilio is missing or fails, alerts still complete in simulator mode.

Free services used (no extra keys):

- Open-Meteo — live Aluva weather on Overview
- OpenStreetMap + CARTO light tiles — map
- Browser speech — IVR voice when you tick that channel
- JSON file `backend/data/state.json` — demo state survives restart
- Server-Sent Events `/api/stream` — live refresh without Socket.IO

Not added (need paid or official access): Flutter apps, PostGIS/GSI layers, Cell Broadcast / SACHET, Twilio Voice, physical sirens.

## Demo path

1. Overview — Kerala map, pipeline, weather scenarios  
2. Relocation Plan — verify field evidence, sign an order  
3. Rescue Dispatch — assign an NDRF team, open the A* route  
4. Alerts — broadcast SMS/IVR/app/siren  
5. Reunification + Citizen Portal — register, search, send SOS  
