import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import BenchmarkResults from './pages/BenchmarkResults';
import ModelComparison from './pages/ModelComparison';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function RedirectRoot() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<RedirectRoot />} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/projects" element={<PageTransition><Projects /></PageTransition>} />
            <Route path="/projects/:projectId" element={<PageTransition><ProjectDetail /></PageTransition>} />
            <Route path="/benchmarks/:benchmarkId/results" element={<PageTransition><BenchmarkResults /></PageTransition>} />
            <Route path="/benchmarks/:benchmarkId/compare" element={<PageTransition><ModelComparison /></PageTransition>} />
            <Route path="/leaderboard" element={<PageTransition><Leaderboard /></PageTransition>} />
            <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  );
}
