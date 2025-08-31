// src/pages/SimulationPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { RocketSimulation } from '../services/simulation';
import TelemetryDashboard from '../components/TelemetryDashboard';
import ControlPanel from '../components/ControlPanel';
import Rocket3DViewer from '../components/Rocket3DViewer';
import TimeNavigation from '../components/TimeNavigation';
import AlertSystem from '../components/AlertSystem';
import MissionPhaseIndicator from '../components/MissionPhaseIndicator';
import EmergencySystem from '../components/EmergencySystem';
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

  const handleAbort = () => {
    simulationRef.current?.sendCommand('abort');
    setIsSimulating(false);
  };

  const handleEmergencyAction = (action: string) => {
    simulationRef.current?.sendCommand(`emergency:${action}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      {/* Mission Control Header - Optimized for mobile space */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-cyan-500/30 p-2 md:p-4 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-6">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-5 h-5 md:w-8 md:h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs md:text-sm font-bold">🚀</span>
              </div>
              <div>
                <h1 className="text-sm md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  MISSION CONTROL
                </h1>
                <p className="text-xs text-cyan-300/70 hidden sm:block">Falcon Heavy • Demo Mission</p>
              </div>
            </div>
            
            {/* Mission Phase Indicator - Compact on mobile */}
            <div className="hidden md:block">
              <MissionPhaseIndicator phase={telemetry?.missionPhase} />
            </div>
          </div>
          
          {/* Simulation Controls - Compact layout */}
          <div className="flex items-center space-x-1 md:space-x-4">
            <div className="flex items-center space-x-1 md:space-x-2 bg-slate-800/50 rounded-lg p-1 md:p-2">
              <span className="text-xs text-cyan-300 hidden sm:inline">SPEED:</span>
              <select 
                value={simulationSpeed}
                onChange={(e) => handleSpeedChange(Number(e.target.value))}
                className="bg-slate-700 text-cyan-300 text-xs rounded px-1 md:px-2 py-1 border border-cyan-500/30 focus:border-cyan-400 focus:outline-none"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={5}>5x</option>
                <option value={10}>10x</option>
              </select>
            </div>
            
            <button 
              onClick={isSimulating ? handlePauseSimulation : handleStartSimulation}
              className={`px-2 md:px-6 py-1 md:py-2 rounded-lg font-semibold text-xs md:text-sm transition-all duration-300 ${
                isSimulating 
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25' 
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25'
              }`}
            >
              {isSimulating ? '⏸️' : '▶️'} <span className="hidden sm:inline">{isSimulating ? 'PAUSE' : 'START'}</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Mission Phase Indicator - Only show when needed */}
        <div className="md:hidden mt-1 flex justify-center">
          <div className="text-xs text-cyan-300 bg-slate-800/50 rounded px-2 py-1">
            <MissionPhaseIndicator phase={telemetry?.missionPhase} />
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid - Maximized content area */}
      <div className="pb-16 md:pb-32 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-4 p-2 md:p-4 min-h-[calc(100vh-120px)] md:min-h-[calc(100vh-200px)]">
          {/* Left Panel - 3D Visualization */}
          <div className="lg:col-span-5 space-y-2 md:space-y-4 order-2 lg:order-1">
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-2 md:p-4 h-48 md:h-[600px]">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <h2 className="text-sm md:text-lg font-semibold text-cyan-300">VEHICLE VISUALIZATION</h2>
                <div className="flex items-center space-x-1 md:space-x-2">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400">TRACKING</span>
                </div>
              </div>
              <div className="h-[calc(100%-32px)] md:h-[calc(100%-60px)] rounded-lg overflow-hidden">
                <Rocket3DViewer telemetry={telemetry} />
              </div>
            </div>
          </div>
          
          {/* Center Panel - Telemetry Dashboard */}
          <div className="lg:col-span-4 space-y-2 md:space-y-4 order-1 lg:order-2">
            <TelemetryDashboard data={telemetry} />
          </div>
          
          {/* Right Panel - Control Systems */}
          <div className="lg:col-span-3 space-y-2 md:space-y-4 order-3">
            <ControlPanel 
              telemetry={telemetry}
              onCommand={(command) => simulationRef.current?.sendCommand(command)}
            />
            
            {/* Emergency System */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-2 md:p-4">
              <EmergencySystem 
                telemetryData={telemetry}
                onAbort={handleAbort}
                onEmergencyAction={handleEmergencyAction}
                isLaunching={isSimulating}
              />
            </div>
            
            {/* Alert System */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-2 md:p-4">
              <AlertSystem telemetry={telemetry} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Timeline - Compact footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-cyan-500/30 p-1 md:p-4 z-20">
        <TimeNavigation 
          currentTime={telemetry?.timestamp || 0}
          maxTime={telemetry?.maxSimulationTime || 0}
          onChange={handleSetSimulationTime}
        />
      </div>
    </div>
  );
};

export default SimulationPage;