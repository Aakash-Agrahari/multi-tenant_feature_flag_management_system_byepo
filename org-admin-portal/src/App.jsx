import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Overview from './pages/Overview.jsx';
import Flags from './pages/Flags.jsx';
import AuditLogs from './pages/AuditLogs.jsx';
import EndUsers from './pages/EndUsers.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Overview />} />
      <Route path="flags" element={<Flags />} />
      <Route path="audit-logs" element={<AuditLogs />} />
      <Route path="end-users" element={<EndUsers />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
