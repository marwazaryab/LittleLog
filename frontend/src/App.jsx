import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TimelineProvider } from './context/TimelineContext';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import TimelinePage from './pages/TimelinePage';
import './App.css';

function App() {
  return (
    <TimelineProvider>
      <Router>
        <div className="app">
          <Sidebar /> 
          <div className="app-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/timeline" element={<TimelinePage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </TimelineProvider>
  );
}

export default App;