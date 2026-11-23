"use client";

import React, { createContext, useContext, useState } from 'react';

interface WeatherContextValue {
  isWeatherOpen: boolean;
  openWeather: () => void;
  closeWeather: () => void;
  toggleWeather: () => void;
}

const WeatherContext = createContext<WeatherContextValue>({
  isWeatherOpen: false,
  openWeather: () => {},
  closeWeather: () => {},
  toggleWeather: () => {},
});

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);

  return (
    <WeatherContext.Provider
      value={{
        isWeatherOpen,
        openWeather: () => setIsWeatherOpen(true),
        closeWeather: () => setIsWeatherOpen(false),
        toggleWeather: () => setIsWeatherOpen(prev => !prev),
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  return context;
}
