# SIH Hackathon Live Demo Script

**Project:** Hazard Red Zone Alert & Rescue Coordination System  
**Team:** The Invincible Trident — IIT Madras BS Degree Programme

## Opening (30 seconds)

Current systems are reactive. This platform first ranks habitations by carrying-capacity risk, then uses that same picture for alerts, landslide-aware routing, and family reunification.

## Live sequence

1. **Overview** at `http://localhost:5173`  
   Kerala OSM map: red = AI-flagged habitations, blue = camps, pink = incidents. Switch weather (Normal / Severe monsoon / Cyclonic) to rescore with the Random Forest models.

2. **Relocation Plan**  
   Show flood + landslide scores and capacity match. Click **Verify field evidence**, tick the checklist, submit. Click **Approve relocation**, enter officer name, **Sign & issue order**. Note the `ORD-2026-XXXX` id.

3. **Rescue Dispatch**  
   Click **Dispatch NDRF team** — status moves Available → Active. Click **View A\* route** — red-zone cells are penalised so the corridor avoids debris/flood.

4. **Alerts**  
   Broadcast SMS / IVR / app / siren. Live Twilio if `.env` is set; otherwise the simulator still completes the demo.

5. **Citizen + Reunification**  
   Send an SOS (it appears on the map). Search a name such as `Ananya`. Register a rescued person and mark them reunited.

## Launcher

Double-click `start_project.bat` in this folder, or run the backend and `npm run dev` as described in the README.
