// Open-Meteo API - gratis, geen API key nodig
// Ibiza coördinaten: 38.9067, 1.4206

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
  uvIndex: number;
  precipitationProbability: number;
  sunrise: string;
  sunset: string;
}

const WEATHER_DESCRIPTIONS: Record<number, { en: string; es: string; nl: string }> = {
  0: { en: 'clear sky', es: 'cielo despejado', nl: 'onbewolkt' },
  1: { en: 'mainly clear', es: 'mayormente despejado', nl: 'overwegend helder' },
  2: { en: 'partly cloudy', es: 'parcialmente nublado', nl: 'gedeeltelijk bewolkt' },
  3: { en: 'overcast', es: 'nublado', nl: 'bewolkt' },
  45: { en: 'foggy', es: 'niebla', nl: 'mistig' },
  48: { en: 'foggy', es: 'niebla', nl: 'mistig' },
  51: { en: 'light drizzle', es: 'llovizna ligera', nl: 'lichte motregen' },
  53: { en: 'moderate drizzle', es: 'llovizna moderada', nl: 'motregen' },
  55: { en: 'dense drizzle', es: 'llovizna intensa', nl: 'zware motregen' },
  61: { en: 'slight rain', es: 'lluvia ligera', nl: 'lichte regen' },
  63: { en: 'moderate rain', es: 'lluvia moderada', nl: 'matige regen' },
  65: { en: 'heavy rain', es: 'lluvia intensa', nl: 'zware regen' },
  80: { en: 'rain showers', es: 'chubascos', nl: 'regenbuien' },
  81: { en: 'moderate showers', es: 'chubascos moderados', nl: 'matige buien' },
  82: { en: 'heavy showers', es: 'chubascos fuertes', nl: 'zware buien' },
  95: { en: 'thunderstorm', es: 'tormenta', nl: 'onweer' },
};

function getWeatherDescription(code: number, lang: 'en' | 'es' | 'nl'): string {
  const desc = WEATHER_DESCRIPTIONS[code];
  if (desc) return desc[lang];
  // Fallback
  const fallbacks: Record<string, string> = { en: 'variable conditions', es: 'condiciones variables', nl: 'wisselend weer' };
  return fallbacks[lang];
}

function getWindDirection(degrees: number): { en: string; es: string; nl: string } {
  const dirs = [
    { en: 'north', es: 'norte', nl: 'noord' },
    { en: 'northeast', es: 'noreste', nl: 'noordoost' },
    { en: 'east', es: 'este', nl: 'oost' },
    { en: 'southeast', es: 'sureste', nl: 'zuidoost' },
    { en: 'south', es: 'sur', nl: 'zuid' },
    { en: 'southwest', es: 'suroeste', nl: 'zuidwest' },
    { en: 'west', es: 'oeste', nl: 'west' },
    { en: 'northwest', es: 'noroeste', nl: 'noordwest' },
  ];
  const idx = Math.round(degrees / 45) % 8;
  return dirs[idx];
}

export async function fetchIbizaWeather(): Promise<WeatherData | null> {
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=38.9067&longitude=1.4206&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max,sunrise,sunset&timezone=Europe/Madrid&forecast_days=1';

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();

    return {
      temperature: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      windDirection: data.current.wind_direction_10m,
      weatherCode: data.current.weather_code,
      maxTemp: Math.round(data.daily.temperature_2m_max[0]),
      minTemp: Math.round(data.daily.temperature_2m_min[0]),
      uvIndex: Math.round(data.daily.uv_index_max[0]),
      precipitationProbability: data.daily.precipitation_probability_max[0],
      sunrise: data.daily.sunrise[0].split('T')[1],
      sunset: data.daily.sunset[0].split('T')[1],
    };
  } catch (error) {
    console.error('[Weather] Failed to fetch:', error instanceof Error ? error.message : error);
    return null;
  }
}

export function formatWeatherBulletin(weather: WeatherData, lang: 'en' | 'es' | 'nl'): string {
  const desc = getWeatherDescription(weather.weatherCode, lang);
  const windDir = getWindDirection(weather.windDirection);
  const seaTemp = Math.round(weather.temperature - 3); // rough estimate

  if (lang === 'nl') {
    return `Het weer op Ibiza: ${desc} met een temperatuur van ${weather.temperature} graden, voelt als ${weather.feelsLike} graden. Vandaag wordt het maximaal ${weather.maxTemp} en minimaal ${weather.minTemp} graden. De wind waait uit het ${windDir.nl} met ${weather.windSpeed} kilometer per uur. ${weather.precipitationProbability > 30 ? `Kans op regen: ${weather.precipitationProbability} procent. ` : ''}UV-index: ${weather.uvIndex}. Zonsopkomst om ${weather.sunrise}, zonsondergang om ${weather.sunset}.`;
  }

  if (lang === 'es') {
    return `El tiempo en Ibiza: ${desc} con una temperatura de ${weather.temperature} grados, sensación térmica de ${weather.feelsLike} grados. Hoy la máxima será de ${weather.maxTemp} y la mínima de ${weather.minTemp} grados. Viento del ${windDir.es} a ${weather.windSpeed} kilómetros por hora. ${weather.precipitationProbability > 30 ? `Probabilidad de lluvia: ${weather.precipitationProbability} por ciento. ` : ''}Índice UV: ${weather.uvIndex}. Amanecer a las ${weather.sunrise}, atardecer a las ${weather.sunset}.`;
  }

  // English
  return `Weather in Ibiza: ${desc} with a temperature of ${weather.temperature} degrees, feels like ${weather.feelsLike}. Today's high will be ${weather.maxTemp} and low ${weather.minTemp} degrees. Wind from the ${windDir.en} at ${weather.windSpeed} kilometers per hour. ${weather.precipitationProbability > 30 ? `Chance of rain: ${weather.precipitationProbability} percent. ` : ''}UV index: ${weather.uvIndex}. Sunrise at ${weather.sunrise}, sunset at ${weather.sunset}.`;
}
