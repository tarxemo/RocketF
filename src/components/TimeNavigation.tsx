// src/components/TimeNavigation.tsx
import React from 'react';

interface TimeNavigationProps {
  currentTime: number;
  maxTime: number;
  onChange: (time: number) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const TimeNavigation: React.FC<TimeNavigationProps> = ({ currentTime, maxTime, onChange }) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    onChange(time);
  };

  return (
    <div className="time-navigation">
      <div className="time-display">
        <span>{formatTime(currentTime)}</span>
        <span> / </span>
        <span>{formatTime(maxTime)}</span>
      </div>
      <input
        type="range"
        min="0"
        max={maxTime}
        step="0.1"
        value={currentTime}
        onChange={handleSliderChange}
        className="time-slider"
      />
      <div className="time-buttons">
        <button onClick={() => onChange(Math.max(0, currentTime - 10))}>-10s</button>
        <button onClick={() => onChange(Math.max(0, currentTime - 1))}>-1s</button>
        <button onClick={() => onChange(Math.min(maxTime, currentTime + 1))}>+1s</button>
        <button onClick={() => onChange(Math.min(maxTime, currentTime + 10))}>+10s</button>
      </div>
    </div>
  );
};

export default TimeNavigation;