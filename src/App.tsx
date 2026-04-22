import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // <--- Import your provider
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import F404Page from './pages/404';
import InvoiceCreator from './pages/InvoiceCreator';
import PromotionalPage from './pages/Promotion';
import { SignUp } from './pages/SignUp';
import { SignIn } from './pages/SignIn';
import InvoiceViewer from './pages/InvoiceViewer';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import QuoteViewer from './pages/QuoteViewer';
import QuoteRequestViewer from './pages/QuoteRequestViewer';
import PaymentSuccess from './pages/PaymentSuccess';
import ServiceDetail from './pages/Service';
import PublicInvoiceViewer from './pages/PublicInvoiceViewer';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* 1. Wrap the app in the AuthProvider */}
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="about-us" element={<AboutUs />} />

            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />


            <Route path="promotions/:promo_code" element={<PromotionalPage />} />

            {/* These components now have access to useAuth() */}
            <Route path="signup" element={<SignUp />} />
            <Route path="signin" element={<SignIn />} />
            <Route path="services" element={<Services />} />
            <Route path="services/:id" element={<ServiceDetail />} />
            <Route path="payment-success" element={
              <PaymentSuccess />
            } />
            <Route path="invoice/:id" element={
              <PublicInvoiceViewer />
            } />



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
            <Route path="invoice/:id" element={
              <ProtectedRoute >
                <InvoiceViewer />
              </ProtectedRoute>
            } />
            <Route path="quote/:id" element={
              <ProtectedRoute >
                <QuoteViewer />
              </ProtectedRoute>
            } />
            <Route path="qr/:id" element={
              <ProtectedRoute >
                <QuoteRequestViewer />
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