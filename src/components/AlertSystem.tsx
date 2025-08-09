// src/components/AlertSystem.tsx
import React, { useState, useEffect } from 'react';
import type { TelemetryData } from '../types/telemetry';
import { formatTime } from '../utils/timeUtils';

interface Alert {
  id: string;
  timestamp: number;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  system: string;
}

interface AlertSystemProps {
  telemetry: TelemetryData | null;
}

const AlertSystem: React.FC<AlertSystemProps> = ({ telemetry }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  useEffect(() => {
    if (!telemetry) return;
    
    // Only check for new alerts if we have new data
    if (telemetry.timestamp <= lastUpdate) return;
    setLastUpdate(telemetry.timestamp);

    const newAlerts: Alert[] = [];

    // Check for engine alerts
    if (telemetry.engine.chamberPressure > telemetry.engine.maxChamberPressure * 0.9) {
      newAlerts.push({
        id: `engine-pressure-${telemetry.timestamp}`,
        timestamp: telemetry.timestamp,
        severity: 'WARNING',
        message: `High chamber pressure: ${telemetry.engine.chamberPressure.toFixed(2)} MPa`,
        system: 'ENGINE'
      });
    }

    if (telemetry.engine.turbineSpeed > telemetry.engine.maxTurbineSpeed * 0.9) {
      newAlerts.push({
        id: `engine-turbine-${telemetry.timestamp}`,
        timestamp: telemetry.timestamp,
        severity: 'WARNING',
        message: `High turbine speed: ${telemetry.engine.turbineSpeed.toFixed(0)} RPM`,
        system: 'ENGINE'
      });
    }

    if (telemetry.engine.fuel < 0.1 * telemetry.engine.initialFuel) {
      newAlerts.push({
        id: `engine-fuel-${telemetry.timestamp}`,
        timestamp: telemetry.timestamp,
        severity: 'CRITICAL',
        message: 'Low fuel: Less than 10% remaining',
        system: 'ENGINE'
      });
    }

    // Check for structural alerts
    if (telemetry.structural.stress > 0.8) {
      newAlerts.push({
        id: `structural-stress-${telemetry.timestamp}`,
        timestamp: telemetry.timestamp,
        severity: 'CRITICAL',
        message: `High structural stress: ${(telemetry.structural.stress * 100).toFixed(0)}%`,
        system: 'STRUCTURAL'
      });
    }

    // Check for trajectory alerts
    if (telemetry.trajectory.deviation > 0.1) {
      newAlerts.push({
        id: `trajectory-deviation-${telemetry.timestamp}`,
        timestamp: telemetry.timestamp,
        severity: 'WARNING',
        message: `Trajectory deviation: ${(telemetry.trajectory.deviation * 100).toFixed(2)}%`,
        system: 'GUIDANCE'
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 50)); // Keep last 50 alerts
    }
  }, [telemetry, lastUpdate]);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <div className="alert-system">
      <h3>Alerts</h3>
      <div className="alert-list">
        {alerts.length === 0 ? (
          <div className="alert alert-info">No active alerts</div>
        ) : (
          alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`alert alert-${alert.severity.toLowerCase()}`}
            >
              <div className="alert-header">
                <span className="alert-system">{alert.system}</span>
                <span className="alert-time">{formatTime(alert.timestamp)}</span>
                <button 
                  className="alert-dismiss"
                  onClick={() => dismissAlert(alert.id)}
                >
                  ×
                </button>
              </div>
              <div className="alert-message">{alert.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertSystem;