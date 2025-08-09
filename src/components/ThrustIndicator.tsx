// src/components/ThrustIndicator.tsx
import React from 'react';

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
  const thrustPercentage = (currentThrust / maxThrust) * 100;
  const fuelPercentage = (fuel / (fuel + oxidizer)) * 100;
  const oxidizerPercentage = 100 - fuelPercentage;

  return (
    <div className="thrust-indicator">
      <div className="thrust-meter">
        <h4>Thrust: {currentThrust.toFixed(0)} N</h4>
        <div className="meter-bar">
          <div 
            className="meter-fill"
            style={{ width: `${thrustPercentage}%` }}
          />
          <div className="meter-labels">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
      
      <div className="propellant-composition">
        <h4>Propellant Composition</h4>
        <div className="composition-bar">
          <div 
            className="fuel-fill"
            style={{ width: `${fuelPercentage}%` }}
          >
            <span>Fuel: {fuelPercentage.toFixed(1)}%</span>
          </div>
          <div 
            className="oxidizer-fill"
            style={{ width: `${oxidizerPercentage}%` }}
          >
            <span>Oxidizer: {oxidizerPercentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThrustIndicator;