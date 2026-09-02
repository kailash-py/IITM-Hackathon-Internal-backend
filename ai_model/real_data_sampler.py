import pandas as pd
import numpy as np
import json
import sys
import os

BASE = os.path.dirname(os.path.abspath(__file__))

def sample_real_habitations():
    """Read real rows from both Kaggle datasets and build habitation feature sets"""
    
    # Load REAL flood dataset
    flood_df = pd.read_csv(os.path.join(BASE, "flood_risk_dataset_india.csv"))
    
    # Load REAL landslide dataset
    ls_df = pd.read_csv(os.path.join(BASE, "regenerated_landslide_risk_dataset.csv"))
    
    # Pick HIGH RISK real rows from flood data (where flood actually occurred)
    flood_high = flood_df[flood_df["Flood Occurred"] == 1].head(6)
    
    # Pick HIGH RISK real rows from landslide data
    ls_high = ls_df[ls_df["Landslide Risk Prediction"].isin(["High", "Very High"])].head(6)
    
    # Kerala real habitation names & coordinates for demo
    kerala_locations = [
        {"name": "Munnar Hillside Colony (Zone A)", "lat": 10.0889, "lng": 77.0595, "pop": 450, "hazard": "Landslide", "safeSite": "Relief Camp 04 - Munnar Base", "cap": 1200, "dist": "4.0 km"},
        {"name": "Aluva Riverbank Settlement (Ward 5)", "lat": 10.1004, "lng": 76.3570, "pop": 1200, "hazard": "Flood", "safeSite": "St. Mary's School Camp", "cap": 2000, "dist": "1.5 km"},
        {"name": "Wayanad Valley Village (Sec 4)", "lat": 11.6854, "lng": 76.1320, "pop": 890, "hazard": "Landslide", "safeSite": "Kalpetta Relief Camp", "cap": 1400, "dist": "6.0 km"},
        {"name": "Vypeen Coastal Settlement (Sector 2)", "lat": 10.1764, "lng": 76.2144, "pop": 3000, "hazard": "Cyclone / Coastal Flood", "safeSite": "Govt. High School Camp", "cap": 1500, "dist": "3.2 km"},
        {"name": "Idukki Dam Downstream (Block 7)", "lat": 9.8412, "lng": 76.9752, "pop": 680, "hazard": "Flood", "safeSite": "Idukki Community Hall", "cap": 900, "dist": "2.8 km"},
        {"name": "Kozhikode Hill Slope (Ward 11)", "lat": 11.2588, "lng": 75.7804, "pop": 1450, "hazard": "Landslide", "safeSite": "Kozhikode Stadium Camp", "cap": 2500, "dist": "5.1 km"},
    ]
    
    habitations = []
    
    for i, loc in enumerate(kerala_locations):
        # Get REAL flood features from actual dataset row
        flood_row = flood_high.iloc[i % len(flood_high)]
        flood_features = {
            "Latitude": loc["lat"],
            "Longitude": loc["lng"],
            "Rainfall (mm)": float(flood_row["Rainfall (mm)"]),
            "Temperature (AC)": float(flood_row.iloc[3]),  # Temperature column
            "Humidity (%)": float(flood_row["Humidity (%)"]),
            "River Discharge (mA3/s)": float(flood_row.iloc[5]),  # River Discharge
            "Water Level (m)": float(flood_row["Water Level (m)"]),
            "Elevation (m)": float(flood_row["Elevation (m)"]),
            "Land Cover": str(flood_row["Land Cover"]),
            "Soil Type": str(flood_row["Soil Type"]),
            "Population Density": float(flood_row["Population Density"]),
            "Infrastructure": int(flood_row["Infrastructure"]),
            "Historical Floods": int(flood_row["Historical Floods"])
        }
        
        # Get REAL landslide features from actual dataset row
        ls_row = ls_high.iloc[i % len(ls_high)]
        landslide_features = {
            "Temperature (C)": int(ls_row.iloc[0]),
            "Humidity (%)": int(ls_row["Humidity (%)"]),
            "Precipitation (mm)": int(ls_row["Precipitation (mm)"]),
            "Soil Moisture (%)": int(ls_row["Soil Moisture (%)"]),
            "Elevation (m)": int(ls_row["Elevation (m)"])
        }
        
        hab = {
            "id": i + 1,
            "name": loc["name"],
            "hazardType": loc["hazard"],
            "location": {"lat": loc["lat"], "lng": loc["lng"]},
            "population": loc["pop"],
            "matchedSafeSite": loc["safeSite"],
            "safeSiteCapacity": loc["cap"],
            "safeSiteDistance": loc["dist"],
            "status": "PENDING",
            "flood_features": flood_features,
            "landslide_features": landslide_features,
            "dataSource": {
                "flood_dataset_row": int(flood_high.index[i % len(flood_high)]),
                "landslide_dataset_row": int(ls_high.index[i % len(ls_high)]),
                "flood_dataset": "flood_risk_dataset_india.csv (10,000 rows Kaggle)",
                "landslide_dataset": "regenerated_landslide_risk_dataset.csv (5,000 rows)"
            }
        }
        habitations.append(hab)
    
    return habitations

def get_dataset_stats():
    """Return real dataset statistics for the dashboard"""
    flood_df = pd.read_csv(os.path.join(BASE, "flood_risk_dataset_india.csv"))
    ls_df = pd.read_csv(os.path.join(BASE, "regenerated_landslide_risk_dataset.csv"))
    
    return {
        "flood_dataset": {
            "total_rows": len(flood_df),
            "flood_positive": int(flood_df["Flood Occurred"].sum()),
            "flood_negative": int((flood_df["Flood Occurred"] == 0).sum()),
            "avg_rainfall": round(float(flood_df["Rainfall (mm)"].mean()), 1),
            "avg_water_level": round(float(flood_df["Water Level (m)"].mean()), 1),
            "avg_elevation": round(float(flood_df["Elevation (m)"].mean()), 1),
            "source": "Kaggle India Flood Risk Dataset"
        },
        "landslide_dataset": {
            "total_rows": len(ls_df),
            "high_risk": int(ls_df["Landslide Risk Prediction"].isin(["High", "Very High"]).sum()),
            "moderate_risk": int((ls_df["Landslide Risk Prediction"] == "Moderate").sum()),
            "low_risk": int((ls_df["Landslide Risk Prediction"] == "Low").sum()),
            "avg_precipitation": round(float(ls_df["Precipitation (mm)"].mean()), 1),
            "avg_soil_moisture": round(float(ls_df["Soil Moisture (%)"].mean()), 1),
            "source": "Regenerated Landslide Risk Dataset"
        }
    }

if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else "habitations"
    
    if action == "habitations":
        result = sample_real_habitations()
        print(json.dumps(result))
    elif action == "stats":
        result = get_dataset_stats()
        print(json.dumps(result))
