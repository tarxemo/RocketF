// src/components/ThrustIndicator.tsx
import React from 'react';

// Typical LOX/RP-1 mixture ratio (kg oxidizer / kg fuel)
const MIXTURE_RATIO = 2.56;
const OPTIMAL_RATIO = 1 / MIXTURE_RATIO; // Fuel/oxidizer ratio

interface ThrustIndicatorProps {
  currentThrust: number;
  maxThrust: number;
  fuel: number;
  oxidizer: number;
}

const ThrustIndicator: React.FC<ThrustIndicatorProps> = ({
  currentThrust,
  maxThrust,
  fuel,
  oxidizer
}) => {
  // Calculate thrust percentage with bounds checking
  const thrustPercentage = Math.min(100, Math.max(0, (currentThrust / maxThrust) * 100));
  
  // Calculate actual mixture ratio (fuel/oxidizer)
  const currentRatio = oxidizer > 0 ? fuel / oxidizer : 0;
  const ratioDeviation = Math.abs(currentRatio - OPTIMAL_RATIO) / OPTIMAL_RATIO * 100;
  
  // Calculate propellant status
  const oxidizerRequired = fuel * MIXTURE_RATIO;
  const fuelRequired = oxidizer / MIXTURE_RATIO;
  
  // Calculate depletion percentages
  const fuelDepletion = Math.min(100, (1 - (fuel / (fuel + fuelRequired))) * 100);
  const oxidizerDepletion = Math.min(100, (1 - (oxidizer / (oxidizer + oxidizerRequired))) * 100);
  
  // Determine status colors
  const getStatusColor = (value: number) => {
    if (value < 20) return 'text-green-400';
    if (value < 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4">
      {/* Thrust Meter */}
      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-cyan-300">THRUST</h4>
          <span className="text-lg font-mono font-bold">
            {currentThrust.toLocaleString(undefined, {maximumFractionDigits: 0})} N
          </span>
        </div>
        <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
            style={{ width: `${thrustPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-cyan-300/70 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
      
      {/* Propellant Status */}
      <div className="bg-slate-800/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-cyan-300 mb-3">PROPELLANT STATUS</h4>
        
        {/* Mixture Ratio */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-cyan-300">Mixture Ratio (O/F)</span>
            <span className={`font-mono ${ratioDeviation > 20 ? 'text-yellow-400' : 'text-green-400'}`}>
              {currentRatio.toFixed(2)} (Optimal: {OPTIMAL_RATIO.toFixed(2)})
            </span>
          </div>
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className={`h-full ${ratioDeviation > 20 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(100, (currentRatio / (OPTIMAL_RATIO * 2)) * 100)}%` }}
            />
          </div>
          {ratioDeviation > 20 && (
            <div className="text-xs text-yellow-400 mt-1">
              Warning: Suboptimal mixture ratio affecting efficiency
            </div>
          )}
        </div>
        
        {/* Fuel Depletion */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-cyan-300">Fuel</span>
              <span className={getStatusColor(fuelDepletion)}>
                {fuelDepletion.toFixed(1)}% depleted
              </span>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-300"
                style={{ width: `${fuelDepletion}%` }}
              />
            </div>
          </div>
          
          {/* Oxidizer Depletion */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-cyan-300">Oxidizer</span>
              <span className={getStatusColor(oxidizerDepletion)}>
                {oxidizerDepletion.toFixed(1)}% depleted
              </span>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-300"
                style={{ width: `${oxidizerDepletion}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Status Message */}
        {Math.abs(oxidizerDepletion - fuelDepletion) > 15 && (
          <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-500/30 rounded text-xs text-yellow-300">
            ⚠️ Propellant imbalance detected. Adjust mixture ratio for optimal performance.
          </div>
        )}
      </div>
    </div>
  );
};

export default ThrustIndicator;