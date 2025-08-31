// src/components/ControlPanel.tsx
import React, { useState } from 'react';
import type { TelemetryData } from '../types/telemetry';

interface ControlPanelProps {
  telemetry: TelemetryData | null;
  onCommand: (command: RocketCommand) => void;
}

type RocketCommand = 
  | { type: 'ENGINE_START' }
  | { type: 'ENGINE_STOP' }
  | { type: 'THROTTLE_SET'; value: number }
  | { type: 'STAGE_SEPARATE' }
  | { type: 'PAYLOAD_DEPLOY' };

const ControlPanel: React.FC<ControlPanelProps> = ({ telemetry, onCommand }) => {
  const [throttleValue, setThrottleValue] = useState(100);

  const handleEngineStart = () => {
    onCommand({ type: 'ENGINE_START' });
  };

  const handleEngineStop = () => {
    onCommand({ type: 'ENGINE_STOP' });
  };

  const handleThrottleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setThrottleValue(value);
    onCommand({ type: 'THROTTLE_SET', value });
  };

  const handleStageSeparate = () => {
    onCommand({ type: 'STAGE_SEPARATE' });
  };

  const handlePayloadDeploy = () => {
    onCommand({ type: 'PAYLOAD_DEPLOY' });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'nominal': return 'text-green-400 bg-green-400/20';
      case 'degraded': return 'text-yellow-400 bg-yellow-400/20';
      case 'failed': return 'text-red-400 bg-red-400/20';
      case 'running': return 'text-green-400 bg-green-400/20';
      case 'off': return 'text-gray-400 bg-gray-400/20';
      default: return 'text-cyan-400 bg-cyan-400/20';
    }
  };

  const isEngineRunning = telemetry?.engine.status === 'RUNNING';
  const canSeparateStage = telemetry?.staging.readyForSeparation;
  const canDeployPayload = telemetry?.payload.readyForDeployment;

  return (
    <div className="space-y-4">
      {/* Engine Controls */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-4">
        <h2 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center">
          <span className="mr-2">🔥</span>
          ENGINE CONTROLS
        </h2>
        
        <div className="space-y-4">
          {/* Engine Start/Stop Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleEngineStart}
              disabled={isEngineRunning}
              className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
                isEngineRunning
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25 hover:scale-105'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>🚀</span>
                <span>START</span>
              </div>
            </button>
            <button 
              onClick={handleEngineStop}
              disabled={!isEngineRunning}
              className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
                !isEngineRunning
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 hover:scale-105'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>🛑</span>
                <span>STOP</span>
              </div>
            </button>
          </div>
          
          {/* Throttle Control */}
          <div className="bg-slate-800/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-cyan-300">THROTTLE</label>
              <span className="text-lg font-bold text-white">{throttleValue}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={throttleValue}
              onChange={handleThrottleChange}
              disabled={!isEngineRunning}
              className={`w-full h-3 rounded-lg appearance-none cursor-pointer ${
                isEngineRunning 
                  ? 'bg-slate-700 slider-thumb-cyan' 
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
              style={{
                background: isEngineRunning 
                  ? `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${throttleValue}%, #374151 ${throttleValue}%, #374151 100%)`
                  : '#4b5563'
              }}
            />
            <div className="flex justify-between text-xs text-cyan-400 mt-1">
              <span>MIN</span>
              <span>MAX</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Flight Operations */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-4">
        <h2 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center">
          <span className="mr-2">🛰️</span>
          FLIGHT OPS
        </h2>
        
        <div className="space-y-3">
          <button 
            onClick={handleStageSeparate}
            disabled={!canSeparateStage}
            className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
              canSeparateStage
                ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/25 hover:scale-105 animate-pulse'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>🔗</span>
              <span>SEPARATE STAGE</span>
              {canSeparateStage && <span className="animate-bounce">⚡</span>}
            </div>
          </button>
          
          <button 
            onClick={handlePayloadDeploy}
            disabled={!canDeployPayload}
            className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
              canDeployPayload
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25 hover:scale-105 animate-pulse'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>📡</span>
              <span>DEPLOY PAYLOAD</span>
              {canDeployPayload && <span className="animate-bounce">✨</span>}
            </div>
          </button>
        </div>
      </div>
      
      {/* System Status */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-4">
        <h2 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          SYSTEM STATUS
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-cyan-400">ENGINE:</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(telemetry?.engine.status || 'UNKNOWN')}`}>
              {telemetry?.engine.status || 'UNKNOWN'}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-cyan-400">AVIONICS:</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(telemetry?.avionics.status || 'UNKNOWN')}`}>
              {telemetry?.avionics.status || 'UNKNOWN'}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-cyan-400">TELEMETRY:</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(telemetry?.telemetry.status || 'UNKNOWN')}`}>
              {telemetry?.telemetry.status || 'UNKNOWN'}
            </div>
          </div>
          
          {/* Additional System Metrics */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-slate-800/30 rounded-lg p-3">
              <div className="text-xs text-cyan-400 uppercase tracking-wide">CPU Load</div>
              <div className="text-sm font-bold text-white">{((telemetry?.avionics.cpuLoad || 0) * 100).toFixed(1)}%</div>
              <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
                <div 
                  className="h-1 bg-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${(telemetry?.avionics.cpuLoad || 0) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3">
              <div className="text-xs text-cyan-400 uppercase tracking-wide">Memory</div>
              <div className="text-sm font-bold text-white">{((telemetry?.avionics.memoryUsage || 0) * 100).toFixed(1)}%</div>
              <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
                <div 
                  className="h-1 bg-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${(telemetry?.avionics.memoryUsage || 0) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;