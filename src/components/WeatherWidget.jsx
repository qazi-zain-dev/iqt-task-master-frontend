import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  CloudLightning,
  Wind,
  Droplets,
  Search,
  Lightbulb,
  MapPin,
  X,
  Plus,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { getWeather } from '../services/api';

const PRESET_CITIES = [
  'San Francisco',
  'New York',
  'London',
  'Tokyo',
  'Paris',
  'Lahore',
  'Berlin',
  'Dubai',
];

const WEATHER_ICONS = {
  Sun: { icon: Sun, className: 'text-accent' },
  CloudSun: { icon: CloudSun, className: 'text-accent' },
  Cloud: { icon: Cloud, className: 'text-muted-foreground' },
  CloudRain: { icon: CloudRain, className: 'text-info-soft-foreground' },
  Snowflake: { icon: Snowflake, className: 'text-info-soft-foreground' },
  CloudLightning: { icon: CloudLightning, className: 'text-accent' },
};

export default function WeatherWidget({ onClose, onAddTaskFromWeather }) {
  const [city, setCity] = useState('San Francisco');
  const [searchInput, setSearchInput] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addedCity, setAddedCity] = useState(null);

  const fetchWeatherData = async (targetCity) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeather(targetCity);
      setWeatherData(data);
    } catch {
      setError(`Couldn't load the forecast for ${targetCity}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(city);
  }, [city]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCity(searchInput.trim());
      setSearchInput('');
    }
  };

  const handleAddTask = async () => {
    const cityName = weatherData.location?.city;
    setIsAdding(true);
    const ok = await onAddTaskFromWeather({
      title: `Plan activities for ${cityName} (${weatherData.current?.condition})`,
      description: `Weather advice: ${weatherData.recommendation}. Current temp: ${weatherData.current?.temperature}°C.`,
      category: 'Personal',
      priority: 'medium',
      tags: ['weather-sync', cityName?.toLowerCase()].filter(Boolean),
    });
    setIsAdding(false);
    if (ok) setAddedCity(cityName);
  };

  const { icon: WeatherIcon, className: iconTone } =
    WEATHER_ICONS[weatherData?.current?.icon] || WEATHER_ICONS.CloudSun;
  const isAdded = Boolean(weatherData) && addedCity === weatherData.location?.city;

  return (
    <section aria-labelledby="weather-title" className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-soft-foreground">
            <CloudSun className="size-5" />
          </span>
          <div>
            <h2 id="weather-title" className="text-base font-semibold text-foreground">
              Weather planner
            </h2>
            <p className="text-sm text-muted-foreground">
              Live conditions from Open-Meteo, with a planning tip.
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close weather planner"
            className="icon-btn -mr-2 -mt-1"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col lg:flex-row lg:items-center gap-3">
        <form onSubmit={handleSearch} role="search" className="flex gap-2 lg:w-80 shrink-0">
          <div className="relative flex-1 min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search a city…"
              aria-label="City"
              className="field pl-9"
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Check
          </button>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {PRESET_CITIES.map((c) => {
            const isActive = city.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCity(c)}
                aria-pressed={isActive}
                className={`chip h-8 px-3 transition-colors duration-150 ${
                  isActive
                    ? 'bg-primary-soft text-primary-soft-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4" aria-busy={loading}>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3" aria-label="Loading weather">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg bg-muted/60 p-4 space-y-2.5 min-h-32">
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-7 w-1/3" />
                <div className="skeleton h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg bg-danger-soft p-4 text-sm text-danger-soft-foreground"
          >
            <span className="flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </span>
            <button type="button" onClick={() => fetchWeatherData(city)} className="btn btn-secondary h-9 shrink-0">
              Try again
            </button>
          </div>
        ) : weatherData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-4 rounded-lg bg-muted/60 p-4">
              <WeatherIcon className={`size-10 shrink-0 ${iconTone}`} />
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" />
                  <span className="truncate">
                    <span className="font-medium text-foreground">{weatherData.location?.city}</span>
                    {weatherData.location?.country && `, ${weatherData.location.country}`}
                  </span>
                </p>
                <p className="text-3xl font-bold tabular-nums text-foreground">
                  {weatherData.current?.temperature}°C
                </p>
                <p className="text-sm text-muted-foreground">
                  {weatherData.current?.condition} · Feels like {weatherData.current?.feelsLike}°C
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 md:grid-cols-1 gap-3">
              <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-4">
                <Droplets className="size-5 shrink-0 text-info-soft-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Humidity</dt>
                  <dd className="text-base font-semibold tabular-nums text-foreground">
                    {weatherData.current?.humidity}%
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-4">
                <Wind className="size-5 shrink-0 text-primary" />
                <div>
                  <dt className="text-xs text-muted-foreground">Wind</dt>
                  <dd className="text-base font-semibold tabular-nums text-foreground">
                    {weatherData.current?.windSpeed} km/h
                  </dd>
                </div>
              </div>
            </dl>

            <div className="flex flex-col justify-between gap-3 rounded-lg border border-border p-4">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Lightbulb className="size-4 text-accent" />
                  Planning tip
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {weatherData.recommendation}
                </p>
              </div>

              {onAddTaskFromWeather &&
                (isAdded ? (
                  <span className="chip h-9 self-start px-3 bg-success-soft text-success-soft-foreground">
                    <Check className="size-4" />
                    Added to tasks
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddTask}
                    disabled={isAdding}
                    className="btn btn-secondary h-9 self-start px-3"
                  >
                    {isAdding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                    Add as task
                  </button>
                ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
