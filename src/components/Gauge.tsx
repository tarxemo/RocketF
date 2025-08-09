// src/components/Gauge.tsx
import React from 'react';

interface GaugeProps {
  title: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  warningThreshold?: number;
}

const Gauge: React.FC<GaugeProps> = ({ title, value, unit, min, max, warningThreshold }) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const isWarning = warningThreshold && value >= warningThreshold;
  
  return (
    <div className={`gauge ${isWarning ? 'warning' : ''}`}>
      <div className="gauge-title">{title}</div>
      <div className="gauge-body">
        <div className="gauge-fill" style={{ width: `${percentage}%` }} />
        <div className="gauge-value">
          {value.toFixed(2)} {unit}
        </div>
      </div>
      <div className="gauge-labels">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default Gauge;