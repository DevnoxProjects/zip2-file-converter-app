import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ToolPage from './pages/ToolPage';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/tool/:id" element={<ToolPage />} />
            {/* Fallback for specific paths if direct access to tools is tried without /tool prefix */}
            <Route path="/merge-pdf" element={<ToolPageWrapper id="merge-pdf" />} />
            <Route path="/split-pdf" element={<ToolPageWrapper id="split-pdf" />} />
            <Route path="/compress-pdf" element={<ToolPageWrapper id="compress-pdf" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

// Simple wrapper to allow direct routes if needed
function ToolPageWrapper({ id }) {
  return <Navigate to={`/tool/${id}`} replace />;
}
