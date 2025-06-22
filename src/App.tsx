import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import GuildPage from './components/GuildPage';

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/guild/:guildId" element={<GuildPage />} />
      </Routes>
    </div>
  );
}

export default App;