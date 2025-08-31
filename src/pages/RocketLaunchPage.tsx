import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RocketLaunchPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLaunching, setIsLaunching] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [systemsCheck] = useState({
    propulsion: 'GO',
    avionics: 'GO', 
    guidance: 'GO',
    telemetry: 'GO',
    weather: 'GO'
  });
  const [launchSequence, setLaunchSequence] = useState<string[]>([]);


  //function to start the rocket via Api url sending true boolean
  const startRocket = async () => {
    try {
      const response = await fetch('https://api.example.com/start-rocket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ launch: true })
      });
      if (!response.ok) {
        throw new Error('Failed to start rocket');
      }
      console.log('Rocket started successfully');
    } catch (error) {
      console.error('Error starting rocket:', error);
    }
  };




  

  //funciton to stop the rocket via Api url sending false boolean not working
  const stopRocket = async () => {
    try {
      const response = await fetch('https://api.example.com/step-rocket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ launch: false })
      });
      if (!response.ok) {
        throw new Error('Failed to step rocket');
      }
      console.log('Rocket stepped successfully');
    } catch (error) {
      console.error('Error stepping rocket:', error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (showCountdown && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          const nextCount = prev - 1;
          
          // Add launch sequence events based on countdown
          const sequenceEvents: Record<number, string> = {
            10: "T-10: Launch sequence initiated",
            9: "T-9: Engine chill initiated", 
            8: "T-8: Strongback retract initiated",
            7: "T-7: Engine controller start",
            6: "T-6: Engine ignition sequence start",
            5: "T-5: Flight computer in startup",
            4: "T-4: Engine turbopump at flight pressure",
            3: "T-3: Engine mixture ratio nominal", 
            2: "T-2: LOX loading complete",
            1: "T-1: Flight computer ready for launch",
            0: "T-0: LIFTOFF! Vehicle has cleared the tower"
          };
          
          if (sequenceEvents[prev]) {
            setLaunchSequence(prevSeq => [...prevSeq, sequenceEvents[prev]]);
          }
          
          if (nextCount <= 0) {
            setIsLaunching(true);
            setShowCountdown(false);
            
            // Create launch particles
            const newParticles = Array.from({ length: 30 }, (_, i) => ({
              id: Date.now() + i,
              x: 45 + Math.random() * 10,
              y: 60 + Math.random() * 20
            }));
            setParticles(newParticles);
            
            // Start rocket animation
            startRocket();
            
            // Add final launch events
            setTimeout(() => {
              setLaunchSequence(prevSeq => [...prevSeq, "T+3: Vehicle performing nominal ascent"]);
            }, 3000);
            
            setTimeout(() => {
              setLaunchSequence(prevSeq => [...prevSeq, "T+5: All engines nominal, switching to mission control"]);
            }, 5000);
            
            // Navigate to simulation after 6 seconds
            setTimeout(() => {
              navigate('/rocket-controls');
            }, 6000);
            
            return 0;
          }
          return nextCount;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [showCountdown, countdown, navigate]);

  const handleLaunch = () => {
    if (!isLaunching && !showCountdown) {
      setShowCountdown(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-auto">
      {/* Animated stars background */}
      <div className="absolute inset-0">
        {Array.from({ length: 200 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Mission Control Header */}
      <div className="relative z-10 bg-black/40 backdrop-blur-sm border-b border-cyan-500/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    LAUNCH CONTROL
                  </h1>
                  <p className="text-cyan-300/70">Falcon Heavy • Demo Mission • LC-39A</p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-cyan-400">Kennedy Space Center</div>
              <div className="text-xs text-cyan-300/60">Cape Canaveral, Florida</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center p-8 pb-32">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-12 gap-8 min-h-[calc(100vh-200px)]">
          
          {/* Left Panel - Systems Status */}
          <div className="col-span-3 space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-6">
              <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center">
                <span className="mr-2">📋</span>
                SYSTEMS STATUS
              </h2>
              <div className="space-y-3">
                {Object.entries(systemsCheck).map(([system, status]) => (
                  <div key={system} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <span className="text-cyan-400 capitalize font-medium">{system}:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      status === 'GO' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Launch Sequence Log */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-6">
              <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center">
                <span className="mr-2">📜</span>
                SEQUENCE LOG
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {launchSequence.length === 0 ? (
                  <div className="text-cyan-400/60 text-sm italic">Awaiting launch sequence...</div>
                ) : (
                  launchSequence.map((event, index) => (
                    <div key={index} className="text-xs text-cyan-300 font-mono bg-slate-800/20 p-2 rounded">
                      {event}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Center Panel - Rocket Visualization */}
          <div className="col-span-6 flex flex-col items-center justify-center">

            {/* Rocket Visualization */}
            <div className={`relative transition-all duration-4000 ease-out ${
              isLaunching 
                ? 'transform -translate-y-screen scale-75 rotate-6' 
                : showCountdown 
                  ? 'animate-bounce' 
                  : 'hover:scale-110'
            }`}>
              <div className="text-9xl mb-8 transform transition-transform duration-300 hover:rotate-6 filter drop-shadow-2xl">
                🚀
              </div>
              
              {/* Enhanced rocket flame effect */}
              {(isLaunching || showCountdown) && (
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                  {/* Main flame */}
                  <div className={`w-12 h-16 bg-gradient-to-t from-orange-500 via-red-500 to-yellow-300 rounded-b-full animate-pulse ${
                    isLaunching ? 'animate-ping scale-150' : ''
                  }`} />
                  {/* Inner flame */}
                  <div className={`absolute top-3 left-1/2 transform -translate-x-1/2 w-6 h-10 bg-gradient-to-t from-red-600 to-orange-400 rounded-b-full animate-pulse ${
                    isLaunching ? 'animate-ping scale-150' : ''
                  }`} />
                  {/* Core flame */}
                  <div className={`absolute top-5 left-1/2 transform -translate-x-1/2 w-3 h-6 bg-gradient-to-t from-blue-400 to-white rounded-b-full animate-pulse ${
                    isLaunching ? 'animate-ping scale-150' : ''
                  }`} />
                </div>
              )}
            </div>

            {/* Countdown display */}
            {showCountdown && countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/30">
                  <div className="text-8xl font-bold text-white animate-ping text-center">
                    {countdown}
                  </div>
                  <div className="text-cyan-300 text-center mt-4 text-xl font-semibold">
                    LAUNCH IN
                  </div>
                </div>
              </div>
            )}

            {/* Launch particles */}
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-ping"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: '2s'
                }}
              />
            ))}

            {/* Launch Controls */}
            <div className="mt-8 space-y-4">
              <button
                onClick={handleLaunch}
                disabled={isLaunching || showCountdown}
                className={`
                  px-16 py-6 text-2xl font-bold text-white rounded-2xl
                  transition-all duration-300 transform
                  ${isLaunching || showCountdown
                    ? 'bg-gray-600 cursor-not-allowed scale-95'
                    : 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 hover:scale-110 hover:shadow-2xl active:scale-95'
                  }
                  shadow-2xl border-4 border-white/20
                  relative overflow-hidden
                `}
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <span className="relative z-10 flex items-center gap-4">
                  {isLaunching ? (
                    <>
                      <span className="animate-spin text-3xl">🌟</span>
                      LAUNCHING...
                    </>
                  ) : showCountdown ? (
                    <>
                      <span className="animate-pulse text-3xl">⏰</span>
                      SEQUENCE ACTIVE
                    </>
                  ) : (
                    <>
                      <span className="animate-bounce text-3xl">🚀</span>
                      INITIATE LAUNCH
                    </>
                  )}
                </span>
              </button>

              <button
                onClick={() => {
                  if (isLaunching || showCountdown) {
                    setIsLaunching(false);
                    setShowCountdown(false);
                    setCountdown(10);
                    setLaunchSequence([]);
                    stopRocket();
                  }
                }}
                disabled={!isLaunching && !showCountdown}
                className={`
                  px-12 py-4 text-lg font-bold text-white rounded-xl
                  transition-all duration-300 transform
                  ${!isLaunching && !showCountdown  
                    ? 'bg-gray-600 cursor-not-allowed scale-95'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:scale-105 hover:shadow-xl active:scale-95'
                  }
                  shadow-lg border-2 border-white/20
                `}
              >
                <span className="flex items-center gap-3">
                  {isLaunching ? (  
                    <>
                      <span className="animate-spin">🛑</span>
                      ABORT LAUNCH
                    </>
                  ) : showCountdown ? (
                    <>
                      <span className="animate-pulse">⏹️</span>
                      HOLD SEQUENCE
                    </>
                  ) : (
                    <>
                      <span>🔄</span>
                      RESET SYSTEMS
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
          
          {/* Right Panel - Environmental Data */}
          <div className="col-span-3 space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-6">
              <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center">
                <span className="mr-2">🌦️</span>
                WEATHER CONDITIONS
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400">Conditions:</span>
                  <span className="text-green-400 font-semibold">CLEAR ☀️</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400">Wind Speed:</span>
                  <span className="text-white">8 mph</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400">Temperature:</span>
                  <span className="text-white">72°F</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400">Humidity:</span>
                  <span className="text-white">65%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400">Pressure:</span>
                  <span className="text-white">30.15 inHg</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-6">
              <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center">
                <span className="mr-2">📍</span>
                MISSION PROFILE
              </h2>
              <div className="space-y-3 text-sm">
                <div className="text-cyan-400">Target Orbit: 400 km LEO</div>
                <div className="text-cyan-400">Inclination: 51.6°</div>
                <div className="text-cyan-400">Payload: 22.8 tons</div>
                <div className="text-cyan-400">Mission Duration: 20 min</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ground/launchpad */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-800 via-gray-700 to-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/10 to-transparent animate-pulse" />
        {/* Enhanced launchpad */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="w-40 h-6 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg shadow-2xl">
            <div className="absolute inset-1 bg-gradient-to-r from-gray-600 to-gray-500 rounded animate-pulse" />
            {/* Launch tower elements */}
            <div className="absolute -left-2 -top-8 w-1 h-12 bg-gray-600"></div>
            <div className="absolute -right-2 -top-8 w-1 h-12 bg-gray-600"></div>
          </div>
        </div>
      </div>

      {/* Success message */}
      {isLaunching && (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-green-500/20 backdrop-blur-sm border border-green-400 rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-green-400 animate-bounce mb-2">
              🌟 LIFTOFF SUCCESSFUL! 🌟
            </div>
            <div className="text-green-300 text-lg">
              Vehicle performing nominally
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RocketLaunchPage;