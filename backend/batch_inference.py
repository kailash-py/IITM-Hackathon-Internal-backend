import sys
import json
import joblib
import pandas as pd
import warnings
import os
import re
warnings.filterwarnings("ignore")

BASE = os.path.dirname(os.path.abspath(__file__))
AI_DIR = os.path.join(BASE, "../ai_model")

# Load models once in memory
try:
    flood_model = joblib.load(os.path.join(AI_DIR, "flood_prediction_rf_model.pkl"))
    label_encoders = joblib.load(os.path.join(AI_DIR, "label_encoders.pkl"))
    ls_model = joblib.load(os.path.join(AI_DIR, "landslide_prediction_rf_model.pkl"))
    ls_encoder = joblib.load(os.path.join(AI_DIR, "landslide_label_encoder.pkl"))
except Exception as e:
    flood_model = None
    ls_model = None

class_score_map = {"Low": 25.0, "Moderate": 55.0, "High": 85.0, "Very High": 98.0}

def _feat_key(name):
    toks = re.findall(r"[a-z]+", str(name).lower())
    if not toks:
        return str(name)
    if toks[0] in ("temperature", "rainfall", "humidity", "elevation", "latitude", "longitude", "precipitation", "infrastructure"):
        return toks[0]
    return tuple(toks[:2])

def align_features(raw_dict, model):
    """Map sampler / weather keys onto the exact columns the pickle expects."""
    expected = list(getattr(model, "feature_names_in_", []))
    incoming = { _feat_key(k): v for k, v in (raw_dict or {}).items() }
    aligned = {}
    for col in expected:
        key = _feat_key(col)
        aligned[col] = incoming[key] if key in incoming else 0
    return pd.DataFrame([aligned]) if expected else pd.DataFrame([raw_dict or {}])

def predict_batch(habitations_list):
    results = []
    for hab in habitations_list:
        res = {}
        # 1. Flood Model
        try:
            df_flood = align_features(hab.get("flood_features", {}), flood_model)
            for col, le in (label_encoders or {}).items():
                match = next((c for c in df_flood.columns if _feat_key(c) == _feat_key(col)), None)
                if match:
                    try:
                        df_flood[match] = le.transform(df_flood[match].astype(str))
                    except Exception:
                        df_flood[match] = 0
            flood_prob = flood_model.predict_proba(df_flood)[0]
            flood_score = round(float(flood_prob[1]) * 100, 2)
            res["flood_score"] = flood_score
        except Exception:
            res["flood_score"] = 50.0

        # 2. Landslide Model
        try:
            ls_features = hab.get("landslide_features", {
                "Temperature (C)": 20, "Humidity (%)": 85, "Precipitation (mm)": 210,
                "Soil Moisture (%)": 75, "Elevation (m)": 850
            })
            df_ls = align_features(ls_features, ls_model)
            ls_pred_idx = ls_model.predict(df_ls)[0]
            ls_risk_class = ls_encoder.classes_[ls_pred_idx]
            ls_score = class_score_map.get(ls_risk_class, 50.0)
            res["landslide_score"] = ls_score
            res["landslide_level"] = ls_risk_class
        except Exception:
            res["landslide_score"] = 40.0
            res["landslide_level"] = "Moderate"

        combined_score = max(res["flood_score"], res["landslide_score"])
        res["risk_score"] = combined_score
        res["risk_level"] = "CRITICAL" if combined_score >= 75 else ("HIGH" if combined_score >= 50 else ("MODERATE" if combined_score >= 25 else "LOW"))
        
        # Merge with habitation fields
        full_hab = {
            "id": hab.get("id"),
            "name": hab.get("name"),
            "hazardType": hab.get("hazardType"),
            "location": hab.get("location"),
            "population": hab.get("population"),
            "matchedSafeSite": hab.get("matchedSafeSite"),
            "safeSiteCapacity": hab.get("safeSiteCapacity"),
            "safeSiteDistance": hab.get("safeSiteDistance"),
            "status": hab.get("status", "PENDING"),
            "relocationOrder": hab.get("relocationOrder", None),
            "riskScore": res["risk_score"],
            "riskLevel": res["risk_level"],
            "floodScore": res["flood_score"],
            "landslideScore": res["landslide_score"],
            "landslideLevel": res["landslide_level"],
            "dataSource": hab.get("dataSource"),
            "priority": "Immediate" if combined_score >= 75 else ("Short" if combined_score >= 50 else "Medium"),
            "capacityMatch": "OK" if (hab.get("safeSiteCapacity") or 0) >= (hab.get("population") or 0) else "OVER_CAPACITY",
            "fieldEvidence": hab.get("fieldEvidence"),
            "flood_features": hab.get("flood_features"),
            "landslide_features": hab.get("landslide_features"),
        }
        results.append(full_hab)
    
    results.sort(key=lambda x: x["riskScore"], reverse=True)
    return results

if __name__ == "__main__":
    arg = sys.argv[1] if len(sys.argv) > 1 else "[]"
    try:
        if os.path.isfile(arg):
            with open(arg, "r", encoding="utf-8") as f:
                hab_list = json.load(f)
        else:
            hab_list = json.loads(arg)
        output = predict_batch(hab_list)
        print(json.dumps(output))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
