import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import CreateEvent from './pages/CreateEvent';
import ViewEvent from './pages/ViewEvent';
import PastEvents from './pages/PastEvents';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="create" element={<CreateEvent />} />
          <Route path="event/:eventId" element={<ViewEvent />} />
          <Route path="past" element={<PastEvents />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
