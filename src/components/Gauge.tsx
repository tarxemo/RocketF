// src/components/Gauge.tsx
import React from 'react';

interface GaugeProps {
  title: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  warningThreshold?: number;
  criticalThreshold?: number;
}

const Gauge: React.FC<GaugeProps> = ({ 
  title, 
  value, 
  unit, 
  min, 
  max, 
  warningThreshold,
  criticalThreshold
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  
  // Determine gauge color based on thresholds
  let gaugeColor = 'bg-blue-500';
  if (criticalThreshold && value >= criticalThreshold) {
    gaugeColor = 'bg-red-500';
  } else if (warningThreshold && value >= warningThreshold) {
    gaugeColor = 'bg-amber-500';
  }
  
  return (
    <div className="bg-slate-800/50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        <span className="text-sm font-mono text-white">
          {value.toFixed(1)} <span className="text-slate-500">{unit}</span>
        </span>
      </div>
      
      {/* Gauge bar */}
      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden mb-1">
        <div 
          className={`h-full rounded-full ${gaugeColor} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-slate-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
      
      {/* Warning/Critical indicators */}
      {warningThreshold !== undefined && (
        <div className="mt-1">
          {criticalThreshold !== undefined && value >= criticalThreshold ? (
            <div className="text-xs text-red-400">
              <svg className="inline-block w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Critical
            </div>
          ) : value >= warningThreshold ? (
            <div className="text-xs text-amber-400">
              <svg className="inline-block w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Warning
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Gauge;