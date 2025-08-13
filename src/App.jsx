import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ConfirmEmail from './pages/ConfirmEmail';
import Profile from './pages/Profile';
import CreateEvent from './pages/CreateEvent';
import ViewEvent from './pages/ViewEvent';
import PastEvents from './pages/PastEvents';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Invite from './pages/Invite';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            <Route path="/invite/:eventId" element={<Invite />} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Home />} />
              <Route path="create" element={<CreateEvent />} />
              <Route path="event/:eventId" element={<ViewEvent />} />
              <Route path="past" element={<PastEvents />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            {/* Public legal pages */}
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
