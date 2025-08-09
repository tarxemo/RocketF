// src/services/simulation.ts
import type { TelemetryData } from '../types/telemetry';

type SimulationOptions = {
  onTelemetryUpdate: (data: TelemetryData) => void;
  onError?: (error: Error) => void;
};

export class RocketSimulation {
  private running: boolean = false;
  private speed: number = 1;
  private currentTime: number = 0;
  private maxTime: number = 600; // 10 minutes
  private intervalId: number | null = null;
  private trajectoryHistory: Array<{x: number, y: number, z: number}> = [];
  private options: SimulationOptions;
  
  constructor(options: SimulationOptions) {
    this.options = options;
  }

  start() {
    if (this.running) return;
    this.running = true;
    
    const updateInterval = 100; // ms
    this.intervalId = window.setInterval(() => this.update(), updateInterval);
  }

  pause() {
    if (!this.running) return;
    this.running = false;
    
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setTime(time: number) {
    this.currentTime = Math.max(0, Math.min(time, this.maxTime));
    this.generateTelemetry();
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  sendCommand(command: any) {
    // In a real implementation, this would affect the simulation
    console.log('Command received:', command);
  }

  private update() {
    if (!this.running) return;
    
    this.currentTime += 0.1 * this.speed;
    if (this.currentTime >= this.maxTime) {
      this.pause();
      this.currentTime = this.maxTime;
    }
    
    this.generateTelemetry();
  }

  private generateTelemetry() {
    const t = this.currentTime;
    
    // Simple rocket physics simulation
    const gravity = 9.81;
    const maxThrust = 7.5e6; // Newtons (e.g., Falcon 9 first stage)
    const massInitial = 500000; // kg
    const massFinal = 100000; // kg
    const burnTime = 180; // seconds
    
    // Calculate current mass (linear burn)
    const mass = t < burnTime 
      ? massInitial - (massInitial - massFinal) * (t / burnTime)
      : massFinal;
    
    // Calculate thrust (full thrust for first stage)
    const thrust = t < burnTime ? maxThrust : 0;
    
    // Calculate acceleration (F=ma)
    const acceleration = (thrust - mass * gravity) / mass;
    
    // Calculate velocity (integrate acceleration)
    const velocity = acceleration * t;
    
    // Calculate altitude (integrate velocity)
    const altitude = 0.5 * acceleration * t * t;
    
    // Generate telemetry data
    const telemetry: TelemetryData = {
      timestamp: t,
      maxSimulationTime: this.maxTime,
      position: {
        x: 0,
        y: altitude,
        z: 0,
        lat: 28.5619 + (t / this.maxTime) * 5, // Approximate launch to orbit
        lon: -80.5774 // Kennedy Space Center
      },
      velocity: {
        x: 0,
        y: velocity,
        z: 0,
        total: velocity
      },
      acceleration: {
        x: 0,
        y: acceleration,
        z: 0,
        total: acceleration
      },
      orientation: {
        pitch: Math.sin(t * 0.05) * 0.1, // Small oscillation
        yaw: 0,
        roll: 0
      },
      engine: {
        status: t < burnTime ? 'RUNNING' : 'OFF',
        thrust,
        maxThrust,
        chamberPressure: t < burnTime ? 10 + Math.random() * 2 : 0,
        maxChamberPressure: 15,
        turbineSpeed: t < burnTime ? 30000 + Math.random() * 5000 : 0,
        maxTurbineSpeed: 40000,
        fuel: Math.max(0, massInitial - (massInitial - massFinal) * (t / burnTime)),
        initialFuel: massInitial - massFinal,
        oxidizer: Math.max(0, (massInitial - massFinal) * 0.7 * (1 - t / burnTime)),
        initialOxidizer: (massInitial - massFinal) * 0.7,
        fuelFlowRate: t < burnTime ? (massInitial - massFinal) / burnTime : 0,
        temperature: 300 + (t < burnTime ? 2000 * (t / burnTime) : 0)
      },
      staging: {
        currentStage: t < 180 ? 1 : 2,
        totalStages: 2,
        readyForSeparation: t >= 180 && t < 181
      },
      payload: {
        status: t < 500 ? 'SECURED' : 'DEPLOYED',
        readyForDeployment: t >= 500 && t < 501
      },
      structural: {
        stress: Math.min(1, 0.1 + t / this.maxTime * 0.5 + Math.random() * 0.1),
        vibration: Math.random() * 0.2
      },
      trajectory: {
        deviation: Math.random() * 0.05,
        targetApogee: 200000, // meters
        currentApogee: altitude
      },
      avionics: {
        status: 'NOMINAL',
        cpuLoad: 0.3 + Math.random() * 0.2,
        memoryUsage: 0.4 + Math.random() * 0.1
      },
      telemetry: {
        status: 'NOMINAL',
        uplinkRate: 1000,
        downlinkRate: 10000
      },
      environment: {
        externalTemperature: 300 - altitude / 500, // Rough atmospheric model
        externalPressure: 101325 * Math.exp(-altitude / 8500) // Barometric formula
      },
      trajectoryHistory: this.trajectoryHistory
    };
    
    // Update trajectory history (sample every second)
    if (Math.floor(t) !== Math.floor(this.trajectoryHistory.length)) {
      this.trajectoryHistory.push({
        x: 0,
        y: altitude,
        z: 0
      });
    }
    
    this.options.onTelemetryUpdate(telemetry);
  }

  cleanup() {
    this.pause();
  }
}