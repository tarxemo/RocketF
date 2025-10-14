import React from 'react';
import useTelemetry from '../../hooks/useTelemetry';
import Gauge from '../../components/Gauge';

const SystemsPage: React.FC = () => {
  const { data: telemetryData } = useTelemetry();
  
  // Helper to safely get status with null checks
  const getStatus = (value: number | undefined, thresholds: { critical: number; degraded: number }) => {
    if (value === undefined) return 'UNKNOWN';
    return value > thresholds.critical ? 'CRITICAL' : value > thresholds.degraded ? 'DEGRADED' : 'NOMINAL';
  };

  // If there's no data yet, show loading state
  if (!telemetryData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading telemetry data...</div>
      </div>
    );
  }

  const { avionics, structural, telemetry: telemetryInfo, environment } = telemetryData;

  const systemStatus = [
    {
      name: 'Avionics',
      status: avionics?.status || 'UNKNOWN',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: avionics?.status === 'NOMINAL' ? 'green' : avionics?.status === 'DEGRADED' ? 'yellow' : 'red',
      metrics: [
        { label: 'CPU Load', value: `${avionics?.cpuLoad?.toFixed?.(1) ?? '0.0'}%` },
        { label: 'Memory', value: `${avionics?.memoryUsage?.toFixed?.(1) ?? '0.0'}%` },
      ]
    },
    {
      name: 'Structural',
      status: getStatus(structural?.stress, { critical: 0.8, degraded: 0.6 }),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: getStatus(structural?.stress, { critical: 0.8, degraded: 0.6 }) === 'CRITICAL' ? 'red' : 
             getStatus(structural?.stress, { critical: 0.8, degraded: 0.6 }) === 'DEGRADED' ? 'yellow' : 'green',
      metrics: [
        { label: 'Stress', value: `${((structural?.stress ?? 0) * 100).toFixed(1)}%` },
        { label: 'Vibration', value: `${((structural?.vibration ?? 0) * 100).toFixed(1)}%` },
      ]
    },
    {
      name: 'Telemetry',
      status: telemetryInfo?.status || 'UNKNOWN',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: telemetryInfo?.status === 'NOMINAL' ? 'green' : telemetryInfo?.status === 'DEGRADED' ? 'yellow' : 'red',
      metrics: [
        { label: 'Uplink', value: `${telemetryInfo?.uplinkRate?.toFixed(0) || '0'} bps` },
        { label: 'Downlink', value: `${telemetryInfo?.downlinkRate?.toFixed(0) || '0'} bps` },
      ]
    },
    {
      name: 'Environment',
      status: 'NOMINAL',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
      metrics: [
        { label: 'Ext. Temp', value: `${environment?.externalTemperature?.toFixed?.(1) ?? '0.0'} K` },
        { label: 'Pressure', value: `${((environment?.externalPressure ?? 0) / 1000).toFixed?.(1) ?? '0.0'} kPa` },
      ]
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Systems Status</h2>
        <p className="text-slate-400">Overview of all onboard systems and their status</p>
      </div>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {systemStatus.map((system, index) => (
          <div key={index} className={`bg-slate-800/50 rounded-xl p-4 border-l-4 ${
            system.color === 'green' ? 'border-green-500/50' : 
            system.color === 'yellow' ? 'border-amber-500/50' : 'border-red-500/50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${
                  system.color === 'green' ? 'bg-green-500/20 text-green-400' : 
                  system.color === 'yellow' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {system.icon}
                </div>
                <div>
                  <h3 className="font-medium">{system.name}</h3>
                  <div className={`text-xs font-medium ${
                    system.color === 'green' ? 'text-green-400' : 
                    system.color === 'yellow' ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {system.status}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {system.metrics.map((metric, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-400">{metric.label}</span>
                  <span className="font-mono">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed System Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avionics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Avionics Health */}
          <div className="bg-slate-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Avionics Health</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Gauge 
                title="CPU Load" 
                value={avionics?.cpuLoad || 0} 
                unit="%" 
                min={0} 
                max={100} 
                warningThreshold={80}
                criticalThreshold={90}
              />
              <Gauge 
                title="Memory Usage" 
                value={avionics?.memoryUsage || 0} 
                unit="%" 
                min={0} 
                max={100} 
                warningThreshold={75}
                criticalThreshold={90}
              />
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-slate-400 mb-3">System Logs</h4>
              <div className="bg-slate-900/50 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm">
                <div className="text-green-400">[INFO] System initialized</div>
                <div className="text-green-400">[INFO] All systems nominal</div>
                <div className="text-slate-500">[DEBUG] Telemetry link established</div>
                <div className="text-slate-500">[DEBUG] GPS lock acquired</div>
                <div className="text-amber-400">[WARN] High memory usage detected</div>
                <div className="text-slate-500">[DEBUG] CPU load: {avionics?.cpuLoad?.toFixed(1) || '0.0'}%</div>
              </div>
            </div>
          </div>

          {/* Structural Integrity */}
          <div className="bg-slate-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Structural Integrity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Gauge 
                title="Structural Stress" 
                value={(structural?.stress || 0) * 100} 
                unit="%" 
                min={0} 
                max={100} 
                warningThreshold={60}
                criticalThreshold={80}
              />
              <Gauge 
                title="Vibration Levels" 
                value={(structural?.vibration || 0) * 100} 
                unit="%" 
                min={0} 
                max={100} 
                warningThreshold={50}
                criticalThreshold={75}
              />
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-slate-400 mb-3">Structural Alerts</h4>
              <div className="space-y-2">
                {structural?.stress > 0.8 ? (
                  <div className="flex items-start p-3 bg-red-500/10 rounded-lg">
                    <div className="text-red-400 mt-0.5 mr-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Critical Stress Level</div>
                      <p className="text-sm text-slate-400">Structural stress has reached critical levels. Immediate action required.</p>
                    </div>
                  </div>
                ) : structural?.stress > 0.6 ? (
                  <div className="flex items-start p-3 bg-amber-500/10 rounded-lg">
                    <div className="text-amber-400 mt-0.5 mr-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Elevated Stress</div>
                      <p className="text-sm text-slate-400">Structural stress is above nominal levels. Monitor closely.</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 text-slate-500">
                    No active structural alerts
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry & Environment */}
        <div className="space-y-6">
          {/* Telemetry Status */}
          <div className="bg-slate-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Telemetry Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Uplink Rate</span>
                  <span className="font-mono">{telemetryInfo ? `${(telemetryInfo.uplinkRate / 1000).toFixed(1)} kbps` : '0 kbps'}</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div 
                    className="h-2 bg-cyan-500 rounded-full"
                    style={{ width: `${Math.min(100, (telemetryInfo?.uplinkRate || 0) / 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Downlink Rate</span>
                  <span className="font-mono">{telemetryInfo ? `${(telemetryInfo.downlinkRate / 1000).toFixed(1)} kbps` : '0 kbps'}</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div 
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, (telemetryInfo?.downlinkRate || 0) / 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Signal Quality</span>
                  <span className="font-mono">
                    {telemetryInfo?.status === 'NOMINAL' ? 'Excellent' : 
                     telemetryInfo?.status === 'DEGRADED' ? 'Fair' : 'Poor'}
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full ${
                      telemetryInfo?.status === 'NOMINAL' ? 'bg-green-500' : 
                      telemetryInfo?.status === 'DEGRADED' ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: telemetryInfo?.status === 'NOMINAL' ? '100%' : 
                                       telemetryInfo?.status === 'DEGRADED' ? '60%' : '20%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Environmental Data */}
          <div className="bg-slate-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Environmental Data</h3>
            <div className="space-y-4">
              <div className="bg-slate-900/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">External Temperature</div>
                    <div className="text-2xl font-mono">
                      {environment?.externalTemperature?.toFixed(1) || '0.0'} 
                      <span className="text-sm text-slate-400"> K</span>
                    </div>
                  </div>
                  <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">External Pressure</div>
                    <div className="text-2xl font-mono">
                      {(environment?.externalPressure / 1000).toFixed(2) || '0.00'} 
                      <span className="text-sm text-slate-400"> kPa</span>
                    </div>
                  </div>
                  <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Altitude</div>
                    <div className="text-2xl font-mono">
                      {telemetryData?.position ? (telemetryData.position.y / 1000).toFixed(2) : '0.00'}
                      <span className="text-sm text-slate-400"> km</span>
                    </div>
                  </div>
                  <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Controls */}
          <div className="bg-slate-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">System Controls</h3>
            <div className="space-y-3">
              <button className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Reboot Avionics
              </button>
              <button className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Reset Telemetry Link
              </button>
              <button className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-4 py-2 rounded-lg font-medium transition-colors">
                Run Diagnostics
              </button>
              <button className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg font-medium transition-colors">
                Emergency Shutdown
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemsPage;
