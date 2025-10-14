import type { ReactNode } from 'react';
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

interface TelemetryLayoutProps {
  isEngineRunning: boolean;
  children?: ReactNode;
}

const TelemetryLayout: React.FC<TelemetryLayoutProps> = (props) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-slate-700/50 text-white' : 'text-slate-400 hover:bg-slate-800/50';
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-900 text-slate-200 relative">
      {/* Mobile menu button */}
      <button 
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-slate-800/80 text-cyan-400 lg:hidden"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isSidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <div 
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-800/90 backdrop-blur-sm border-r border-slate-700/50 p-4 flex flex-col transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="mb-8 p-2">
          <h1 className="text-xl font-bold text-cyan-400">Rocket Telemetry</h1>
          <p className="text-xs text-slate-400">Real-time monitoring system</p>
        </div>
        
        <nav className="space-y-1 flex-1">
          <Link 
            to="/telemetry/overview" 
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive('/telemetry/overview')}`}
            onClick={() => isMobile && setIsSidebarOpen(false)}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="truncate">Overview</span>
          </Link>
          
          <Link 
            to="/telemetry/trajectory" 
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive('/telemetry/trajectory')}`}
            onClick={() => isMobile && setIsSidebarOpen(false)}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="truncate">Trajectory</span>
          </Link>
          
          <Link 
            to="/telemetry/engine" 
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive('/telemetry/engine')}`}
            onClick={() => isMobile && setIsSidebarOpen(false)}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="truncate">Engine</span>
          </Link>
          
          <Link 
            to="/telemetry/systems" 
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive('/telemetry/systems')}`}
            onClick={() => isMobile && setIsSidebarOpen(false)}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">Systems</span>
          </Link>
        </nav>
        
        <div className="mt-auto pt-4 border-t border-slate-700/50">
          <Link 
            to="/simulation" 
            className="flex items-center px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg transition-colors"
            onClick={() => isMobile && setIsSidebarOpen(false)}
          >
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="truncate">Back to Simulation</span>
          </Link>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isSidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Main Content */}
      <main className={`flex-1 overflow-auto transition-all duration-300 min-h-full ${
        isSidebarOpen ? '' : ''
      }`}>
        <div className="min-h-full w-full p-4 md:p-6">
          <div className="max-w-full mx-auto">
            <Outlet context={{ isEngineRunning: props.isEngineRunning }} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TelemetryLayout;
