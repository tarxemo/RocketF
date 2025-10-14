import { useState, useEffect } from 'react';
import AppRoutes from "./routes/AppRoutes";
import 'react-tooltip/dist/react-tooltip.css';
import './App.css';
import EngineFAB from './components/EngineFAB';

const App = () => {
  const [isEngineRunning, setIsEngineRunning] = useState(false);
  const [showEngineStatus, setShowEngineStatus] = useState(false);

  // Load engine state from localStorage on initial load
  useEffect(() => {
    const savedState = localStorage.getItem('engineState');
    if (savedState) {
      setIsEngineRunning(savedState === 'running');
    }
  }, []);

  // Save engine state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('engineState', isEngineRunning ? 'running' : 'stopped');
    }, [isEngineRunning]);

  const handleEngineToggle = (newState: boolean) => {
    setIsEngineRunning(newState);
    setShowEngineStatus(true);
    
    // Hide the status message after 3 seconds
    setTimeout(() => {
      setShowEngineStatus(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white relative">
      <AppRoutes isEngineRunning={isEngineRunning} />
      
      {/* Engine Status Notification */}
      <div className={`fixed bottom-20 right-6 z-40 transition-opacity duration-300 ${showEngineStatus ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-slate-800/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isEngineRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{isEngineRunning ? 'Engine started' : 'Engine stopped'}</span>
        </div>
      </div>
      
      <EngineFAB 
        isEngineRunning={isEngineRunning}
        onEngineToggle={handleEngineToggle}
      />
    </div>
  );
};

export default App;
