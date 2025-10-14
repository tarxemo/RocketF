import { useOutletContext } from 'react-router-dom';
import useTelemetry from '../../hooks/useTelemetry';

// Define the engine data type
interface EngineData {
  status: 'RUNNING' | 'STOPPED' | 'STARTING' | 'ERROR';
  thrust: number;
  maxThrust: number;
  temperature: number;
  chamberPressure: number;
  maxChamberPressure: number;
  turbineSpeed: number;
  maxTurbineSpeed: number;
  fuel: number;
  oxidizer: number;
  initialFuel: number;
  initialOxidizer: number;
  fuelFlowRate: number;
  throttle: number;
}

const EnginePage = () => {
  const { data } = useTelemetry();
  const { isEngineRunning } = useOutletContext<{ isEngineRunning: boolean }>();
  const engine = data?.engine as EngineData | undefined;

  if (!engine) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-pulse text-cyan-400">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Waiting for engine telemetry...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isEngineRunning) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6 bg-slate-800/50 rounded-xl">
          <div className="text-red-400 text-lg font-semibold mb-2">Engine Offline</div>
          <p className="text-slate-300">Start the engine to view telemetry data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Engine Telemetry</h2>
        <p className="text-slate-400">Real-time engine performance and diagnostics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Engine Display */}
        <div className="lg:col-span-2 bg-slate-800/50 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold">Main Engine</h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                engine.status === 'RUNNING' ? 'bg-green-500/20 text-green-400' :
                engine.status === 'STARTING' ? 'bg-amber-500/20 text-amber-400' :
                'bg-slate-700/50 text-slate-400'
              }`}>
                {engine.status}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono">
                {(engine.thrust / 1000).toFixed(1)} <span className="text-sm text-slate-400">kN</span>
              </div>
              <div className="text-sm text-slate-400">Current Thrust</div>
            </div>
          </div>

          {/* Engine Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/70 rounded-lg p-4">
              <div className="text-sm text-cyan-400 mb-2">Chamber Pressure</div>
              <div className="text-2xl font-mono">
                {engine.chamberPressure?.toFixed(2)} <span className="text-sm text-slate-400">MPa</span>
              </div>
              <div className="h-1 bg-slate-700/50 rounded-full mt-2">
                <div 
                  className="h-1 bg-red-500 rounded-full"
                  style={{ width: `${Math.min(100, (engine.chamberPressure / (engine.maxChamberPressure || 20)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-800/70 rounded-lg p-4">
              <div className="text-sm text-cyan-400 mb-2">Turbine Speed</div>
              <div className="text-2xl font-mono">
                {(engine.turbineSpeed / 1000).toFixed(1)} <span className="text-sm text-slate-400">kRPM</span>
              </div>
              <div className="h-1 bg-slate-700/50 rounded-full mt-2">
                <div 
                  className="h-1 bg-violet-500 rounded-full"
                  style={{ width: `${Math.min(100, (engine.turbineSpeed / (engine.maxTurbineSpeed || 50000)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-800/70 rounded-lg p-4">
              <div className="text-sm text-cyan-400 mb-2">Temperature</div>
              <div className="text-2xl font-mono">
                {Math.round(engine.temperature)} <span className="text-sm text-slate-400">K</span>
              </div>
              <div className="h-1 bg-slate-700/50 rounded-full mt-2">
                <div 
                  className="h-1 bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, (engine.temperature / 4000) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Thrust Control */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">Thrust Control</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Throttle</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={(engine.thrust / engine.maxThrust) * 100} 
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  disabled={engine.status !== 'RUNNING'}
                  readOnly
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              <div className="pt-2">
                <button 
                  className={`w-full py-2 rounded-lg font-medium ${
                    engine.status === 'RUNNING' 
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                      : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                  } transition-colors`}
                  disabled={!isEngineRunning}
                >
                  {engine.status === 'RUNNING' ? 'SHUT DOWN' : 'START ENGINE'}
                </button>
              </div>
            </div>
          </div>

          {/* Propellant Levels */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">Propellant Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-cyan-400">Fuel (RP-1)</span>
                  <span className="text-white">{engine.fuel.toFixed(1)} kg</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div 
                    className="h-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    style={{ width: `${(engine.fuel / engine.initialFuel) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {((engine.fuel / engine.initialFuel) * 100).toFixed(1)}% remaining
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-cyan-400">Oxidizer (LOX)</span>
                  <span className="text-white">{engine.oxidizer.toFixed(1)} kg</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div 
                    className="h-2 bg-gradient-to-r from-orange-500 to-red-400 rounded-full"
                    style={{ width: `${(engine.oxidizer / engine.initialOxidizer) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {((engine.oxidizer / engine.initialOxidizer) * 100).toFixed(1)}% remaining
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Burn Time Remaining</span>
                  <span className="font-mono">
                    {engine.fuelFlowRate > 0 
                      ? `${Math.floor(engine.fuel / engine.fuelFlowRate / 60)}:${Math.floor((engine.fuel / engine.fuelFlowRate) % 60).toString().padStart(2, '0')}`
                      : '--:--'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnginePage;
