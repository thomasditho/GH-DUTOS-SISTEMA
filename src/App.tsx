import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/EquipmentList';
import EquipmentDetail from './pages/EquipmentDetail';
import EquipmentForm from './pages/EquipmentForm';
import PublicEquipment from './pages/PublicEquipment';
import MaintenanceHistory from './pages/MaintenanceHistory';
import UserManagement from './pages/UserManagement';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Simple state machine for the admin panel
  const renderContent = () => {
    if (isCreating) {
      return <EquipmentForm onBack={() => setIsCreating(false)} onSuccess={() => { setIsCreating(false); setActiveTab('equipments'); }} />;
    }
    if (editingId) {
      return <EquipmentForm id={editingId} onBack={() => setEditingId(null)} onSuccess={() => { setEditingId(null); setActiveTab('equipments'); }} />;
    }
    if (selectedId) {
      return <EquipmentDetail id={selectedId} onBack={() => setSelectedId(null)} onEdit={(id) => { setSelectedId(null); setEditingId(id); }} />;
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'equipments': return <EquipmentList onSelect={setSelectedId} onNew={() => setIsCreating(true)} onEdit={setEditingId} />;
      case 'maintenances': return <MaintenanceHistory />;
      case 'users': return user?.role === 'ADMIN' ? <UserManagement /> : <Dashboard />;
      default: return <Dashboard />;
    }
  };

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
      <Route path="/e/:publicId" element={<PublicEquipment />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout activeTab={activeTab} setActiveTab={(tab) => {
            setActiveTab(tab);
            setSelectedId(null);
            setEditingId(null);
            setIsCreating(false);
          }}>
            {renderContent()}
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
