import { Routes, Route } from 'react-router-dom';
import SimulationPage from '../pages/SimulationPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<SimulationPage />} />
    </Routes>
  );
};

export default AppRoutes;