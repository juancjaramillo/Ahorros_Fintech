import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing         from './components/Landing';
import AdminLogin      from './components/AdminLogin';
import ClientLogin     from './components/ClientLogin';
import AdminDashboard  from './components/AdminDashboard';
import ClientDashboard from './components/ClientDashboard';

function RequireAuth({ children, redirectTo }) {
  return localStorage.getItem('token')
    ? children
    : <Navigate to={redirectTo} />;
}

export default function App() {
  return (
    <div className="container py-4">
      <Routes>
        <Route path="/"             element={<Landing />} />
        <Route path="/admin-login"  element={<AdminLogin />} />
        <Route path="/client-login" element={<ClientLogin />} />

        <Route path="/admin" element={
          <RequireAuth redirectTo="/admin-login">
            <AdminDashboard />
          </RequireAuth>
        }/>

        <Route path="/client" element={
          <RequireAuth redirectTo="/client-login">
            <ClientDashboard />
          </RequireAuth>
        }/>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
