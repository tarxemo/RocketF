import { Routes, Route } from 'react-router-dom';
import type { FC } from 'react';
import SimulationPage from '../pages/SimulationPage';
import RocketLaunchPage from '../pages/RocketLaunchPage';
import TelemetryLayout from '../layouts/TelemetryLayout';
import TelemetryOverview from '../pages/telemetry/TelemetryOverview';
import TrajectoryPage from '../pages/telemetry/TrajectoryPage';
import EnginePage from '../pages/telemetry/EnginePage';
import SystemsPage from '../pages/telemetry/SystemsPage';

interface AppRoutesProps {
  isEngineRunning: boolean;
}

const AppRoutes: FC<AppRoutesProps> = ({ isEngineRunning }) => {
  return (
    <Routes>
      <Route path="/" element={<RocketLaunchPage />} />
      <Route path="/rocket-controls" element={<SimulationPage />} />
      
      {/* Telemetry Dashboard Routes */}
      <Route path="/telemetry" element={<TelemetryLayout isEngineRunning={isEngineRunning} />}>
        <Route index element={<TelemetryOverview />} />
        <Route path="overview" element={<TelemetryOverview />} />
        <Route path="trajectory" element={<TrajectoryPage />} />
        <Route path="engine" element={<EnginePage />} />
        <Route path="systems" element={<SystemsPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;