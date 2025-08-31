// src/components/TelemetryDashboard.tsx
import React, { useState } from 'react';
import type { TelemetryData } from '../types/telemetry';
import Gauge from './Gauge';
import LineChart from './LineChart';
import ThrustIndicator from './ThrustIndicator';
import AttitudeIndicator from './AttitudeIndicator';

interface TelemetryDashboardProps {
  data: TelemetryData | null;
}

const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'flight' | 'engine' | 'navigation'>('flight');

  if (!data) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-cyan-300 font-semibold">Loading Telemetry Data...</div>
          <div className="text-cyan-500/60 text-sm mt-1">Establishing connection with vehicle</div>
        </div>
      </div>
    );
  }

  const formatValue = (value: number, decimals: number = 2): string => {
    if (Math.abs(value) >= 1e6) {
      return (value / 1e6).toFixed(1) + 'M';
    } else if (Math.abs(value) >= 1e3) {
      return (value / 1e3).toFixed(1) + 'K';
    }
    return value.toFixed(decimals);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'nominal': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      case 'running': return 'text-green-400';
      case 'off': return 'text-gray-400';
      default: return 'text-cyan-400';
    }
  };

  return (
    <div className="space-y-3 md:space-y-4 h-full">
      {/* Quick Stats Panel */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-3 md:p-4">
        <h2 className="text-base md:text-lg font-semibold text-cyan-300 mb-3 md:mb-4 flex items-center">
          <span className="mr-2">📊</span>
          TELEMETRY OVERVIEW
        </h2>
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          <div className="bg-slate-800/50 rounded-lg p-2 md:p-3">
            <div className="text-xs text-cyan-400 uppercase tracking-wide">Altitude</div>
            <div className="text-lg md:text-xl font-bold text-white">{formatValue(data.position.y)} m</div>
            <div className="text-xs text-cyan-300/60">Above Sea Level</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2 md:p-3">
            <div className="text-xs text-cyan-400 uppercase tracking-wide">Velocity</div>
            <div className="text-lg md:text-xl font-bold text-white">{formatValue(data.velocity.total)} m/s</div>
            <div className="text-xs text-cyan-300/60">Ground Speed</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2 md:p-3">
            <div className="text-xs text-cyan-400 uppercase tracking-wide">Acceleration</div>
            <div className="text-lg md:text-xl font-bold text-white">{formatValue(data.acceleration.total, 1)} G</div>
            <div className="text-xs text-cyan-300/60">Current G-Force</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2 md:p-3">
            <div className="text-xs text-cyan-400 uppercase tracking-wide">Mission Time</div>
            <div className="text-lg md:text-xl font-bold text-white">T+{Math.floor(data.timestamp / 60)}:{(data.timestamp % 60).toFixed(0).padStart(2, '0')}</div>
            <div className="text-xs text-cyan-300/60">Elapsed Time</div>
          </div>
        </div>
      </div>

      {/* Tabbed Interface */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 flex-1">
        <div className="flex border-b border-cyan-500/20 overflow-x-auto">
          {['flight', 'engine', 'navigation'].map((tab) => (
            <button
              key={tab}
              className={`px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-semibold uppercase tracking-wide transition-all duration-200 whitespace-nowrap ${
                activeTab === tab
                  ? 'text-cyan-300 border-b-2 border-cyan-400 bg-cyan-400/10'
                  : 'text-cyan-500 hover:text-cyan-300 hover:bg-cyan-400/5'
              }`}
              onClick={() => setActiveTab(tab as 'flight' | 'engine' | 'navigation')}
            >
              {tab === 'flight' && '✈️'} {tab === 'engine' && '🔥'} {tab === 'navigation' && '🧭'} {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
        
        <div className="p-3 md:p-4 h-[calc(100%-50px)] md:h-[calc(100%-60px)] overflow-y-auto">

          {activeTab === 'flight' && (
            <div className="space-y-4 md:space-y-6">
              {/* Primary Flight Gauges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="bg-slate-800/30 rounded-lg p-3 md:p-4">
                  <Gauge 
                    title="Velocity" 
                    value={data.velocity.total} 
                    unit="m/s" 
                    min={0} 
                    max={8000} 
                    warningThreshold={7500} 
                  />
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3 md:p-4">
                  <Gauge 
                    title="Altitude" 
                    value={data.position.y} 
                    unit="m" 
                    min={0} 
                    max={200000} 
                    warningThreshold={180000} 
                  />
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3 md:p-4">
                  <Gauge 
                    title="Acceleration" 
                    value={data.acceleration.total} 
                    unit="G" 
                    min={0} 
                    max={10} 
                    warningThreshold={8} 
                  />
                </div>
              </div>
              
              {/* Attitude and Structural Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-slate-800/30 rounded-lg p-3 md:p-4">
                  <h3 className="text-sm font-semibold text-cyan-300 mb-3">ATTITUDE</h3>
                  <AttitudeIndicator 
                    pitch={data.orientation.pitch}
                    roll={data.orientation.roll}
                    yaw={data.orientation.yaw}
                  />
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3 md:p-4">
                  <h3 className="text-sm font-semibold text-cyan-300 mb-3">STRUCTURAL</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-cyan-400">Stress Level</span>
                        <span className="text-white">{(data.structural.stress * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            data.structural.stress > 0.8 ? 'bg-red-500' : 
                            data.structural.stress > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${data.structural.stress * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-cyan-400">Vibration</span>
                        <span className="text-white">{(data.structural.vibration * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            data.structural.vibration > 0.7 ? 'bg-red-500' : 
                            data.structural.vibration > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${data.structural.vibration * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'engine' && (
            <div className="space-y-4 md:space-y-6">
              {/* Engine Status */}
              <div className="bg-slate-800/30 rounded-lg p-3 md:p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-cyan-300">ENGINE STATUS</h3>
                  <div className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(data.engine.status)} bg-current/20`}>
                    {data.engine.status}
                  </div>
                </div>
                <ThrustIndicator 
                  currentThrust={data.engine.thrust}
                  maxThrust={data.engine.maxThrust}
                  fuel={data.engine.fuel}
                  oxidizer={data.engine.oxidizer}
                />
              </div>
              
              {/* Engine Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="bg-slate-800/30 rounded-lg p-3 md:p-4">
                  <Gauge 
                    title="Chamber Pressure" 
                    value={data.engine.chamberPressure} 
                    unit="MPa" 
                    min={0} 
                    max={20} 
                    warningThreshold={18} 
                  />
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3 md:p-4">
                  <Gauge 
                    title="Turbine Speed" 
                    value={data.engine.turbineSpeed} 
                    unit="RPM" 
                    min={0} 
                    max={50000} 
                    warningThreshold={45000} 
                  />
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3 md:p-4">
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
              
              {/* Propellant Levels */}
              <div className="bg-slate-800/30 rounded-lg p-3 md:p-4">
                <h3 className="text-sm font-semibold text-cyan-300 mb-4">PROPELLANT LEVELS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-cyan-400">Fuel (RP-1)</span>
                      <span className="text-white">{formatValue(data.engine.fuel)} kg</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div 
                        className="h-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
                        style={{ width: `${(data.engine.fuel / data.engine.initialFuel) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-cyan-300/60 mt-1">
                      {((data.engine.fuel / data.engine.initialFuel) * 100).toFixed(1)}% remaining
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-cyan-400">Oxidizer (LOX)</span>
                      <span className="text-white">{formatValue(data.engine.oxidizer)} kg</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div 
                        className="h-3 bg-gradient-to-r from-orange-500 to-red-400 rounded-full transition-all duration-300"
                        style={{ width: `${(data.engine.oxidizer / data.engine.initialOxidizer) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-cyan-300/60 mt-1">
                      {((data.engine.oxidizer / data.engine.initialOxidizer) * 100).toFixed(1)}% remaining
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'navigation' && (
            <div className="space-y-4 md:space-y-6">
              {/* Orbital Parameters */}
              <div className="bg-slate-800/30 rounded-lg p-3 md:p-4">
                <h3 className="text-sm font-semibold text-cyan-300 mb-4">ORBITAL PARAMETERS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-cyan-400 text-xs">Target Apogee:</span>
                      <span className="text-white text-sm font-mono">{formatValue(data.orbitalParameters.targetApogee)} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-400 text-xs">Current Apogee:</span>
                      <span className="text-white text-sm font-mono">{formatValue(data.orbitalParameters.currentApogee)} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-400 text-xs">Perigee:</span>
                      <span className="text-white text-sm font-mono">{formatValue(data.orbitalParameters.perigee)} m</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-cyan-400 text-xs">Inclination:</span>
                      <span className="text-white text-sm font-mono">{data.orbitalParameters.inclination.toFixed(2)}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-400 text-xs">Eccentricity:</span>
                      <span className="text-white text-sm font-mono">{data.orbitalParameters.eccentricity.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-400 text-xs">Trajectory Deviation:</span>
                      <span className={`text-sm font-mono ${
                        data.trajectory.deviation > 0.03 ? 'text-red-400' : 
                        data.trajectory.deviation > 0.01 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {(data.trajectory.deviation * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Position Data */}
              <div className="bg-slate-800/30 rounded-lg p-3 md:p-4">
                <h3 className="text-sm font-semibold text-cyan-300 mb-4">POSITION DATA</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="text-center">
                    <div className="text-xs text-cyan-400 uppercase tracking-wide mb-1">Latitude</div>
                    <div className="text-base md:text-lg font-mono text-white">{data.position.lat.toFixed(6)}°</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-cyan-400 uppercase tracking-wide mb-1">Longitude</div>
                    <div className="text-base md:text-lg font-mono text-white">{data.position.lon.toFixed(6)}°</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-cyan-400 uppercase tracking-wide mb-1">Altitude</div>
                    <div className="text-base md:text-lg font-mono text-white">{formatValue(data.position.y)} m</div>
                  </div>
                </div>
              </div>
              
              {/* Trajectory Chart */}
              <div className="bg-slate-800/30 rounded-lg p-3 md:p-4">
                <h3 className="text-sm font-semibold text-cyan-300 mb-4">TRAJECTORY PROFILE</h3>
                <LineChart 
                  title="Altitude vs Time"
                  data={data.trajectoryHistory.map(p => p.y)}
                  labels={data.trajectoryHistory.map((_, i) => i.toString())}
                  xLabel="Time (s)"
                  yLabel="Altitude (m)"
                  color="#4dabf7"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TelemetryDashboard;