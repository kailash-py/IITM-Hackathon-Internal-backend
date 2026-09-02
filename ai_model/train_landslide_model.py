import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib

def main():
    print("Loading Landslide Dataset...")
    df = pd.read_csv('regenerated_landslide_risk_dataset.csv')
    print(f"Dataset loaded. Shape: {df.shape}")
    
    # Fix column encoding issues if any
    df.columns = [c.replace('AC', 'C') for c in df.columns]
    
    df = df.fillna(df.mean(numeric_only=True))
    
    if 'Landslide Risk Prediction' not in df.columns:
        print("Error: 'Landslide Risk Prediction' column not found.")
        return

    X = df.drop(['Landslide Risk Prediction'], axis=1)
    y = df['Landslide Risk Prediction']
    
    le_target = LabelEncoder()
    y_encoded = le_target.fit_transform(y)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)
    
    print("Training Landslide Random Forest Classifier...")
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)
    
    y_pred = rf_model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc * 100:.2f}%")
    print(classification_report(y_test, y_pred, target_names=le_target.classes_))
    
    joblib.dump(rf_model, 'landslide_prediction_rf_model.pkl')
    joblib.dump(le_target, 'landslide_label_encoder.pkl')
    print("Saved landslide_prediction_rf_model.pkl successfully!")

if __name__ == '__main__':
    main()
