import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MenuProvider, useMenu } from './context/MenuContext';
import { HomePage } from './pages/HomePage';
import { TableQRPage } from './pages/TableQRPage';
import { NotFoundPage } from './pages/NotFoundPage';

const AppContent = () => {
  const { setCurrentTable } = useMenu();

  // Restore table session if customer refreshed
  useEffect(() => {
    const saved = sessionStorage.getItem('qissa_active_table');
    if (saved) {
      try {
        setCurrentTable(JSON.parse(saved));
      } catch (e) {}
    }
  }, [setCurrentTable]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/menu/:qrToken" element={<TableQRPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <MenuProvider>
        <AppContent />
      </MenuProvider>
    </BrowserRouter>
  );
}
