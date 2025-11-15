import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import TimelinePage from './pages/TimelinePage';
import { TimelineProvider } from './context/TimelineContext';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <TimelineProvider>
          <div className="app-container">
            <Sidebar />
            <Routes>
              <Route path = "/" element = {<Home/>} />
              <Route path = "/timeline" element = {<TimelinePage/>} />
            </Routes>
          </div>
        </TimelineProvider>
      </BrowserRouter>
    </>
  )
}

export default App
