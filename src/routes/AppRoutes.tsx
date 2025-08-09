import { Routes, Route } from 'react-router-dom';
import SimulationPage from '../pages/SimulationPage';
import RocketLaunchPage from '../pages/RocketLaunchPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RocketLaunchPage />} />
      <Route path="/rocket-controls" element={<SimulationPage />} />
    </Routes>
  );
};

export default AppRoutes;