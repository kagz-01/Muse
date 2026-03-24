import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import React, { Suspense } from 'react';

// Skeletons / Shell
const Layout = React.lazy(() => import('./components/layout/Layout'));

// Pages
const Landing = React.lazy(() => import('./pages/Landing'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const RoomDetail = React.lazy(() => import('./pages/RoomDetail'));
const Threads = React.lazy(() => import('./pages/Threads'));
const Journal = React.lazy(() => import('./pages/Journal'));
const Mirror = React.lazy(() => import('./pages/Mirror'));
const Create = React.lazy(() => import('./pages/Create'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Auth = React.lazy(() => import('./pages/Auth'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white font-medium tracking-tight">Loading Muse...</div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/rooms/:id" element={<RoomDetail />} />
            <Route path="/threads" element={<Threads />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/mirror" element={<Mirror />} />
            <Route path="/create" element={<Create />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
