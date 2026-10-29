import os
import re
from typing import Dict, Any, Optional

def estimate_dew_point(temp_c: float, humidity: float) -> float:
    """Magnus formula approximation for dew point temperature."""
    a = 17.27
    b = 237.7
    alpha = ((a * temp_c) / (b + temp_c)) + ((humidity / 100.0) if humidity > 0 else 0.01)
    return round((b * alpha) / (a - alpha), 1)

def generate_forecast_insights(weather_data: Dict[str, Any], is_rain: bool, prob: float) -> Dict[str, Any]:
    """
    Generate structured, rich Generative AI meteorological insights
    based on real weather parameters and machine learning predictions.
    """
    location = weather_data.get('location') or weather_data.get('Location') or "Regional District"
    max_temp = float(weather_data.get('max_temp') or weather_data.get('MaxTemp') or weather_data.get('temperature_celsius') or 28.0)
    min_temp = float(weather_data.get('min_temp') or weather_data.get('MinTemp') or max_temp - 10)
    humidity = float(weather_data.get('humidity') or weather_data.get('Humidity3pm') or weather_data.get('Humidity9am') or 60.0)
    pressure = float(weather_data.get('pressure') or weather_data.get('Pressure3pm') or weather_data.get('Pressure9am') or 1012.0)
    wind_speed = float(weather_data.get('wind_speed') or weather_data.get('WindSpeed3pm') or weather_data.get('WindGustSpeed') or 18.0)
    cloud = float(weather_data.get('cloud') or weather_data.get('Cloud3pm') or 30.0)
    sunshine = float(weather_data.get('sunshine') or weather_data.get('Sunshine') or (9.5 if not is_rain else 2.5))

    dew_point = estimate_dew_point(max_temp, humidity)

    if not is_rain:
        headline = f"Abundant Golden Sunshine Expected Across {location}"

        narrative = (
            f"Generative AI atmospheric analysis indicates a dominant high-pressure ridge ({pressure:.1f} hPa) "
            f"suppressing cloud formation across {location}. With relative humidity resting at a comfortable {humidity:.0f}% "
            f"and daytime highs reaching {max_temp:.1f}°C, solar radiation will peak around mid-afternoon with {sunshine:.1f} hours "
            f"of unobstructed sunshine. Atmospheric stability remains exceptionally high with minimal convective turbulence."
        )

        wardrobe = (
            f"Light, breathable cotton or linen clothing. Carry UV-protection sunglasses (UV index ~{min(11, max(3, int(sunshine * 1.1)))}), "
            f"a sun hat, and apply SPF 30+ broad-spectrum sunscreen if spending extended time outdoors."
        )

        commute = (
            f"Optimal transit conditions. Dry road surfaces, clear sightlines, and zero wet-weather braking hazards. "
            f"Moderate {wind_speed:.0f} km/h breezes will maintain pleasant road travel."
        )

        agriculture = (
            f"Ideal conditions for harvesting, sun-drying grains or pulses, and routine drip irrigation. "
            f"With low moisture and dry air, evaporation will be around {max(3.0, round(sunshine * 0.55, 1))} mm, so maintain soil hydration."
        )

        activities = (
            f"Perfect day for outdoor sports, marathon training, park picnics, photography, and drying laundry outdoors. "
            f"Stay well-hydrated during peak solar hours (11:00 AM - 3:00 PM)."
        )

        vibe = "☀️ Tomorrow's AI Vibe: Golden sunbeams, high energy, and pristine blue skies!"

    else:
        headline = f"Moisture Influx & Rainfall Dynamics Approaching {location}"

        narrative = (
            f"Generative AI atmospheric modeling detects a moist baroclinic trough moving across {location}, "
            f"characterized by elevated relative humidity ({humidity:.0f}%) and atmospheric depression ({pressure:.1f} hPa). "
            f"The estimated dew point is {dew_point:.1f}°C, signaling high condensation potential. "
            f"Our Random Forest ML pipeline projects an estimated {prob:.1f}% probability of precipitation, "
            f"with cloudy skies and intermittent gusty winds up to {wind_speed:.0f} km/h."
        )

        wardrobe = (
            "Waterproof trench coat or hooded rain jacket, water-resistant footwear with slip-resistant treads, "
            "and a sturdy windproof umbrella. Avoid open canvas shoes."
        )

        commute = (
            f"Expect reduced road visibility, localized water pooling, and slick asphalt. Allow an additional 15–20 minutes "
            f"for peak-hour transit and maintain a 3-second safe following distance."
        )

        agriculture = (
            f"Natural precipitation will provide abundant soil replenishment. Suspend scheduled sprinkler irrigation "
            f"and avoid pesticide spraying to prevent chemical wash-off. Inspect drainage ditches for clear flow."
        )

        activities = (
            "Great day for cozy indoor work, hot beverages, museum or library visits, and indoor fitness. "
            "If planning outdoor events, ensure covered tents or indoor backup venues."
        )

        vibe = "🌧️ Tomorrow's AI Vibe: Gentle raindrops, petrichor aroma, and warm indoor comfort!"

    return {
        'headline': headline,
        'narrative': narrative,
        'wardrobe': wardrobe,
        'commute': commute,
        'agriculture': agriculture,
        'activities': activities,
        'vibe': vibe,
        'dew_point': f"{dew_point} °C",
        'estimated_sunshine': f"{sunshine:.1f} hrs",
        'ai_confidence': f"{round(100 - prob if not is_rain else prob, 1)}%"
    }


def answer_weather_query(question: str, weather_data: Dict[str, Any], is_rain: bool, prob: float) -> str:
    """
    Context-aware Generative AI reasoning for user natural language questions.
    """
    q = question.lower().strip()
    loc = weather_data.get('location') or weather_data.get('Location') or "your area"
    max_t = float(weather_data.get('max_temp') or weather_data.get('MaxTemp') or 28.0)
    humid = float(weather_data.get('humidity') or weather_data.get('Humidity3pm') or 60.0)
    wind = float(weather_data.get('wind_speed') or weather_data.get('WindSpeed3pm') or 18.0)

    if any(k in q for k in ['picnic', 'outdoor', 'park', 'bbq', 'barbecue', 'party', 'wedding', 'event']):
        if not is_rain:
            return (
                f"Yes, absolutely! Tomorrow in {loc} is fantastic for a picnic or outdoor event. "
                f"Conditions are sunny with temperatures near {max_t:.0f}°C and mild {wind:.0f} km/h breezes. "
                f"There's only a {prob:.1f}% chance of rain. Just make sure to bring sun protection and cold drinks!"
            )
        else:
            return (
                f"It's risky to plan an open outdoor picnic tomorrow in {loc}. "
                f"Our AI models predict rain ({prob:.1f}% probability) with high humidity ({humid:.0f}%). "
                f"We recommend choosing a covered patio or scheduling an indoor gathering instead."
            )

    if any(k in q for k in ['umbrella', 'raincoat', 'carry', 'bring', 'jacket', 'coat']):
        if not is_rain:
            return (
                f"You will not need an umbrella tomorrow in {loc}! "
                f"The probability of rain is very low ({prob:.1f}%). "
                f"Instead, consider sunglasses and a light jacket for breezy morning hours."
            )
        else:
            return (
                f"Yes, definitely carry a sturdy umbrella and a waterproof jacket! "
                f"Rainfall likelihood is high ({prob:.1f}%) with {humid:.0f}% humidity and winds around {wind:.0f} km/h."
            )

    if any(k in q for k in ['run', 'running', 'jog', 'jogging', 'cycling', 'bike', 'sports', 'cricket', 'football', 'golf']):
        if not is_rain:
            return (
                f"Ideal day for running and sports in {loc}! "
                f"With clear sunny conditions and temperatures reaching {max_t:.0f}°C, "
                f"early morning or late afternoon will provide the most refreshing workout windows. Stay hydrated!"
            )
        else:
            return (
                f"Caution for outdoor sports in {loc}. Rain showers ({prob:.1f}% chance) will make grass and tracks slippery. "
                f"If you cycle or run outside, wear high-visibility waterproof athletic gear or switch to treadmill/indoor training."
            )

    if any(k in q for k in ['laundry', 'clothes', 'drying', 'dry clothes', 'wash']):
        if not is_rain:
            return (
                f"Tomorrow is an excellent day to do laundry and hang clothes outside! "
                f"Direct solar radiation and {wind:.0f} km/h breezes will dry clothes quickly without damp odor."
            )
        else:
            return (
                f"Avoid hanging clothes outside tomorrow in {loc}. "
                f"With {humid:.0f}% atmospheric moisture and expected rain showers, clothes will stay damp. Use an indoor drying rack or dryer."
            )

    if any(k in q for k in ['plant', 'plants', 'garden', 'watering', 'water', 'farm', 'crop', 'agriculture']):
        if not is_rain:
            return (
                f"Yes, make sure to water your garden or sensitive plants tomorrow! "
                f"Because the weather will be sunny and warm ({max_t:.0f}°C), soil moisture will evaporate steadily. "
                f"Water early in the morning before the sun gets too intense."
            )
        else:
            return (
                f"You can skip watering outdoor plants tomorrow! "
                f"Natural rainfall ({prob:.1f}% probability) will hydrate the soil. "
                f"Just verify that potted plants have proper drainage holes so their roots don't get waterlogged."
            )

    if any(k in q for k in ['drive', 'driving', 'commute', 'traffic', 'flight', 'travel', 'road']):
        if not is_rain:
            return (
                f"Travel conditions in {loc} will be smooth and clear. Roads will be dry, "
                f"visibility exceeds 10 km, and flight schedules should encounter zero weather-related holds."
            )
        else:
            return (
                f"Allow 15–20 minutes extra travel time in {loc}. Wet roads and surface spray will slow traffic, "
                f"and localized rain bands may cause brief airport flow restrictions."
            )

    if any(k in q for k in ['hot', 'cold', 'temperature', 'warm', 'night', 'degrees']):
        return (
            f"Tomorrow's temperature in {loc} is forecast to range from a comfortable low of {min_t:.1f}°C "
            f"to a daytime peak of {max_t:.1f}°C. {'Sunshine will make it feel warm and pleasant.' if not is_rain else 'Cloud cover and rain will keep afternoon temperatures feeling cool.'}"
        )

    status_text = "Sunny and clear with dry conditions" if not is_rain else "Rainy with overcast skies and precipitation"
    return (
        f"Based on our Generative AI meteorological analysis for {loc}, tomorrow will be {status_text}. "
        f"Key factors: High temp {max_t:.1f}°C, Humidity {humid:.0f}%, Pressure {weather_data.get('pressure', 1012):.0f} hPa, "
        f"and {prob:.1f}% rain probability. Plan your schedule accordingly and enjoy your day!"
    )