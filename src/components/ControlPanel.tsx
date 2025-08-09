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

  return (
    <div className="control-panel">
      <h2>Rocket Controls</h2>
      
      <div className="control-group">
        <h3>Engine Controls</h3>
        <div className="button-group">
          <button 
            onClick={handleEngineStart}
            disabled={telemetry?.engine.status === 'RUNNING'}
          >
            Start Engine
          </button>
          <button 
            onClick={handleEngineStop}
            disabled={telemetry?.engine.status !== 'RUNNING'}
          >
            Stop Engine
          </button>
        </div>
        
        <div className="throttle-control">
          <label htmlFor="throttle">Throttle: {throttleValue}%</label>
          <input
            id="throttle"
            type="range"
            min="0"
            max="100"
            value={throttleValue}
            onChange={handleThrottleChange}
            disabled={telemetry?.engine.status !== 'RUNNING'}
          />
        </div>
      </div>
      
      <div className="control-group">
        <h3>Flight Operations</h3>
        <div className="button-group">
          <button 
            onClick={handleStageSeparate}
            disabled={!telemetry?.staging.readyForSeparation}
          >
            Separate Stage
          </button>
          <button 
            onClick={handlePayloadDeploy}
            disabled={!telemetry?.payload.readyForDeployment}
          >
            Deploy Payload
          </button>
        </div>
      </div>
      
      <div className="system-status">
        <h3>System Status</h3>
        <div className="status-item">
          <span>Engine:</span>
          <span className={`status-${telemetry?.engine.status.toLowerCase() || 'unknown'}`}>
            {telemetry?.engine.status || 'UNKNOWN'}
          </span>
        </div>
        <div className="status-item">
          <span>Avionics:</span>
          <span className={`status-${telemetry?.avionics.status.toLowerCase() || 'unknown'}`}>
            {telemetry?.avionics.status || 'UNKNOWN'}
          </span>
        </div>
        <div className="status-item">
          <span>Telemetry:</span>
          <span className={`status-${telemetry?.telemetry.status.toLowerCase() || 'unknown'}`}>
            {telemetry?.telemetry.status || 'UNKNOWN'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;