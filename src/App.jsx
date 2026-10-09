import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GuestView from './components/GuestView';
import AdminView from './components/AdminView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GuestView />} />
        <Route path="/admin" element={<AdminView />} />
      </Routes>
    </BrowserRouter>
  );
}
