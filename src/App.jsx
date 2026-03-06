import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import Layout from './components/Layout';
import AiCeo from './pages/AiCeo';
import Dashboard from './pages/Dashboard';
import Content from './pages/Content';
import Marketing from './pages/Marketing';
import Sales from './pages/Sales';
import Settings from './pages/Settings';

function App() {
  const { user } = useAuth();

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/ai-ceo" element={<AiCeo />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/content" element={<Content />} />
        <Route path="/marketing" element={<Marketing />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
