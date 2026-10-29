# Weather Datasets

This directory contains weather datasets used for rainfall prediction.

## Included Datasets:

1. `weather_data.csv` (and `Weather data.xlsx` in root):
   - Features: `temperature_celsius`, `temperature_fahrenheit`, `wind_mph`, `wind_kph`, `wind_degree`, `wind_direction`, `pressure_mb`, `pressure_in`, `humidity`, `cloud`, `feels_like_celsius`, `visibility_km`, `uv_index`, `gust_kph`, etc.
   - Target options: 
     - `precip_mm`: Rainfall in millimeters (Regression) or Rain (>0) vs No Rain (=0) (Classification)
   - Size: 24,070 records with 20 weather measurements.

## Supported CSV Dataset Formats:
Any weather dataset containing meteorological indicators such as:
- Temperatures (Min, Max, Mean)
- Humidity & Dew Point
- Atmospheric Pressure
- Wind Speed, Gust, and Direction
- Cloud Cover & Sunshine
- Rainfall / Precipitation columns (`RainTomorrow`, `RainToday`, `Rainfall`, `precip_mm`, `precipitation`)
