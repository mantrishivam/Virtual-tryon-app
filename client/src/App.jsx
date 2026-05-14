import { Routes, Route } from 'react-router-dom';
import LandingPage   from './pages/LandingPage';
import HairTryOnPage from './pages/HairTryOnPage';
import NailTryOnPage from './pages/NailTryOnPage';

export default function App() {
  return (
    <Routes>
      <Route path="/"     element={<LandingPage />} />
      <Route path="/hair" element={<HairTryOnPage />} />
      <Route path="/nail" element={<NailTryOnPage />} />
    </Routes>
  );
}
