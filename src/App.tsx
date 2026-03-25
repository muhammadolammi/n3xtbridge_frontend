import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // <--- Import your provider
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import F404Page from './pages/404';
import InvoiceCreator from './pages/InvoiceCreator';
import PromotionalPage from './pages/PromotionalPage';
import { SignUp } from './pages/SignUp';
import { SignIn } from './pages/SignIn';
import InvoiceViewer from './pages/InvoiceViewer';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* 1. Wrap the app in the AuthProvider */}
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="about-us" element={<AboutUs />} />

            <Route path="promotional" element={<PromotionalPage />} />

            {/* These components now have access to useAuth() */}
            <Route path="signup" element={<SignUp />} />
            <Route path="signin" element={<SignIn />} />

          </Route>

          <Route path="/dashboard" element={<MainLayout />}>
            <Route index element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            {/* Use unique paths to avoid confusion */}
            <Route path="create-invoice" element={
              <ProtectedRoute allowedRoles={["staff", "admin"]}>
                <InvoiceCreator />
              </ProtectedRoute>
            } />
            <Route path="view-invoice/:id" element={
              <ProtectedRoute allowedRoles={["staff", "admin", "user"]}>
                <InvoiceViewer />
              </ProtectedRoute>
            } />
          </Route>



          <Route path="*" element={<F404Page />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;