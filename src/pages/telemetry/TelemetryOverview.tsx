import React from 'react';
import { Link } from 'react-router-dom';
import useTelemetry from '../../hooks/useTelemetry';
import Gauge from '../../components/Gauge';
import ThrustIndicator from '../../components/ThrustIndicator';

const TelemetryOverview: React.FC = () => {
  const { data } = useTelemetry();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-pulse text-cyan-400">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Waiting for telemetry data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Mission Overview</h2>
        <p className="text-slate-400">Real-time status of the rocket systems</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Link to="/telemetry/engine" className="block">
          <div className="bg-slate-800/50 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
            <div className="text-sm text-cyan-400 mb-2">Engine Status</div>
            <div className="text-2xl font-mono">
              <span className={data.engine?.status === 'RUNNING' ? 'text-green-400' : 'text-amber-400'}>
                {data.engine?.status || 'N/A'}
              </span>
            </div>
          </div>
        </Link>

        <Link to="/telemetry/trajectory" className="block">
          <div className="bg-slate-800/50 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
            <div className="text-sm text-cyan-400 mb-2">Altitude</div>
            <div className="text-2xl font-mono">
              {(data.position?.y / 1000).toFixed(2)} <span className="text-sm">km</span>
            </div>
          </div>
        </Link>

        <Link to="/telemetry/engine" className="block">
          <div className="bg-slate-800/50 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
            <div className="text-sm text-cyan-400 mb-2">Thrust</div>
            <div className="text-2xl font-mono">
              {(data.engine?.thrust / 1000).toFixed(1)} <span className="text-sm">kN</span>
            </div>
          </div>
        </Link>

        <Link to="/telemetry/systems" className="block">
          <div className="bg-slate-800/50 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
            <div className="text-sm text-cyan-400 mb-2">Speed</div>
            <div className="text-2xl font-mono">
              {(data.velocity?.total / 1000 * 3.6).toFixed(1)} <span className="text-sm">km/h</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trajectory Preview */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Trajectory</h3>
              <Link to="/telemetry/trajectory" className="text-sm text-cyan-400 hover:text-cyan-300">
                View Fullscreen →
              </Link>
            </div>
            <div className="h-64 bg-slate-900/50 rounded-lg flex items-center justify-center text-slate-500">
              [Trajectory visualization will be here]
            </div>
          </div>

          {/* Engine Metrics */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Engine Status</h3>
              <Link to="/telemetry/engine" className="text-sm text-cyan-400 hover:text-cyan-300">
                View Details →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Gauge 
                title="Chamber Pressure" 
                value={data.engine?.chamberPressure || 0} 
                unit="MPa" 
                min={0} 
                max={20} 
                warningThreshold={18} 
              />
              <Gauge 
                title="Turbine Speed" 
                value={data.engine?.turbineSpeed || 0} 
                unit="RPM" 
                min={0} 
                max={50000} 
                warningThreshold={45000} 
              />
              <Gauge 
                title="Fuel Flow" 
                value={data.engine?.fuelFlowRate || 0} 
                unit="kg/s" 
                min={0} 
                max={500} 
                warningThreshold={450} 
              />
              <Gauge 
                title="Temperature" 
                value={data.engine?.temperature || 0} 
                unit="K" 
                min={0} 
                max={4000} 
                warningThreshold={3500} 
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Thrust Indicator */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">Thrust</h3>
            <ThrustIndicator 
              currentThrust={data.engine?.thrust || 0}
              maxThrust={data.engine?.maxThrust || 1}
              fuel={data.engine?.fuel || 0}
              oxidizer={data.engine?.oxidizer || 0}
            />
          </div>

          {/* Propellant Levels */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">Propellant</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-cyan-400">Fuel (RP-1)</span>
                  <span className="text-white">{data.engine?.fuel?.toFixed(1) || '0.0'} kg</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div 
                    className="h-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    style={{ 
                      width: `${data.engine && data.engine.initialFuel > 0 ? 
                        (data.engine.fuel / data.engine.initialFuel) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-cyan-400">Oxidizer (LOX)</span>
                  <span className="text-white">{data.engine?.oxidizer?.toFixed(1) || '0.0'} kg</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div 
                    className="h-2 bg-gradient-to-r from-orange-500 to-red-400 rounded-full"
                    style={{ 
                      width: `${data.engine && data.engine.initialOxidizer > 0 ? 
                        (data.engine.oxidizer / data.engine.initialOxidizer) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                Emergency Stop
              </button>
              <button className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                Abort Mission
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelemetryOverview;
