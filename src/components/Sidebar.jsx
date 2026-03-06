import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Megaphone,
  DollarSign,
  ChevronUp,
  LogOut,
  Settings,
  User,
  Zap,
} from 'lucide-react';
import './Sidebar.css';

function AiCeoIcon({ size = 20 }) {
  return (
    <img
      src="/favicon.png"
      alt="AI CEO"
      style={{ width: size, height: size, borderRadius: 4, objectFit: 'contain' }}
    />
  );
}

const navItems = [
  { to: '/ai-ceo', label: 'AI CEO', icon: AiCeoIcon },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/content', label: 'Content', icon: FileText },
  { to: '/marketing', label: 'Marketing', icon: Megaphone },
  { to: '/sales', label: 'Sales', icon: DollarSign },
];

export default function Sidebar() {
  const { user, credits, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <img src="/logo.png" alt="PuerlyPersonal" />
        </div>

        <div className="sidebar-credits">
          <Zap size={16} />
          <span>{credits.toLocaleString()} credits</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div
          className={`profile-dropdown ${profileOpen ? 'profile-dropdown--open' : ''}`}
        >
          {profileOpen && (
            <div className="profile-menu">
              <div className="profile-info">
                <div className="profile-avatar">
                  <User size={18} />
                </div>
                <div className="profile-details">
                  <span className="profile-name">{user?.name}</span>
                  <span className="profile-email">{user?.email}</span>
                </div>
              </div>
              <div className="profile-divider" />
              <button className="profile-menu-item" onClick={() => { navigate('/settings'); setProfileOpen(false); }}>
                <Settings size={16} />
                <span>Settings</span>
              </button>
              <button className="profile-menu-item profile-menu-item--danger" onClick={logout}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
          <button
            className="profile-trigger"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="profile-avatar-sm">
              <User size={16} />
            </div>
            <div className="profile-trigger-info">
              <span className="profile-trigger-name">{user?.name}</span>
              <span className="profile-trigger-plan">{user?.plan} Plan</span>
            </div>
            <ChevronUp
              size={16}
              className={`profile-chevron ${profileOpen ? 'profile-chevron--open' : ''}`}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}

export { navItems };
