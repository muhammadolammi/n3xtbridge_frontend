import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import F404Page from './pages/404';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Dashboard / Home */}
          <Route index element={<Home />} />

          {/* About Us */}
          <Route path="about-us" element={<AboutUs />} />

          {/* You can add more here later: /services, /contact, etc. */}
        </Route>
        <Route path="*" element={
          < F404Page />
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;