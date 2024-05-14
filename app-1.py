import pandas as pd
from fhirclient import client
from flask import Flask, jsonify, render_template

# Replace 'path/to/data.csv' with the actual path to your data file
data_path = 'new_datase1.csv'



# Flask app setup to serve the FHIR data as JSON (not shown, similar to previous example)
app = Flask(__name__)

# load dataset
df = pd.read_csv('data/dataset.csv')
df = df.dropna(subset=['daily_new_cases'])
df = df.dropna(subset=['daily_new_deaths'])
"""print(df.describe())
print("\nMissing values in the dataset:")
print(df.isnull().sum())"""

# Route to serve HTML page
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/fhir-data')
def get_fhir_data():
      fhir_data = []
      for _, row in df.iterrows():
          # Convert each row of dataset to FHIR-compliant format
          resource = {
            "resourceType": "Observation",
            "status": "final",
            "code": {
              "text": "COVID-19 Data"
            },
            "subject": {
              "display": row['country'] # reference to country as subject
            },
            "effectiveDateTime": row['date'],
            "valueQuantity": [
              {
                "value": row['cumulative_total_cases'],
                "unit": "cases"
              },
              {
                "value": row['daily_new_cases'],  # Daily new cases
                    "unit": "cases/day"
              },
              {
                "value": row['cumulative_total_deaths'],  # Cumulative total deaths
                    "unit": "deaths"
              },
              {
                "value": row['daily_new_deaths'],  # Daily new deaths
                    "unit": "deaths/day"
              },
              {
                "value": row['total_confirmed'],  # Total confirmed cases
                    "unit": "cases"
              },
              {
                "value": row['total_deaths'],  # Total deaths
                    "unit": "deaths"
              },
              {
                "value": row['total_recovered'],  # Total recovered cases
                    "unit": "recovered"
              },
              {
                "value": row['active_cases_y'],  # Active cases
                    "unit": "cases"
              },
              {
                    "value": row['serious_or_critical'],  # Serious or critical cases
                    "unit": "cases"
                },
                {
                    "value": row['total_cases_per_1m_population'],  # Total cases per million population
                    "unit": "cases/million population"
                },
                {
                    "value": row['total_deaths_per_1m_population'],  # Total deaths per million population
                    "unit": "deaths/million population"
                },
                {
                    "value": row['total_tests'],  # Total tests conducted
                    "unit": "tests"
                },
                {
                    "value": row['total_tests_per_1m_population'],  # Total tests per million population
                    "unit": "tests/million population"
                },
                {
                    "value": row['population'],  # Population
                    "unit": "people"
                }
            ]
            
          }
          fhir_data.append(resource)
      return jsonify(fhir_data)

if __name__ == '__main__':
    app.run(debug=True)
