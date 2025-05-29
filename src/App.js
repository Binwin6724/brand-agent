import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Home from './pages/Home';
import SideNavigation from './navigation/SideNavigation';
import TopNavigation from './navigation/TopNavigation';
import SearchAd from './pages/SearchAd';
import Content from './pages/Content';
import Sandbox from './pages/Sandbox';

function App() {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  const handleMenuClick = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  return (
    <Router>
      <div className="app">
        <SideNavigation isCollapsed={isNavCollapsed} />
        <TopNavigation handleMenuClick={handleMenuClick} /> 
        <div className="home-root">
          <div className='home-root-card'>
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/content" element={<Content />} />
              <Route path="/home" element={<Home />} />
              <Route path="/search-ad" element={<SearchAd />} />
              <Route path="/sandbox" element={<Sandbox />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App