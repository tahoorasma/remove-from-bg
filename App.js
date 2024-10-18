import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Canvas from './components/canvas';
import Result from './components/result';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Canvas />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </Router>
  );
}

export default App;
