import sys
import json
import joblib
import pandas as pd
import warnings
warnings.filterwarnings("ignore")

def predict_multi_hazard(input_data):
    try:
        results = {}
        
        # 1. Flood Prediction Model
        try:
            flood_model = joblib.load('../ai_model/flood_prediction_rf_model.pkl')
            label_encoders = joblib.load('../ai_model/label_encoders.pkl')
            
            df_flood = pd.DataFrame([input_data.get("flood_features", {})])
            for col, le in label_encoders.items():
                if col in df_flood.columns:
                    try:
                        df_flood[col] = le.transform(df_flood[col].astype(str))
                    except:
                        df_flood[col] = 0
            
            flood_prob = flood_model.predict_proba(df_flood)[0]
            flood_score = round(float(flood_prob[1]) * 100, 2)
            results["flood_score"] = flood_score
        except Exception as e:
            results["flood_score"] = 50.0

        # 2. Landslide Prediction Model
        try:
            ls_model = joblib.load('../ai_model/landslide_prediction_rf_model.pkl')
            ls_encoder = joblib.load('../ai_model/landslide_label_encoder.pkl')
            
            ls_features = input_data.get("landslide_features", {
                "Temperature (C)": 20, "Humidity (%)": 85, "Precipitation (mm)": 210,
                "Soil Moisture (%)": 75, "Elevation (m)": 850
            })
            df_ls = pd.DataFrame([ls_features])
            ls_pred_idx = ls_model.predict(df_ls)[0]
            ls_risk_class = ls_encoder.classes_[ls_pred_idx]
            
            class_score_map = {"Low": 25.0, "Moderate": 55.0, "High": 85.0, "Very High": 98.0}
            ls_score = class_score_map.get(ls_risk_class, 50.0)
            
            results["landslide_score"] = ls_score
            results["landslide_level"] = ls_risk_class
        except Exception as e:
            results["landslide_score"] = 40.0
            results["landslide_level"] = "Moderate"

        # Combined Multi-Hazard Score (Max or weighted average)
        combined_score = max(results["flood_score"], results["landslide_score"])
        results["risk_score"] = combined_score
        results["risk_level"] = "CRITICAL" if combined_score >= 75 else ("HIGH" if combined_score >= 50 else ("MODERATE" if combined_score >= 25 else "LOW"))

        print(json.dumps(results))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    input_json = sys.argv[1] if len(sys.argv) > 1 else "{}"
    input_data = json.loads(input_json)
    predict_multi_hazard(input_data)
