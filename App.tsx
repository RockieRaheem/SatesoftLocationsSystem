import React from 'react';
import AdminDashboard from './components/AdminDashboard.tsx';
import { LanguageProvider } from './contexts/LanguageContext.tsx';

const App: React.FC = () => (
  <LanguageProvider language="en">
    <AdminDashboard />
  </LanguageProvider>
);

export default App;
