import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import useTelemetry from '../../hooks/useTelemetry';
import type { TelemetryData } from '../../types/telemetry';
import Rocket3DViewer from '../../components/Rocket3DViewer';

const TrajectoryPage = () => {
  const { isEngineRunning } = useOutletContext<{ isEngineRunning: boolean }>();
  const { data } = useTelemetry();
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);

  // Update telemetry data when data changes
  useEffect(() => {
    if (data) {
      setTelemetry(data);
    }
  }, [data]);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">3D Trajectory & Navigation</h2>
        <p className="text-slate-400">Interactive 3D visualization of rocket trajectory and orientation</p>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
          {/* Left Column - Data Panels */}
          <div className="space-y-6">
            {/* Position Data */}
            <div className="bg-slate-800/50 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4">Position</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Latitude</span>
                  <span className="font-mono">{data?.position?.lat?.toFixed(6) || '0.000000'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Longitude</span>
                  <span className="font-mono">{data?.position?.lng?.toFixed(6) || '0.000000'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Altitude</span>
                  <span className="font-mono">{((data?.position?.alt || 0) / 1000).toFixed(2)} km</span>
                </div>
              </div>
            </div>

            {/* Velocity Data */}
            <div className="bg-slate-800/50 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4">Velocity</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Horizontal</span>
                  <span className="font-mono">{((data?.velocity?.horizontal || 0) * 3.6).toFixed(1)} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vertical</span>
                  <span className="font-mono">{((data?.velocity?.vertical || 0) * 3.6).toFixed(1)} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total</span>
                  <span className="font-mono">{((data?.velocity?.total || 0) * 3.6).toFixed(1)} km/h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - 3D View */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 rounded-xl overflow-hidden h-full flex flex-col">
              {/* 3D Viewer */}
              <div className="flex-1 min-h-[500px] w-full relative">
                <Rocket3DViewer telemetry={telemetry} isEngineRunning={isEngineRunning} />
                {!isEngineRunning && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center p-4 bg-slate-800/90 rounded-lg">
                      <div className="text-red-400 text-lg font-semibold mb-2">Engine Offline</div>
                      <p className="text-slate-300 text-sm">Start the engine to enable 3D visualization</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Camera Controls */}
              <div className="bg-slate-800/70 p-3 border-t border-slate-700/50">
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                  {['external', 'onboard', 'engine', 'payload', 'separation', 'orbital'].map((view) => (
                    <button
                      key={view}
                      onClick={() => {}}
                      className="px-3 py-1.5 text-sm rounded-md bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 whitespace-nowrap"
                    >
                      {view.charAt(0).toUpperCase() + view.slice(1)} View
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Trajectory Controls */}
            <div className="mt-6 bg-slate-800/50 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4">Trajectory Controls</h3>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <button className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                    Auto-Correct
                  </button>
                  <button className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                    Hold Position
                  </button>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-400">Throttle</span>
                    <span className="text-sm font-mono">75%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    defaultValue="75"
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrajectoryPage;
