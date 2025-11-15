import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import UserForm from './pages/UserForm';

function App() {
  const [count, setCount] = useState(0)

return (
    <>
      <BrowserRouter>
        <div className="app-container">
          <Sidebar />
          <Routes>
            <Route path = "/" element = {<Home/>} />
            <Route path="/profile" element={<UserForm />} />
          </Routes>
        </div>
      
      </BrowserRouter>
    </>
  )
}

export default App
