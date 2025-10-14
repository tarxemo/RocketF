// src/components/MissionPhaseIndicator.tsx
import React from 'react';
import { Wrench, Rocket, Zap, Flame, Link2, Sparkles, Shield, Square, Orbit, Satellite, SatelliteDish } from 'lucide-react';
interface MissionPhaseIndicatorProps {
  phase?: string;
}

const MissionPhaseIndicator: React.FC<MissionPhaseIndicatorProps> = ({ phase }) => {
  if (!phase) {
    return (
      <div className="flex items-center space-x-3 bg-slate-800/50 rounded-lg px-4 py-2">
        <div className="w-3 h-3 bg-gray-500 rounded-full animate-pulse"></div>
        <div>
          <div className="text-sm font-semibold text-gray-400">STANDBY</div>
          <div className="text-xs text-gray-500">Awaiting telemetry data</div>
        </div>
      </div>
    );
  }

  const getPhaseColor = (phaseName: string) => {
    switch (phaseName.toLowerCase()) {
      case 'pre-launch':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'liftoff':
        return 'text-orange-400 bg-orange-400/20 border-orange-400/30';
      case 'max-q':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'meco':
      case 'stage separation':
        return 'text-purple-400 bg-purple-400/20 border-purple-400/30';
      case 'second stage ignition':
      case 'fairing separation':
        return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'seco-1':
      case 'coast phase':
        return 'text-cyan-400 bg-cyan-400/20 border-cyan-400/30';
      case 'payload deployment':
        return 'text-green-400 bg-green-400/20 border-green-400/30';
      default:
        return 'text-white bg-slate-400/20 border-slate-400/30';
    }
  };

  const getPhaseIcon = (phaseName: string) => {
    const iconProps = { className: 'w-5 h-5' };
    
    switch (phaseName.toLowerCase()) {
      case 'pre-launch':
        return <Wrench {...iconProps} />;
      case 'liftoff':
        return <Rocket {...iconProps} />;
      case 'max-q':
        return <Zap {...iconProps} />;
      case 'meco':
        return <Flame {...iconProps} />;
      case 'stage separation':
        return <Link2 {...iconProps} />;
      case 'second stage ignition':
        return <Sparkles {...iconProps} />;
      case 'fairing separation':
        return <Shield {...iconProps} />;
      case 'seco-1':
        return <Square {...iconProps} />;
      case 'coast phase':
        return <Orbit {...iconProps} />;
      case 'payload deployment':
        return <Satellite {...iconProps} />;
      default:
        return <SatelliteDish {...iconProps} />;
    }
  };

  const colorClasses = getPhaseColor(phase);
  const Icon = () => getPhaseIcon(phase);

  return (
    <div className={`flex items-center space-x-3 rounded-lg px-4 py-2 border ${colorClasses}`}>
      <div className="flex items-center space-x-2">
        <Icon />
        <div className="w-2 h-2 rounded-full animate-pulse bg-current"></div>
      </div>
      <div>
        <div className="text-sm font-semibold uppercase tracking-wide">
          {phase}
        </div>
        <div className="text-xs opacity-70">
          Mission Phase Active
        </div>
      </div>
    </div>
  );
};

export default MissionPhaseIndicator;
