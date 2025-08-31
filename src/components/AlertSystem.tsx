// src/components/AlertSystem.tsx
import React, { useState, useEffect } from 'react';
import type { TelemetryData } from '../types/telemetry';

interface AlertSystemProps {
  telemetry: TelemetryData | null;
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'caution' | 'info';
  message: string;
  timestamp: number;
  acknowledged: boolean;
  category: 'engine' | 'flight' | 'navigation' | 'system' | 'mission';
}

const AlertSystem: React.FC<AlertSystemProps> = ({ telemetry }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  useEffect(() => {
    if (!telemetry) return;

    const newAlerts: Alert[] = [];
    const currentTime = Date.now();

    // Critical Alerts
    if (telemetry.acceleration.total > 8) {
      newAlerts.push({
        id: 'critical-gforce',
        type: 'critical',
        message: 'CRITICAL: Excessive G-force detected - Vehicle stress limit exceeded',
        timestamp: currentTime,
        acknowledged: false,
        category: 'flight'
      });
    }

    if (telemetry.engine.chamberPressure > 18) {
      newAlerts.push({
        id: 'critical-pressure',
        type: 'critical',
        message: 'CRITICAL: Engine chamber pressure at dangerous levels',
        timestamp: currentTime,
        acknowledged: false,
        category: 'engine'
      });
    }

    if (telemetry.structural.stress > 0.9) {
      newAlerts.push({
        id: 'critical-stress',
        type: 'critical',
        message: 'CRITICAL: Structural stress approaching failure threshold',
        timestamp: currentTime,
        acknowledged: false,
        category: 'flight'
      });
    }

    // Warning Alerts
    if (telemetry.velocity.total > 7500) {
      newAlerts.push({
        id: 'warning-velocity',
        type: 'warning',
        message: 'WARNING: High velocity - Approaching design limits',
        timestamp: currentTime,
        acknowledged: false,
        category: 'flight'
      });
    }

    if (telemetry.position.y > 180000) {
      newAlerts.push({
        id: 'warning-altitude',
        type: 'warning',
        message: 'WARNING: Approaching maximum operational altitude',
        timestamp: currentTime,
        acknowledged: false,
        category: 'navigation'
      });
    }

    if (telemetry.engine.fuel < telemetry.engine.initialFuel * 0.15) {
      newAlerts.push({
        id: 'warning-fuel',
        type: 'warning',
        message: 'WARNING: Low fuel reserves - Mission parameters may be affected',
        timestamp: currentTime,
        acknowledged: false,
        category: 'engine'
      });
    }

    if (telemetry.trajectory.deviation > 0.03) {
      newAlerts.push({
        id: 'warning-trajectory',
        type: 'warning',
        message: 'WARNING: Trajectory deviation exceeds nominal parameters',
        timestamp: currentTime,
        acknowledged: false,
        category: 'navigation'
      });
    }

    // Caution Alerts
    if (telemetry.structural.vibration > 0.7) {
      newAlerts.push({
        id: 'caution-vibration',
        type: 'caution',
        message: 'CAUTION: Elevated vibration levels detected',
        timestamp: currentTime,
        acknowledged: false,
        category: 'flight'
      });
    }

    if (telemetry.avionics.cpuLoad > 0.8) {
      newAlerts.push({
        id: 'caution-cpu',
        type: 'caution',
        message: 'CAUTION: High avionics CPU load',
        timestamp: currentTime,
        acknowledged: false,
        category: 'system'
      });
    }

    // System Status Alerts
    if (telemetry.avionics.status === 'DEGRADED') {
      newAlerts.push({
        id: 'system-avionics-degraded',
        type: 'warning',
        message: 'WARNING: Avionics system operating in degraded mode',
        timestamp: currentTime,
        acknowledged: false,
        category: 'system'
      });
    }

    if (telemetry.avionics.status === 'FAILED') {
      newAlerts.push({
        id: 'critical-avionics-failed',
        type: 'critical',
        message: 'CRITICAL: Avionics system failure - Backup systems engaged',
        timestamp: currentTime,
        acknowledged: false,
        category: 'system'
      });
    }

    if (telemetry.telemetry.status === 'DEGRADED') {
      newAlerts.push({
        id: 'caution-telemetry',
        type: 'caution',
        message: 'CAUTION: Telemetry link degraded - Data may be intermittent',
        timestamp: currentTime,
        acknowledged: false,
        category: 'system'
      });
    }

    // Mission Phase Alerts
    if (telemetry.staging.readyForSeparation) {
      newAlerts.push({
        id: 'info-stage-ready',
        type: 'info',
        message: 'INFO: Stage separation sequence ready for execution',
        timestamp: currentTime,
        acknowledged: false,
        category: 'mission'
      });
    }

    if (telemetry.payload.readyForDeployment) {
      newAlerts.push({
        id: 'info-payload-ready',
        type: 'info',
        message: 'INFO: Payload deployment sequence ready for execution',
        timestamp: currentTime,
        acknowledged: false,
        category: 'mission'
      });
    }

    // Only check for new alerts if we have new data
    if (telemetry.timestamp <= lastUpdate) return;
    setLastUpdate(telemetry.timestamp);

    // Update alerts, avoiding duplicates
    setAlerts(prevAlerts => {
      const existingIds = prevAlerts.map(alert => alert.id);
      const filteredNewAlerts = newAlerts.filter(alert => !existingIds.includes(alert.id));
      return [...prevAlerts, ...filteredNewAlerts].slice(-20); // Keep only last 20 alerts
    });
  }, [telemetry, lastUpdate]);

  const acknowledgeAlert = (id: string) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === id ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'caution': return '🔶';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getAlertColors = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-500/10 text-red-400';
      case 'warning': return 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
      case 'caution': return 'border-orange-500 bg-orange-500/10 text-orange-400';
      case 'info': return 'border-blue-500 bg-blue-500/10 text-blue-400';
      default: return 'border-cyan-500 bg-cyan-500/10 text-cyan-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'engine': return '🔥';
      case 'flight': return '✈️';
      case 'navigation': return '🧭';
      case 'system': return '💻';
      case 'mission': return '🎯';
      default: return '📡';
    }
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const criticalAlerts = unacknowledgedAlerts.filter(alert => alert.type === 'critical');
  const displayAlerts = showAll ? alerts : unacknowledgedAlerts.slice(-8);

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-cyan-300 flex items-center">
          <span className="mr-2">🚨</span>
          ALERTS
          {unacknowledgedAlerts.length > 0 && (
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
              criticalAlerts.length > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-yellow-500 text-black'
            }`}>
              {unacknowledgedAlerts.length}
            </span>
          )}
        </h2>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-cyan-300 rounded transition-colors"
          >
            {showAll ? 'RECENT' : 'ALL'}
          </button>
          <button 
            onClick={clearAllAlerts}
            className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            CLEAR
          </button>
        </div>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {displayAlerts.length === 0 ? (
          <div className="bg-slate-800/30 rounded-lg p-4 text-center">
            <div className="text-green-400 text-2xl mb-2">✅</div>
            <div className="text-sm text-green-400 font-semibold">ALL SYSTEMS NOMINAL</div>
            <div className="text-xs text-green-300/60 mt-1">No active alerts</div>
          </div>
        ) : (
          displayAlerts.reverse().map(alert => (
            <div 
              key={alert.id} 
              className={`border rounded-lg p-3 transition-all duration-300 ${
                getAlertColors(alert.type)
              } ${alert.acknowledged ? 'opacity-50' : 'animate-pulse-slow'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">{getAlertIcon(alert.type)}</span>
                    <span className="text-xs">{getCategoryIcon(alert.category)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold leading-tight">
                      {alert.message}
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {new Date(alert.timestamp).toLocaleTimeString()} • {alert.category.toUpperCase()}
                    </div>
                  </div>
                </div>
                
                {!alert.acknowledged && (
                  <button 
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-2 py-1 text-xs bg-current/20 hover:bg-current/30 rounded transition-colors ml-2 flex-shrink-0"
                  >
                    ACK
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Critical Alert Summary */}
      {criticalAlerts.length > 0 && (
        <div className="mt-4 bg-red-500/20 border border-red-500 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-red-400 text-lg animate-pulse">🚨</span>
            <div>
              <div className="text-sm font-bold text-red-400">
                {criticalAlerts.length} CRITICAL ALERT{criticalAlerts.length > 1 ? 'S' : ''}
              </div>
              <div className="text-xs text-red-300/70">
                Immediate attention required
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertSystem;