import { useState, useEffect } from 'react';
import type { TelemetryData } from '../types/telemetry';

// Mock data generator for development
const generateMockData = (): TelemetryData => {
  const now = Date.now();
  const time = now % 60000 / 1000; // 0-60 seconds
  const altitude = 50000 + Math.sin(time) * 1000;
  const speed = 1000 + Math.sin(time * 2) * 100;
  
  return {
    timestamp: now,
    maxSimulationTime: 600,
    position: {
      x: Math.sin(time * 0.1) * 1000,
      y: altitude,
      z: Math.cos(time * 0.1) * 1000,
      lat: 28.3922 + (Math.random() - 0.5) * 0.001,
      lon: -80.6077 + (Math.random() - 0.5) * 0.001
    },
    velocity: {
      x: Math.sin(time * 0.2) * 50,
      y: speed,
      z: Math.cos(time * 0.2) * 50,
      total: speed * 1.1
    },
    acceleration: {
      x: 0,
      y: 0,
      z: 0,
      total: 0
    },
    orientation: {
      pitch: Math.sin(time * 0.05) * 0.1,
      yaw: time * 0.1,
      roll: Math.sin(time * 0.03) * 0.05
    },
    engine: {
      status: 'RUNNING',
      thrust: 2000000 + Math.sin(time) * 100000,
      maxThrust: 2500000,
      chamberPressure: 10 + Math.sin(time * 2) * 2,
      maxChamberPressure: 20,
      turbineSpeed: 30000 + Math.sin(time * 3) * 5000,
      maxTurbineSpeed: 50000,
      fuel: 100000 - (time * 1000) % 100000,
      initialFuel: 100000,
      oxidizer: 200000 - (time * 2000) % 200000,
      initialOxidizer: 200000,
      fuelFlowRate: 100 + Math.sin(time) * 20,
      temperature: 2500 + Math.sin(time) * 500
    },
    staging: {
      currentStage: 1,
      totalStages: 2,
      readyForSeparation: false
    },
    payload: {
      status: 'SECURED',
      readyForDeployment: false
    },
    structural: {
      stress: 0.3 + Math.sin(time * 0.5) * 0.1,
      vibration: 0.2 + Math.sin(time * 0.7) * 0.1
    },
    trajectory: {
      deviation: 0.05 + Math.sin(time * 0.3) * 0.03,
      targetApogee: 100000,
      currentApogee: altitude
    },
    avionics: {
      status: 'NOMINAL',
      cpuLoad: 30 + Math.sin(time * 2) * 10,
      memoryUsage: 40 + Math.sin(time * 1.5) * 15
    },
    telemetry: {
      status: 'NOMINAL',
      uplinkRate: 1000000,
      downlinkRate: 5000000
    },
    environment: {
      externalTemperature: 200 + Math.sin(time * 0.2) * 10,
      externalPressure: 1000 - (altitude / 100000) * 900
    },
    trajectoryHistory: [],
    missionPhase: 'ASCENT',
    orbitalParameters: {
      targetApogee: 200000,
      currentApogee: altitude,
      perigee: 0,
      inclination: 28.5,
      eccentricity: 0.1
    }
  };
};

const useTelemetry = () => {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // In a real app, this would connect to a WebSocket or other real-time data source
  useEffect(() => {
    let isMounted = true;
    let animationFrameId: number;
    
    const updateData = () => {
      if (!isMounted) return;
      
      try {
        const newData = generateMockData();
        setData(newData);
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update telemetry data'));
        setIsConnected(false);
      }
      
      animationFrameId = requestAnimationFrame(updateData);
    };
    
    // Initial data load
    updateData();
    
    // Cleanup
    return () => {
      isMounted = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return {
    data,
    isConnected,
    error,
    lastUpdated: data?.timestamp || null
  };
};

export default useTelemetry;
