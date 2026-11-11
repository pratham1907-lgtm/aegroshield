"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  CloudSun,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  RefreshCw,
  Info,
} from 'lucide-react';

interface DistrictOption {
  name: string;
  state: string;
  lat: number;
  lon: number;
}

const DISTRICT_LIST: DistrictOption[] = [
  { name: 'Meerut', state: 'Uttar Pradesh', lat: 28.98, lon: 77.70 },
  { name: 'Ludhiana', state: 'Punjab', lat: 30.90, lon: 75.85 },
  { name: 'Karnal', state: 'Haryana', lat: 29.68, lon: 76.99 },
  { name: 'Nashik', state: 'Maharashtra', lat: 19.99, lon: 73.78 },
  { name: 'Indore', state: 'Madhya Pradesh', lat: 22.71, lon: 75.85 },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.91, lon: 75.78 },
  { name: 'Guntur', state: 'Andhra Pradesh', lat: 16.30, lon: 80.43 },
  { name: 'Patna', state: 'Bihar', lat: 25.59, lon: 85.13 },
  { name: 'Bhatinda', state: 'Punjab', lat: 30.21, lon: 74.94 },
  { name: 'Bareilly', state: 'Uttar Pradesh', lat: 28.36, lon: 79.43 },
];

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
  rainProbabilityToday: number;
  forecast: Array<{
    date: string;
    dayName: string;
    tempMax: number;
    tempMin: number;
    rainProb: number;
  }>;
}

export default function WeatherWidget({ compact = false }: { compact?: boolean }) {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictOption>(DISTRICT_LIST[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingGps, setUsingGps] = useState(false);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError(null);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather API unavailable');
      const data = await res.json();

      const current = data.current || {};
      const daily = data.daily || {};

      const days: WeatherData['forecast'] = [];
      const times = daily.time || [];
      for (let i = 0; i < Math.min(times.length, 3); i++) {
        const d = new Date(times[i]);
        const dayName = i === 0 ? 'Today (आज)' : i === 1 ? 'Tomorrow (कल)' : d.toLocaleDateString('en-IN', { weekday: 'short' });
        days.push({
          date: times[i],
          dayName,
          tempMax: Math.round(daily.temperature_2m_max?.[i] ?? 30),
          tempMin: Math.round(daily.temperature_2m_min?.[i] ?? 20),
          rainProb: Math.round(daily.precipitation_probability_max?.[i] ?? 0),
        });
      }

      setWeather({
        temperature: Math.round(current.temperature_2m ?? 28),
        humidity: Math.round(current.relative_humidity_2m ?? 60),
        windSpeed: Math.round(current.wind_speed_10m ?? 8),
        precipitation: Number(current.precipitation ?? 0),
        weatherCode: Number(current.weather_code ?? 0),
        rainProbabilityToday: days[0]?.rainProb ?? 0,
        forecast: days,
      });
    } catch (err: any) {
      console.warn('[WeatherWidget] Error loading weather:', err);
      setError('Unable to load live weather. Showing standard regional climate.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(selectedDistrict.lat, selectedDistrict.lon);
  }, [selectedDistrict, fetchWeather]);

  // Request GPS Location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setUsingGps(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        const gpsDistrict: DistrictOption = {
          name: 'My Current Farm',
          state: 'GPS Detected',
          lat: latitude,
          lon: longitude,
        };
        setSelectedDistrict(gpsDistrict);
        fetchWeather(latitude, longitude);
      },
      err => {
        console.warn('[WeatherWidget] Geolocation error:', err);
        setUsingGps(false);
        alert('Could not detect GPS location. You can pick your district manually.');
      }
    );
  };

  // Agricultural Spray & Pest Advisory Logic
  const getAgroAdvisory = (w: WeatherData) => {
    if (w.rainProbabilityToday >= 50 || w.precipitation > 0.5) {
      return {
        status: 'warning',
        badge: '⚠️ छिड़काव स्थगित रखें (Do Not Spray)',
        title: 'High Rain Probability (बारिश की संभावना)',
        desc: 'अगले 24 घंटे में बारिश का अनुमान है। कीटनाशक व खाद का छिड़काव धुलने के जोखिम से बचें।',
        bg: '#fef2f2',
        border: '#fecaca',
        color: '#dc2626',
      };
    }
    if (w.windSpeed > 15) {
      return {
        status: 'caution',
        badge: '🌬️ तेज़ हवा का अलर्ट (Wind > 15 km/h)',
        title: 'Chemical Drift Risk',
        desc: 'तेज़ हवा के कारण कीटनाशक का बहाव हो सकता है। छिड़काव शाम को या हवा शांत होने पर करें।',
        bg: '#fffbeb',
        border: '#fde68a',
        color: '#d97706',
      };
    }
    if (w.humidity > 80) {
      return {
        status: 'info',
        badge: '💧 उच्च आर्द्रता (High Humidity > 80%)',
        title: 'Fungal Infection Alert',
        desc: 'अधिक नमी से पत्तियों में फफूंद रोग फैलने की संभावना है। फसल का सघन निरीक्षण रखें।',
        bg: '#eff6ff',
        border: '#bfdbfe',
        color: '#2563eb',
      };
    }
    return {
      status: 'success',
      badge: '✅ छिड़काव व सिंचाई के लिए उत्तम (Ideal Weather)',
      title: 'Optimal Spray Window',
      desc: 'मौसम शांत और साफ है। कीटनाशक, पोटाश स्प्रे और हल्की सिंचाई के लिए उपयुक्त समय है।',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      color: '#15803d',
    };
  };

  const advisory = weather ? getAgroAdvisory(weather) : null;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: compact ? '16px' : '22px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      }}
    >
      {/* Header with District Selector & GPS */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '14px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloudSun size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Agro-Weather & Spray Advisory
            </h3>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              मौसम एवं कृषि छिड़काव परामर्श
            </div>
          </div>
        </div>

        {/* District Selector & Detect GPS Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={selectedDistrict.name}
            onChange={e => {
              const d = DISTRICT_LIST.find(item => item.name === e.target.value);
              if (d) {
                setSelectedDistrict(d);
                setUsingGps(false);
              }
            }}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.84rem',
              backgroundColor: '#f8fafc',
              fontWeight: 600,
              color: '#334155',
              outline: 'none',
            }}
          >
            {DISTRICT_LIST.map(d => (
              <option key={d.name} value={d.name}>
                {d.name} ({d.state})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleDetectLocation}
            title="Auto-detect using GPS"
            className="btn btn-outline btn-xs"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.78rem',
              padding: '6px 10px',
              backgroundColor: usingGps ? '#ecfdf5' : undefined,
              borderColor: usingGps ? '#10b981' : undefined,
            }}
          >
            <MapPin size={13} color={usingGps ? '#059669' : '#64748b'} />
            <span>GPS</span>
          </button>

          <button
            type="button"
            onClick={() => fetchWeather(selectedDistrict.lat, selectedDistrict.lon)}
            title="Refresh weather"
            className="btn btn-outline btn-xs"
            disabled={loading}
            style={{ padding: '6px' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading && !weather ? (
        <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: '#16a34a' }} />
          <div style={{ fontSize: '0.85rem' }}>Loading live agro-meteorological data...</div>
        </div>
      ) : weather ? (
        <div>
          {/* Current Temperature & Vital Parameters */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            {/* Temp */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{ color: '#ea580c' }}>
                <Thermometer size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                  {weather.temperature}°C
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Temperature</div>
              </div>
            </div>

            {/* Humidity */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{ color: '#0284c7' }}>
                <Droplets size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                  {weather.humidity}%
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Humidity (नमी)</div>
              </div>
            </div>

            {/* Wind */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{ color: '#64748b' }}>
                <Wind size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                  {weather.windSpeed} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>km/h</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Wind (हवा)</div>
              </div>
            </div>

            {/* Rain Probability */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{ color: '#2563eb' }}>
                <CloudRain size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                  {weather.rainProbabilityToday}%
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Rain Chance</div>
              </div>
            </div>
          </div>

          {/* Agricultural Spray Advisory Banner */}
          {advisory && (
            <div
              style={{
                backgroundColor: advisory.bg,
                border: `1.5px solid ${advisory.border}`,
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                {advisory.status === 'warning' ? (
                  <AlertTriangle size={18} color={advisory.color} />
                ) : advisory.status === 'success' ? (
                  <CheckCircle2 size={18} color={advisory.color} />
                ) : (
                  <Info size={18} color={advisory.color} />
                )}
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: advisory.color }}>
                  {advisory.badge}
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.45 }}>
                {advisory.desc}
              </div>
            </div>
          )}

          {/* 3-Day Forecast Strip */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {weather.forecast.map(day => (
              <div
                key={day.date}
                style={{
                  flex: 1,
                  minWidth: '95px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '8px 10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
                  {day.dayName}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', margin: '3px 0' }}>
                  {day.tempMax}° / {day.tempMin}°
                </div>
                <div style={{ fontSize: '0.72rem', color: day.rainProb > 40 ? '#dc2626' : '#64748b' }}>
                  🌧️ {day.rainProb}% rain
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
