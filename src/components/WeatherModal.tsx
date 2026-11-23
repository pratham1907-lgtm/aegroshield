"use client";

import React, { useEffect } from 'react';
import { useWeather } from '@/context/WeatherContext';
import WeatherWidget from '@/components/WeatherWidget';

export default function WeatherModal() {
  const { isWeatherOpen, closeWeather } = useWeather();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isWeatherOpen) {
        closeWeather();
      }
    };
    if (isWeatherOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isWeatherOpen, closeWeather]);

  if (!isWeatherOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Agro-Weather & Spray Advisory Modal"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeWeather();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <WeatherWidget onClose={closeWeather} />
      </div>
    </div>
  );
}
