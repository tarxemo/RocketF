// src/components/TimeNavigation.tsx
import React from 'react';

interface TimeNavigationProps {
  currentTime: number;
  maxTime: number;
  onChange: (time: number) => void;
}

const TimeNavigation: React.FC<TimeNavigationProps> = ({ currentTime, maxTime, onChange }) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  // Mission milestones for timeline markers
  const milestones = [
    { time: 0, label: 'LIFTOFF', icon: '🚀' },
    { time: 60, label: 'MAX-Q', icon: '⚡' },
    { time: 162, label: 'MECO', icon: '🔥' },
    { time: 168, label: 'SEP', icon: '🔗' },
    { time: 210, label: 'FAIRING', icon: '🛡️' },
    { time: 565, label: 'SECO-1', icon: '⏹️' },
    { time: 1800, label: 'DEPLOY', icon: '🛰️' }
  ];

  const getProgressPercentage = () => (currentTime / maxTime) * 100;

  const getMilestonePosition = (time: number) => (time / maxTime) * 100;

  const getCurrentPhase = () => {
    if (currentTime < 10) return 'PRE-LAUNCH';
    if (currentTime < 162) return 'FIRST STAGE';
    if (currentTime < 168) return 'STAGE SEP';
    if (currentTime < 565) return 'SECOND STAGE';
    if (currentTime < 1800) return 'COAST';
    return 'PAYLOAD OPS';
  };

  return (
    <div className="w-full">
      {/* Mission Phase and Time Display */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-3 md:mb-4 gap-3 md:gap-0">
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 md:space-x-4">
          <div className="bg-slate-800/50 rounded-lg px-3 md:px-4 py-1 md:py-2">
            <div className="text-xs text-cyan-400 uppercase tracking-wide">Mission Time</div>
            <div className="text-lg md:text-2xl font-bold text-white font-mono">
              T+{formatTime(currentTime)}
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg px-3 md:px-4 py-1 md:py-2">
            <div className="text-xs text-cyan-400 uppercase tracking-wide">Current Phase</div>
            <div className="text-sm md:text-lg font-semibold text-cyan-300">
              {getCurrentPhase()}
            </div>
          </div>
        </div>
        
        <div className="text-center md:text-right">
          <div className="text-xs text-cyan-400">Mission Duration</div>
          <div className="text-base md:text-lg font-mono text-white">{formatTime(maxTime)}</div>
        </div>
      </div>

      {/* Timeline Slider */}
      <div className="relative">
        {/* Background track */}
        <div className="w-full h-2 bg-slate-700 rounded-full relative overflow-hidden">
          {/* Progress bar */}
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
          
          {/* Current position indicator */}
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-3 h-3 md:w-4 md:h-4 bg-white border-2 border-cyan-400 rounded-full shadow-lg transition-all duration-300"
            style={{ left: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        
        {/* Invisible slider for interaction */}
        <input
          type="range"
          min="0"
          max={maxTime}
          value={currentTime}
          onChange={handleSliderChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {/* Milestone markers - hidden on mobile */}
        <div className="relative mt-2 hidden sm:block">
          {milestones.map((milestone, index) => {
            const position = getMilestonePosition(milestone.time);
            const isPassed = currentTime >= milestone.time;
            const isCurrent = Math.abs(currentTime - milestone.time) < 30;
            
            return (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 cursor-pointer"
                style={{ left: `${position}%` }}
                onClick={() => onChange(milestone.time)}
              >
                {/* Milestone line */}
                <div className={`w-0.5 h-4 md:h-6 mb-1 transition-colors ${
                  isPassed ? 'bg-cyan-400' : 'bg-slate-500'
                }`}></div>
                
                {/* Milestone icon and label */}
                <div className={`text-center transition-all duration-300 ${
                  isCurrent ? 'scale-110' : 'scale-100'
                }`}>
                  <div className={`text-sm md:text-lg mb-1 ${
                    isPassed ? 'grayscale-0' : 'grayscale'
                  }`}>
                    {milestone.icon}
                  </div>
                  <div className={`text-xs font-semibold whitespace-nowrap ${
                    isPassed ? 'text-cyan-300' : 'text-slate-400'
                  }`}>
                    {milestone.label}
                  </div>
                  <div className={`text-xs font-mono ${
                    isPassed ? 'text-cyan-400' : 'text-slate-500'
                  }`}>
                    T+{formatTime(milestone.time)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Mobile milestone indicators */}
        <div className="sm:hidden mt-2">
          <div className="flex justify-between text-xs">
            <span className="text-cyan-400">T+00:00</span>
            <span className="text-cyan-400">T+{formatTime(maxTime)}</span>
          </div>
        </div>
      </div>
      
      {/* Timeline Controls */}
      <div className="flex items-center justify-center space-x-2 md:space-x-4 mt-4 md:mt-6">
        <button 
          onClick={() => onChange(0)}
          className="px-2 md:px-3 py-1 bg-slate-700 hover:bg-slate-600 text-cyan-300 rounded text-xs md:text-sm transition-colors"
        >
          <span className="hidden sm:inline">⏮️ START</span>
          <span className="sm:hidden">⏮️</span>
        </button>
        
        <button 
          onClick={() => onChange(Math.max(0, currentTime - 60))}
          className="px-2 md:px-3 py-1 bg-slate-700 hover:bg-slate-600 text-cyan-300 rounded text-xs md:text-sm transition-colors"
        >
          <span className="hidden sm:inline">⏪ -1MIN</span>
          <span className="sm:hidden">⏪</span>
        </button>
        
        <button 
          onClick={() => onChange(Math.min(maxTime, currentTime + 60))}
          className="px-2 md:px-3 py-1 bg-slate-700 hover:bg-slate-600 text-cyan-300 rounded text-xs md:text-sm transition-colors"
        >
          <span className="hidden sm:inline">⏩ +1MIN</span>
          <span className="sm:hidden">⏩</span>
        </button>
        
        <button 
          onClick={() => onChange(maxTime)}
          className="px-2 md:px-3 py-1 bg-slate-700 hover:bg-slate-600 text-cyan-300 rounded text-xs md:text-sm transition-colors"
        >
          <span className="hidden sm:inline">⏭️ END</span>
          <span className="sm:hidden">⏭️</span>
        </button>
      </div>
    </div>
  );
};

export default TimeNavigation;