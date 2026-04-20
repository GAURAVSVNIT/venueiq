import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './lib/firebase';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

export default function App() {
  useEffect(() => {
    signInAnonymously(auth).catch((error) => {
      console.error("Auth error:", error);
    });
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
