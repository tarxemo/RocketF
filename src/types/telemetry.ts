// src/types/telemetry.ts
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Orientation {
  pitch: number; // radians
  yaw: number;   // radians
  roll: number;  // radians
}

export interface EngineData {
  status: 'OFF' | 'STARTING' | 'RUNNING' | 'SHUTTING_DOWN' | 'FAILED';
  thrust: number; // Newtons
  maxThrust: number;
  chamberPressure: number; // MPa
  maxChamberPressure: number;
  turbineSpeed: number; // RPM
  maxTurbineSpeed: number;
  fuel: number; // kg
  initialFuel: number;
  oxidizer: number; // kg
  initialOxidizer: number;
  fuelFlowRate: number; // kg/s
  temperature: number; // Kelvin
}

export interface StagingData {
  currentStage: number;
  totalStages: number;
  readyForSeparation: boolean;
}

export interface PayloadData {
  status: 'SECURED' | 'DEPLOYING' | 'DEPLOYED';
  readyForDeployment: boolean;
}

export interface StructuralData {
  stress: number; // 0-1
  vibration: number; // 0-1
}

export interface TrajectoryData {
  deviation: number; // 0-1
  targetApogee: number; // meters
  currentApogee: number; // meters
}

export interface AvionicsData {
  status: 'NOMINAL' | 'DEGRADED' | 'FAILED';
  cpuLoad: number; // 0-1
  memoryUsage: number; // 0-1
}

export interface MissionPhase {
  name: string;
  startTime: number;
  endTime: number;
  description: string;
}

export interface OrbitalParameters {
  targetApogee: number; // meters
  currentApogee: number; // meters
  perigee: number; // meters
  inclination: number; // degrees
  eccentricity: number;
}

export interface TelemetryData {
  timestamp: number; // seconds since launch
  maxSimulationTime: number;
  position: Vector3D & { lat: number; lon: number };
  velocity: Vector3D & { total: number };
  acceleration: Vector3D & { total: number };
  orientation: Orientation;
  engine: EngineData;
  staging: StagingData;
  payload: PayloadData;
  structural: StructuralData;
  trajectory: TrajectoryData;
  avionics: AvionicsData;
  telemetry: {
    status: 'NOMINAL' | 'DEGRADED' | 'FAILED';
    uplinkRate: number; // bps
    downlinkRate: number; // bps
  };
  environment: {
    externalTemperature: number; // Kelvin
    externalPressure: number; // Pa
  };
  trajectoryHistory: Vector3D[];
  missionPhase: string;
  orbitalParameters: OrbitalParameters;
}