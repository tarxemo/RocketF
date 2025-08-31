// src/services/simulation.ts
import type { TelemetryData } from '../types/telemetry';

type SimulationOptions = {
  onTelemetryUpdate: (data: TelemetryData) => void;
  onError?: (error: Error) => void;
};

interface RocketStage {
  name: string;
  dryMass: number; // kg
  propellantMass: number; // kg
  thrust: number; // N
  specificImpulse: number; // seconds
  burnTime: number; // seconds
  separated: boolean;
}

interface AtmosphericData {
  density: number; // kg/m³
  pressure: number; // Pa
  temperature: number; // K
  windSpeed: number; // m/s
}

interface MissionPhase {
  name: string;
  startTime: number;
  endTime: number;
  description: string;
}

export class RocketSimulation {
  private running: boolean = false;
  private speed: number = 1;
  private currentTime: number = 0;
  private maxTime: number = 1200; // 20 minutes for orbital mission
  private intervalId: number | null = null;
  private trajectoryHistory: Array<{x: number, y: number, z: number}> = [];
  private options: SimulationOptions;
  
  // Rocket configuration
  private stages: RocketStage[] = [
    {
      name: "First Stage",
      dryMass: 22200, // kg (Falcon 9 first stage)
      propellantMass: 395700, // kg
      thrust: 7607000, // N (9 Merlin engines)
      specificImpulse: 282, // seconds (sea level)
      burnTime: 162, // seconds
      separated: false
    },
    {
      name: "Second Stage",
      dryMass: 4000, // kg
      propellantMass: 107500, // kg
      thrust: 934000, // N (1 Merlin Vacuum)
      specificImpulse: 348, // seconds (vacuum)
      burnTime: 397, // seconds
      separated: false
    }
  ];
  
  private payloadMass: number = 22800; // kg
  private currentStage: number = 0;
  private missionPhases: MissionPhase[] = [
    { name: "Pre-Launch", startTime: -300, endTime: 0, description: "Final checks and fueling" },
    { name: "Liftoff", startTime: 0, endTime: 10, description: "Engine ignition and initial ascent" },
    { name: "Max-Q", startTime: 60, endTime: 90, description: "Maximum dynamic pressure" },
    { name: "MECO", startTime: 162, endTime: 165, description: "Main Engine Cutoff" },
    { name: "Stage Separation", startTime: 165, endTime: 168, description: "First stage separation" },
    { name: "Second Stage Ignition", startTime: 168, endTime: 170, description: "Second stage engine start" },
    { name: "Fairing Separation", startTime: 210, endTime: 215, description: "Payload fairing jettison" },
    { name: "SECO-1", startTime: 565, endTime: 570, description: "Second Engine Cutoff" },
    { name: "Coast Phase", startTime: 570, endTime: 1800, description: "Coasting to apogee" },
    { name: "Payload Deployment", startTime: 1800, endTime: 1900, description: "Satellite deployment" }
  ];
  
  // Physics constants
  private readonly EARTH_RADIUS = 6371000; // m
  private readonly EARTH_MASS = 5.972e24; // kg
  private readonly G = 6.67430e-11; // m³/kg/s²
  private readonly EARTH_ROTATION_RATE = 7.2921159e-5; // rad/s
  
  // Launch site (Kennedy Space Center)
  private readonly LAUNCH_LAT = 28.5619; // degrees
  private readonly LAUNCH_LON = -80.5774; // degrees
  
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
    switch (command) {
      case 'start_engine':
        this.state.engineStatus = 'nominal';
        break;
      case 'stop_engine':
        this.state.engineStatus = 'shutdown';
        break;
      case 'separate_stage':
        if (this.state.currentStage === 1) {
          this.state.currentStage = 2;
          this.state.mass = this.stages[1].mass;
        }
        break;
      case 'deploy_payload':
        this.state.payloadDeployed = true;
        break;
      case 'abort':
        this.handleAbort();
        break;
      default:
        if (typeof command === 'string' && command.startsWith('emergency:')) {
          this.handleEmergencyCommand(command.substring(10));
        } else {
          console.log('Command received:', command);
        }
    }
  }

  private handleAbort(): void {
    this.state.engineStatus = 'shutdown';
    this.state.missionPhase = 'abort';
    this.state.thrust = 0;
    this.state.acceleration = { x: 0, y: -9.81, z: 0 }; // Only gravity
    this.isRunning = false;
    console.log('Mission aborted');
  }

  private handleEmergencyCommand(action: string): void {
    const [scenarioId, actionType] = action.split(': ');
    
    switch (scenarioId) {
      case 'engine_failure':
        if (actionType === 'Switch to Backup Engine') {
          this.state.engineStatus = 'backup';
          this.state.thrust *= 0.8; // Reduced thrust on backup
        } else if (actionType === 'Emergency Landing') {
          this.state.missionPhase = 'emergency_landing';
          this.state.thrust *= 0.3; // Minimal thrust for controlled descent
        }
        break;
      case 'fuel_leak':
        if (actionType === 'Isolate Fuel Lines') {
          this.state.fuel = Math.max(this.state.fuel * 0.9, 5); // Stop leak, retain 90%
        }
        break;
      case 'guidance_failure':
        if (actionType === 'Switch to Backup Guidance') {
          // Simulate guidance system switch
          this.state.orientation.pitch += (Math.random() - 0.5) * 2; // Small deviation
        }
        break;
      case 'structural_stress':
        if (actionType === 'Reduce Thrust') {
          this.state.thrust *= 0.7; // Reduce thrust to 70%
        }
        break;
      default:
        console.log(`Emergency action executed: ${action}`);
    }
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
    
    // Calculate current mission phase
    const currentPhase = this.getCurrentMissionPhase(t);
    
    // Calculate rocket state
    const rocketState = this.calculateRocketPhysics(t);
    
    // Calculate atmospheric conditions
    const atmosphere = this.calculateAtmosphere(rocketState.altitude);
    
    // Calculate current stage and engine status
    const engineData = this.calculateEngineData(t, rocketState);
    
    // Calculate orbital parameters
    const orbitalData = this.calculateOrbitalParameters(rocketState);
    
    // Generate comprehensive telemetry data
    const telemetry: TelemetryData = {
      timestamp: t,
      maxSimulationTime: this.maxTime,
      position: {
        x: rocketState.position.x,
        y: rocketState.position.y,
        z: rocketState.position.z,
        lat: rocketState.latitude,
        lon: rocketState.longitude
      },
      velocity: {
        x: rocketState.velocity.x,
        y: rocketState.velocity.y,
        z: rocketState.velocity.z,
        total: rocketState.velocityMagnitude
      },
      acceleration: {
        x: rocketState.acceleration.x,
        y: rocketState.acceleration.y,
        z: rocketState.acceleration.z,
        total: rocketState.accelerationMagnitude
      },
      orientation: {
        pitch: rocketState.orientation.pitch,
        yaw: rocketState.orientation.yaw,
        roll: rocketState.orientation.roll
      },
      engine: engineData,
      staging: {
        currentStage: this.currentStage + 1,
        totalStages: this.stages.length,
        readyForSeparation: this.isReadyForStageSeparation(t)
      },
      payload: {
        status: this.getPayloadStatus(t),
        readyForDeployment: this.isReadyForPayloadDeployment(t)
      },
      structural: {
        stress: this.calculateStructuralStress(rocketState, atmosphere),
        vibration: this.calculateVibration(rocketState, engineData)
      },
      trajectory: {
        deviation: this.calculateTrajectoryDeviation(rocketState),
        targetApogee: orbitalData.targetApogee,
        currentApogee: orbitalData.currentApogee
      },
      avionics: {
        status: this.getAvionicsStatus(rocketState),
        cpuLoad: 0.3 + Math.random() * 0.2 + (engineData.status === 'RUNNING' ? 0.2 : 0),
        memoryUsage: 0.4 + Math.random() * 0.1 + (t / this.maxTime) * 0.3
      },
      telemetry: {
        status: this.getTelemetryStatus(rocketState),
        uplinkRate: this.calculateUplinkRate(rocketState.altitude),
        downlinkRate: this.calculateDownlinkRate(rocketState.altitude)
      },
      environment: {
        externalTemperature: atmosphere.temperature,
        externalPressure: atmosphere.pressure
      },
      trajectoryHistory: this.trajectoryHistory,
      missionPhase: currentPhase,
      orbitalParameters: orbitalData
    };
    
    // Update trajectory history (sample every second)
    if (Math.floor(t) !== Math.floor(this.trajectoryHistory.length)) {
      this.trajectoryHistory.push({
        x: rocketState.position.x,
        y: rocketState.position.y,
        z: rocketState.position.z
      });
    }
    
    this.options.onTelemetryUpdate(telemetry);
  }

  private getCurrentMissionPhase(time: number): MissionPhase {
    return this.missionPhases.find(phase => 
      time >= phase.startTime && time <= phase.endTime
    ) || this.missionPhases[0];
  }

  private calculateRocketPhysics(time: number) {
    // Initialize state
    let position = { x: 0, y: 0, z: 0 };
    let velocity = { x: 0, y: 0, z: 0 };
    let acceleration = { x: 0, y: 0, z: 0 };
    let mass = this.getTotalMass(time);
    let altitude = 0;

    // Simplified physics integration for demonstration
    // In reality, this would use numerical integration (RK4, etc.)
    if (time > 0) {
      const currentStage = this.getCurrentStage(time);
      const thrust = this.getCurrentThrust(time);
      const atmosphere = this.calculateAtmosphere(altitude);
      
      // Calculate forces
      const gravity = this.calculateGravity(altitude);
      const drag = this.calculateDrag(velocity, atmosphere);
      
      // Net acceleration
      const thrustAccel = thrust / mass;
      const gravityAccel = gravity;
      const dragAccel = drag / mass;
      
      acceleration.y = thrustAccel - gravityAccel - dragAccel;
      
      // Simple integration for altitude and velocity
      velocity.y = acceleration.y * time;
      altitude = 0.5 * acceleration.y * time * time;
      position.y = altitude;
      
      // Add some lateral movement for realistic trajectory
      const pitchProgram = this.calculatePitchProgram(time);
      position.x = Math.sin(pitchProgram) * altitude * 0.1;
      velocity.x = Math.sin(pitchProgram) * velocity.y * 0.1;
    }

    // Calculate geographic coordinates
    const { latitude, longitude } = this.calculateGeographicPosition(position, time);
    
    // Calculate orientation
    const orientation = this.calculateOrientation(time, velocity);
    
    return {
      position,
      velocity,
      acceleration,
      altitude,
      latitude,
      longitude,
      orientation,
      mass,
      velocityMagnitude: Math.sqrt(velocity.x**2 + velocity.y**2 + velocity.z**2),
      accelerationMagnitude: Math.sqrt(acceleration.x**2 + acceleration.y**2 + acceleration.z**2)
    };
  }

  private calculateAtmosphere(altitude: number): AtmosphericData {
    // Standard atmosphere model
    const seaLevelPressure = 101325; // Pa
    const seaLevelTemperature = 288.15; // K
    const seaLevelDensity = 1.225; // kg/m³
    const scaleHeight = 8500; // m
    
    const pressure = seaLevelPressure * Math.exp(-altitude / scaleHeight);
    const temperature = seaLevelTemperature - 0.0065 * Math.min(altitude, 11000);
    const density = pressure / (287.05 * temperature);
    
    return {
      pressure,
      temperature,
      density,
      windSpeed: Math.random() * 20 // Simplified wind model
    };
  }

  private calculateEngineData(time: number, rocketState: any) {
    const currentStage = this.getCurrentStage(time);
    const stage = this.stages[currentStage];
    
    if (!stage || this.isEngineShutdown(time)) {
      return {
        status: 'OFF' as const,
        thrust: 0,
        maxThrust: stage?.thrust || 0,
        chamberPressure: 0,
        maxChamberPressure: 20,
        turbineSpeed: 0,
        maxTurbineSpeed: 50000,
        fuel: stage?.propellantMass * 0.7 || 0,
        initialFuel: stage?.propellantMass * 0.7 || 0,
        oxidizer: stage?.propellantMass * 0.3 || 0,
        initialOxidizer: stage?.propellantMass * 0.3 || 0,
        fuelFlowRate: 0,
        temperature: 300
      };
    }

    const stageStartTime = this.getStageStartTime(currentStage);
    const burnTime = time - stageStartTime;
    const burnProgress = Math.min(burnTime / stage.burnTime, 1);
    
    const fuelRemaining = stage.propellantMass * 0.7 * (1 - burnProgress);
    const oxidizerRemaining = stage.propellantMass * 0.3 * (1 - burnProgress);
    
    return {
      status: 'RUNNING' as const,
      thrust: stage.thrust * (0.9 + Math.random() * 0.1), // Add some variation
      maxThrust: stage.thrust,
      chamberPressure: 15 + Math.random() * 3,
      maxChamberPressure: 20,
      turbineSpeed: 35000 + Math.random() * 10000,
      maxTurbineSpeed: 50000,
      fuel: Math.max(0, fuelRemaining),
      initialFuel: stage.propellantMass * 0.7,
      oxidizer: Math.max(0, oxidizerRemaining),
      initialOxidizer: stage.propellantMass * 0.3,
      fuelFlowRate: stage.propellantMass / stage.burnTime,
      temperature: 300 + 2000 * burnProgress
    };
  }

  private calculateOrbitalParameters(rocketState: any) {
    const r = this.EARTH_RADIUS + rocketState.altitude;
    const v = rocketState.velocityMagnitude;
    
    // Simplified orbital calculations
    const specificEnergy = (v * v) / 2 - (this.G * this.EARTH_MASS) / r;
    const semiMajorAxis = -(this.G * this.EARTH_MASS) / (2 * specificEnergy);
    const apogee = Math.max(0, 2 * semiMajorAxis - r - this.EARTH_RADIUS);
    
    return {
      targetApogee: 400000, // 400 km target orbit
      currentApogee: apogee,
      perigee: Math.max(0, r - this.EARTH_RADIUS),
      inclination: 51.6, // ISS inclination
      eccentricity: Math.max(0, 1 + (2 * specificEnergy * r * r) / (this.G * this.EARTH_MASS))
    };
  }

  // Helper methods
  private getCurrentStage(time: number): number {
    let stageTime = 0;
    for (let i = 0; i < this.stages.length; i++) {
      if (time <= stageTime + this.stages[i].burnTime + 5) { // +5s for separation
        return i;
      }
      stageTime += this.stages[i].burnTime + 5;
    }
    return this.stages.length - 1;
  }

  private getStageStartTime(stageIndex: number): number {
    let startTime = 0;
    for (let i = 0; i < stageIndex; i++) {
      startTime += this.stages[i].burnTime + 5; // +5s for separation
    }
    return startTime;
  }

  private getCurrentThrust(time: number): number {
    const stage = this.stages[this.getCurrentStage(time)];
    return this.isEngineShutdown(time) ? 0 : stage.thrust;
  }

  private isEngineShutdown(time: number): boolean {
    const stageIndex = this.getCurrentStage(time);
    const stageStartTime = this.getStageStartTime(stageIndex);
    const burnTime = time - stageStartTime;
    return burnTime > this.stages[stageIndex].burnTime;
  }

  private getTotalMass(time: number): number {
    let totalMass = this.payloadMass;
    
    for (let i = 0; i < this.stages.length; i++) {
      const stage = this.stages[i];
      const stageStartTime = this.getStageStartTime(i);
      
      if (time < stageStartTime) {
        // Stage hasn't started, full mass
        totalMass += stage.dryMass + stage.propellantMass;
      } else if (time < stageStartTime + stage.burnTime) {
        // Stage is burning
        const burnProgress = (time - stageStartTime) / stage.burnTime;
        const propellantRemaining = stage.propellantMass * (1 - burnProgress);
        totalMass += stage.dryMass + propellantRemaining;
      } else if (i === this.getCurrentStage(time)) {
        // Stage burned out but not separated
        totalMass += stage.dryMass;
      }
      // Separated stages don't contribute to mass
    }
    
    return totalMass;
  }

  private calculateGravity(altitude: number): number {
    const r = this.EARTH_RADIUS + altitude;
    return (this.G * this.EARTH_MASS) / (r * r);
  }

  private calculateDrag(velocity: any, atmosphere: AtmosphericData): number {
    const dragCoefficient = 0.3;
    const referenceArea = 10; // m²
    const velocityMagnitude = Math.sqrt(velocity.x**2 + velocity.y**2 + velocity.z**2);
    return 0.5 * atmosphere.density * velocityMagnitude * velocityMagnitude * dragCoefficient * referenceArea;
  }

  private calculatePitchProgram(time: number): number {
    // Simplified gravity turn
    if (time < 10) return 0; // Vertical ascent
    if (time < 60) return (time - 10) / 50 * (Math.PI / 6); // Gradual turn
    return Math.PI / 6; // 30 degree pitch
  }

  private calculateGeographicPosition(position: any, time: number) {
    // Simplified geographic calculation
    const earthRotation = this.EARTH_ROTATION_RATE * time;
    const latitude = this.LAUNCH_LAT + (position.y / this.EARTH_RADIUS) * (180 / Math.PI);
    const longitude = this.LAUNCH_LON + earthRotation * (180 / Math.PI) + 
                     (position.x / this.EARTH_RADIUS) * (180 / Math.PI);
    
    return { latitude, longitude };
  }

  private calculateOrientation(time: number, velocity: any) {
    const pitch = this.calculatePitchProgram(time);
    const yaw = Math.atan2(velocity.x, velocity.y);
    const roll = Math.sin(time * 0.1) * 0.05; // Small roll oscillation
    
    return { pitch, yaw, roll };
  }

  private isReadyForStageSeparation(time: number): boolean {
    const stageIndex = this.getCurrentStage(time);
    const stageStartTime = this.getStageStartTime(stageIndex);
    const burnTime = time - stageStartTime;
    return burnTime >= this.stages[stageIndex].burnTime && 
           burnTime < this.stages[stageIndex].burnTime + 2;
  }

  private getPayloadStatus(time: number): 'SECURED' | 'DEPLOYING' | 'DEPLOYED' {
    if (time < 1800) return 'SECURED';
    if (time < 1900) return 'DEPLOYING';
    return 'DEPLOYED';
  }

  private isReadyForPayloadDeployment(time: number): boolean {
    return time >= 1800 && time < 1810;
  }

  private calculateStructuralStress(rocketState: any, atmosphere: AtmosphericData): number {
    const dynamicPressure = 0.5 * atmosphere.density * rocketState.velocityMagnitude**2;
    const maxQ = 35000; // Pa, typical max-Q value
    return Math.min(1, dynamicPressure / maxQ);
  }

  private calculateVibration(rocketState: any, engineData: any): number {
    const baseVibration = engineData.status === 'RUNNING' ? 0.3 : 0.05;
    const altitudeEffect = Math.exp(-rocketState.altitude / 50000) * 0.2;
    return Math.min(1, baseVibration + altitudeEffect + Math.random() * 0.1);
  }

  private calculateTrajectoryDeviation(rocketState: any): number {
    // Simplified trajectory deviation calculation
    return Math.random() * 0.02 + Math.sin(rocketState.altitude / 10000) * 0.01;
  }

  private getAvionicsStatus(rocketState: any): 'NOMINAL' | 'DEGRADED' | 'FAILED' {
    if (rocketState.altitude > 100000 && Math.random() < 0.01) return 'DEGRADED';
    return 'NOMINAL';
  }

  private getTelemetryStatus(rocketState: any): 'NOMINAL' | 'DEGRADED' | 'FAILED' {
    if (rocketState.altitude > 200000 && Math.random() < 0.005) return 'DEGRADED';
    return 'NOMINAL';
  }

  private calculateUplinkRate(altitude: number): number {
    const baseRate = 1000;
    const distanceFactor = Math.max(0.1, 1 - altitude / 500000);
    return baseRate * distanceFactor;
  }

  private calculateDownlinkRate(altitude: number): number {
    const baseRate = 10000;
    const distanceFactor = Math.max(0.1, 1 - altitude / 500000);
    return baseRate * distanceFactor;
  }

  cleanup() {
    this.pause();
  }
}