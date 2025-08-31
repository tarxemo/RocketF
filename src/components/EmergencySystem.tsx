import React, { useState, useEffect } from 'react';

interface EmergencyScenario {
  id: string;
  name: string;
  severity: 'critical' | 'warning' | 'caution';
  description: string;
  icon: string;
  actions: string[];
  autoTrigger?: boolean;
  triggerConditions?: {
    altitude?: number;
    velocity?: number;
    fuel?: number;
    engineFailure?: boolean;
  };
}

interface EmergencySystemProps {
  telemetryData?: any;
  onAbort: () => void;
  onEmergencyAction: (action: string) => void;
  isLaunching: boolean;
}

const EmergencySystem: React.FC<EmergencySystemProps> = ({
  telemetryData,
  onAbort,
  onEmergencyAction,
  isLaunching
}) => {
  const [activeScenarios, setActiveScenarios] = useState<EmergencyScenario[]>([]);
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);

  const emergencyScenarios: EmergencyScenario[] = [
    {
      id: 'engine_failure',
      name: 'Engine Failure',
      severity: 'critical',
      description: 'Primary engine has experienced an anomaly',
      icon: '🔥',
      actions: ['Abort Mission', 'Switch to Backup Engine', 'Emergency Landing'],
      autoTrigger: true,
      triggerConditions: { engineFailure: true }
    },
    {
      id: 'fuel_leak',
      name: 'Fuel System Leak',
      severity: 'critical',
      description: 'Propellant leak detected in fuel system',
      icon: '⛽',
      actions: ['Immediate Abort', 'Isolate Fuel Lines', 'Emergency Shutdown'],
      autoTrigger: true,
      triggerConditions: { fuel: 10 }
    },
    {
      id: 'guidance_failure',
      name: 'Guidance System Failure',
      severity: 'warning',
      description: 'Navigation computer has lost primary guidance',
      icon: '🧭',
      actions: ['Switch to Backup Guidance', 'Manual Control', 'Abort if Critical'],
    },
    {
      id: 'structural_stress',
      name: 'Structural Overstress',
      severity: 'warning',
      description: 'Vehicle experiencing excessive structural loads',
      icon: '⚠️',
      actions: ['Reduce Thrust', 'Adjust Trajectory', 'Monitor Closely'],
      autoTrigger: true,
      triggerConditions: { velocity: 2000 }
    },
    {
      id: 'weather_abort',
      name: 'Weather Violation',
      severity: 'caution',
      description: 'Weather conditions outside launch criteria',
      icon: '🌩️',
      actions: ['Hold Launch', 'Monitor Weather', 'Scrub Mission'],
    },
    {
      id: 'range_safety',
      name: 'Range Safety Violation',
      severity: 'critical',
      description: 'Vehicle has deviated from approved flight path',
      icon: '🚨',
      actions: ['Flight Termination System', 'Immediate Abort', 'Range Clear'],
      autoTrigger: true,
      triggerConditions: { altitude: 50000 }
    }
  ];

  // Monitor telemetry for auto-trigger conditions
  useEffect(() => {
    if (!telemetryData || !isLaunching) return;

    emergencyScenarios.forEach(scenario => {
      if (scenario.autoTrigger && scenario.triggerConditions) {
        const conditions = scenario.triggerConditions;
        let shouldTrigger = false;

        if (conditions.altitude && telemetryData.altitude > conditions.altitude) {
          shouldTrigger = true;
        }
        if (conditions.velocity && telemetryData.velocity > conditions.velocity) {
          shouldTrigger = true;
        }
        if (conditions.fuel && telemetryData.fuel < conditions.fuel) {
          shouldTrigger = true;
        }
        if (conditions.engineFailure && telemetryData.engineStatus === 'failure') {
          shouldTrigger = true;
        }

        if (shouldTrigger && !activeScenarios.find(s => s.id === scenario.id)) {
          setActiveScenarios(prev => [...prev, scenario]);
          setEmergencyMode(true);
        }
      }
    });
  }, [telemetryData, isLaunching, activeScenarios]);

  const handleManualEmergency = (scenario: EmergencyScenario) => {
    if (!activeScenarios.find(s => s.id === scenario.id)) {
      setActiveScenarios(prev => [...prev, scenario]);
      setEmergencyMode(true);
    }
  };

  const handleEmergencyAction = (scenarioId: string, action: string) => {
    if (action.toLowerCase().includes('abort') || action.toLowerCase().includes('termination')) {
      setShowAbortConfirm(true);
    } else {
      onEmergencyAction(`${scenarioId}: ${action}`);
      // Remove scenario if action resolves it
      if (action.toLowerCase().includes('switch') || action.toLowerCase().includes('isolate')) {
        setActiveScenarios(prev => prev.filter(s => s.id !== scenarioId));
        if (activeScenarios.length === 1) {
          setEmergencyMode(false);
        }
      }
    }
  };

  const confirmAbort = () => {
    onAbort();
    setShowAbortConfirm(false);
    setEmergencyMode(false);
    setActiveScenarios([]);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-500/10 text-red-400';
      case 'warning': return 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
      case 'caution': return 'border-orange-500 bg-orange-500/10 text-orange-400';
      default: return 'border-gray-500 bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Emergency Mode Indicator */}
      {emergencyMode && (
        <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 animate-pulse">
          <div className="flex items-center justify-center space-x-3">
            <span className="text-3xl animate-spin">🚨</span>
            <div className="text-center">
              <div className="text-xl font-bold text-red-400">EMERGENCY MODE ACTIVE</div>
              <div className="text-red-300 text-sm">{activeScenarios.length} active scenario(s)</div>
            </div>
            <span className="text-3xl animate-spin">🚨</span>
          </div>
        </div>
      )}

      {/* Active Emergency Scenarios */}
      {activeScenarios.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-red-400 flex items-center">
            <span className="mr-2">⚡</span>
            ACTIVE EMERGENCIES
          </h3>
          {activeScenarios.map(scenario => (
            <div key={scenario.id} className={`border rounded-xl p-4 ${getSeverityColor(scenario.severity)}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{scenario.icon}</span>
                  <div>
                    <div className="font-bold text-lg">{scenario.name}</div>
                    <div className="text-sm opacity-80">{scenario.description}</div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  scenario.severity === 'critical' ? 'bg-red-500' :
                  scenario.severity === 'warning' ? 'bg-yellow-500' :
                  'bg-orange-500'
                } text-white`}>
                  {scenario.severity.toUpperCase()}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-semibold">Available Actions:</div>
                <div className="grid grid-cols-1 gap-2">
                  {scenario.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmergencyAction(scenario.id, action)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        action.toLowerCase().includes('abort') || action.toLowerCase().includes('termination')
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual Emergency Triggers */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-6">
        <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center">
          <span className="mr-2">🔧</span>
          EMERGENCY PROCEDURES
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {emergencyScenarios.map(scenario => (
            <button
              key={scenario.id}
              onClick={() => handleManualEmergency(scenario)}
              disabled={activeScenarios.find(s => s.id === scenario.id) !== undefined}
              className={`p-3 rounded-lg border text-left transition-all ${
                activeScenarios.find(s => s.id === scenario.id)
                  ? 'border-red-500 bg-red-500/20 cursor-not-allowed'
                  : 'border-gray-600 bg-gray-800/50 hover:border-cyan-500 hover:bg-cyan-500/10'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">{scenario.icon}</span>
                <span className="font-medium text-sm">{scenario.name}</span>
              </div>
              <div className="text-xs text-gray-400">{scenario.description}</div>
            </button>
          ))}
        </div>

        {/* Master Abort Button */}
        <div className="mt-6 pt-4 border-t border-gray-600">
          <button
            onClick={() => setShowAbortConfirm(true)}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                     text-white font-bold text-lg rounded-xl border-2 border-red-500 
                     transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span className="flex items-center justify-center space-x-3">
              <span className="text-2xl">🛑</span>
              <span>MISSION ABORT</span>
              <span className="text-2xl">🛑</span>
            </span>
          </button>
        </div>
      </div>

      {/* Abort Confirmation Modal */}
      {showAbortConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-red-500 rounded-2xl p-8 max-w-md mx-4">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <div className="text-2xl font-bold text-red-400 mb-2">CONFIRM MISSION ABORT</div>
              <div className="text-gray-300">
                This action will immediately terminate the mission and cannot be undone.
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAbortConfirm(false)}
                className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmAbort}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
              >
                ABORT MISSION
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencySystem;
