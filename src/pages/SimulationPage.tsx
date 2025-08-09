// src/pages/SimulationPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import  Rocket3DViewer  from '../components/Rocket3DViewer';
import  TelemetryDashboard  from '../components/TelemetryDashboard';
import  ControlPanel  from '../components/ControlPanel';
import  TimeNavigation  from '../components/TimeNavigation';
import  AlertSystem  from '../components/AlertSystem';
import { RocketSimulation } from '../services/simulation';
import type { TelemetryData } from '../types/telemetry';

const SimulationPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const simulationRef = useRef<RocketSimulation | null>(null);

  useEffect(() => {
    // Initialize simulation
    simulationRef.current = new RocketSimulation({
      onTelemetryUpdate: (data) => setTelemetry(data),
      onError: (error) => console.error('Simulation error:', error)
    });

    return () => {
      simulationRef.current?.cleanup();
    };
  }, []);

  const handleStartSimulation = () => {
    simulationRef.current?.start();
    setIsSimulating(true);
  };

  const handlePauseSimulation = () => {
    simulationRef.current?.pause();
    setIsSimulating(false);
  };

  const handleSetSimulationTime = (time: number) => {
    simulationRef.current?.setTime(time);
  };

  const handleSpeedChange = (speed: number) => {
    setSimulationSpeed(speed);
    simulationRef.current?.setSpeed(speed);
  };

  return (
    <div className="simulation-container">
      <div className="simulation-header">
        <h1>Rocket Mission Control Dashboard</h1>
        <div className="simulation-controls">
          <button onClick={isSimulating ? handlePauseSimulation : handleStartSimulation}>
            {isSimulating ? 'Pause' : 'Start'}
          </button>
          <select 
            value={simulationSpeed}
            onChange={(e) => handleSpeedChange(Number(e.target.value))}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={5}>5x</option>
            <option value={10}>10x</option>
          </select>
        </div>
      </div>

      <div className="simulation-content">
        <div className="visualization-panel">
          <Rocket3DViewer telemetry={telemetry} />
        </div>
        
        <div className="telemetry-panel">
          <TelemetryDashboard data={telemetry} />
        </div>
        
        <div className="control-panel">
          <ControlPanel 
            telemetry={telemetry}
            onCommand={(command) => simulationRef.current?.sendCommand(command)}
          />
        </div>
      </div>

      <div className="simulation-footer">
        <TimeNavigation 
          currentTime={telemetry?.timestamp || 0}
          maxTime={telemetry?.maxSimulationTime || 0}
          onChange={handleSetSimulationTime}
        />
        <AlertSystem telemetry={telemetry} />
      </div>
    </div>
  );
};

export default SimulationPage;