// src/components/TelemetryDashboard.tsx
import React, { useState } from 'react';
import type { TelemetryData } from '../types/telemetry';
import  Gauge  from './Gauge';
import  LineChart  from './LineChart';
import  ThrustIndicator  from './ThrustIndicator';
import  AttitudeIndicator  from './AttitudeIndicator';

interface TelemetryDashboardProps {
  data: TelemetryData | null;
}

const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'flight' | 'engine' | 'navigation'>('flight');

  if (!data) {
    return <div className="telemetry-dashboard loading">Loading telemetry data...</div>;
  }

  return (
    <div className="telemetry-dashboard">
      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'flight' ? 'active' : ''}
          onClick={() => setActiveTab('flight')}
        >
          Flight Data
        </button>
        <button 
          className={activeTab === 'engine' ? 'active' : ''}
          onClick={() => setActiveTab('engine')}
        >
          Engine Data
        </button>
        <button 
          className={activeTab === 'navigation' ? 'active' : ''}
          onClick={() => setActiveTab('navigation')}
        >
          Navigation
        </button>
      </div>

      {activeTab === 'flight' && (
        <div className="flight-data">
          <div className="gauge-row">
            <Gauge 
              title="Velocity" 
              value={data.velocity.total} 
              unit="m/s" 
              min={0} 
              max={8000} 
              warningThreshold={7500} 
            />
            <Gauge 
              title="Altitude" 
              value={data.position.y} 
              unit="m" 
              min={0} 
              max={200000} 
              warningThreshold={180000} 
            />
            <Gauge 
              title="Acceleration" 
              value={data.acceleration.total} 
              unit="G" 
              min={0} 
              max={10} 
              warningThreshold={8} 
            />
          </div>
          
          <div className="attitude-indicator">
            <AttitudeIndicator 
              pitch={data.orientation.pitch}
              roll={data.orientation.roll}
              yaw={data.orientation.yaw}
            />
          </div>
        </div>
      )}

      {activeTab === 'engine' && (
        <div className="engine-data">
          <div className="thrust-indicator">
            <ThrustIndicator 
              currentThrust={data.engine.thrust}
              maxThrust={data.engine.maxThrust}
              fuel={data.engine.fuel}
              oxidizer={data.engine.oxidizer}
            />
          </div>
          
          <div className="engine-metrics">
            <Gauge 
              title="Chamber Pressure" 
              value={data.engine.chamberPressure} 
              unit="MPa" 
              min={0} 
              max={20} 
              warningThreshold={18} 
            />
            <Gauge 
              title="Turbine Speed" 
              value={data.engine.turbineSpeed} 
              unit="RPM" 
              min={0} 
              max={50000} 
              warningThreshold={45000} 
            />
            <Gauge 
              title="Fuel Flow" 
              value={data.engine.fuelFlowRate} 
              unit="kg/s" 
              min={0} 
              max={500} 
              warningThreshold={450} 
            />
          </div>
        </div>
      )}

      {activeTab === 'navigation' && (
        <div className="navigation-data">
          <div className="trajectory-chart">
            <LineChart 
              title="Trajectory Profile"
              data={data.trajectoryHistory.map(p => p.y)}
              labels={data.trajectoryHistory.map((_, i) => i.toString())}
              xLabel="Time"
              yLabel="Altitude (m)"
              color="#4dabf7"
            />
          </div>
          
          <div className="position-data">
            <div className="coordinate">
              <span>Latitude:</span>
              <span>{data.position.lat.toFixed(6)}°</span>
            </div>
            <div className="coordinate">
              <span>Longitude:</span>
              <span>{data.position.lon.toFixed(6)}°</span>
            </div>
            <div className="coordinate">
              <span>Altitude:</span>
              <span>{data.position.y.toFixed(2)} m</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelemetryDashboard;