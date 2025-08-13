import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RocketLaunchPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLaunching, setIsLaunching] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);


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
      interval = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (showCountdown && countdown === 0) {
      setIsLaunching(true);
      setShowCountdown(false);
      startRocket();
      // Generate particles for launch effect
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 20 + 80
      }));
      setParticles(newParticles);
      
      // Reset after animation
      setTimeout(() => {
        setIsLaunching(false);
        setParticles([]);
        setCountdown(3);

        navigate('/rocket-controls');
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [showCountdown, countdown, navigate]);

  const handleLaunch = () => {
    if (!isLaunching && !showCountdown) {
      setShowCountdown(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black relative overflow-hidden flex flex-col items-center justify-center">
      {/* Animated stars background */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Rocket */}
      <div className={`relative transition-all duration-4000 ease-out ${
        isLaunching 
          ? 'transform -translate-y-screen scale-50 rotate-12' 
          : showCountdown 
            ? 'animate-bounce' 
            : 'hover:scale-110'
      }`}>
        <div className="text-8xl mb-8 transform transition-transform duration-300 hover:rotate-12">
          🚀
        </div>
        
        {/* Rocket flame effect */}
        {(isLaunching || showCountdown) && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <div className={`w-8 h-12 bg-gradient-to-t from-orange-500 via-red-500 to-yellow-300 rounded-b-full animate-pulse ${
              isLaunching ? 'animate-ping scale-150' : ''
            }`} />
            <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-gradient-to-t from-red-600 to-orange-400 rounded-b-full animate-pulse ${
              isLaunching ? 'animate-ping scale-150' : ''
            }`} />
          </div>
        )}
      </div>

      {/* Countdown display */}
      {showCountdown && countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-9xl font-bold text-white animate-ping">
            {countdown}
          </div>
        </div>
      )}

      {/* Launch particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-orange-400 rounded-full animate-ping"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: '2s'
          }}
        />
      ))}

      {/* Launch button */}
      <button
        onClick={handleLaunch}
        disabled={isLaunching || showCountdown}
        className={`
          px-12 py-6 text-2xl font-bold text-white rounded-full
          transition-all duration-300 transform
          ${isLaunching || showCountdown
            ? 'bg-gray-600 cursor-not-allowed scale-95'
            : 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 hover:scale-110 hover:shadow-2xl active:scale-95'
          }
          shadow-lg border-4 border-white/20
          relative overflow-hidden
        `}
      >
        {/* Button shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        <span className="relative z-10 flex items-center gap-3">
          {isLaunching ? (
            <>
              <span className="animate-spin">🌟</span>
              LAUNCHING...
            </>
          ) : showCountdown ? (
            <>
              <span className="animate-pulse">⏰</span>
              GET READY!
            </>
          ) : (
            <>
              <span className="animate-bounce">🚀</span>
              LAUNCH ROCKET
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
            stopRocket();
          }
        }}
        disabled={!isLaunching && !showCountdown}
        className={`
          mt-4 px-8 py-4 text-xl font-bold text-white rounded-full
          transition-all duration-300 transform
          ${!isLaunching && ! showCountdown  
            ? 'bg-gray-600 cursor-not-allowed scale-95'
            : 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 hover:scale-110 hover:shadow-2xl active:scale-95'
          }
          shadow-lg border-4 border-white/20
          relative overflow-hidden
        `}
      >
        <span className="relative z-10 flex items-center gap-3">
          {isLaunching ? (  
            <>
              <span className="animate-spin">🛑</span>
              STOP LAUNCH
            </>
          ) : showCountdown ? (
            <>
              <span className="animate-pulse">⏳</span>
              CANCEL COUNTDOWN
            </>
          ) : (
            <>
              <span className="animate-bounce">🚫</span>
              RESET ROCKET
            </>
          )}
        </span>
      </button>

      {/* Ground/launchpad */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-800 to-gray-600">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/20 to-transparent animate-pulse" />
        {/* Launchpad details */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-gray-700 rounded-lg shadow-lg">
          <div className="absolute inset-1 bg-gray-600 rounded animate-pulse" />
        </div>
      </div>

      {/* Success message */}
      {isLaunching && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-4xl font-bold text-yellow-300 animate-bounce">
          🌟 MISSION SUCCESS! 🌟
        </div>
      )}

      {/* Floating UI elements */}
      <div className="absolute top-8 left-8 text-white/60">
        <div className="text-sm font-mono">
          Mission Control
        </div>
        <div className={`text-xs mt-1 ${isLaunching ? 'text-green-400' : 'text-blue-400'}`}>
          Status: {isLaunching ? 'IN FLIGHT' : showCountdown ? 'COUNTDOWN' : 'READY'}
        </div>
      </div>

      <div className="absolute top-8 right-8 text-white/60">
        <div className="text-sm font-mono">
          Weather: Clear ☀️
        </div>
        <div className="text-xs mt-1 text-green-400">
          Launch Conditions: GO
        </div>
      </div>
    </div>
  );
};

export default RocketLaunchPage;