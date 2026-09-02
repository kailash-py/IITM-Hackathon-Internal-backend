import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib

def main():
    print("Loading Flood Risk Dataset...")
    try:
        df = pd.read_csv('flood_risk_dataset_india.csv')
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return

    print(f"Dataset loaded. Shape: {df.shape}")
    
    df = df.fillna(df.mean(numeric_only=True))
    for col in df.select_dtypes(include=['object']):
        df[col] = df[col].fillna(df[col].mode()[0])

    label_encoders = {}
    categorical_cols = ['Land Cover', 'Soil Type']
    
    for col in categorical_cols:
        if col in df.columns:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            label_encoders[col] = le

    if 'Flood Occurred' not in df.columns:
        print("Error: 'Flood Occurred' column not found in dataset.")
        return
        
    X = df.drop(['Flood Occurred'], axis=1)
    y = df['Flood Occurred']
    
    print("Splitting dataset into train and test sets (80-20)...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Classifier (Multi-Hazard Core Model)...")
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = rf_model.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    print(f"\n--- Model Results ---")
    print(f"Accuracy: {acc * 100:.2f}%")
    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    
    model_filename = 'flood_prediction_rf_model.pkl'
    joblib.dump(rf_model, model_filename)
    joblib.dump(label_encoders, 'label_encoders.pkl')
    
    print(f"\nSuccess! Model saved to {model_filename}")

if __name__ == '__main__':
    main()
