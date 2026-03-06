import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Settings, LogOut } from 'lucide-react';
import './MobileProfileButton.css';

export default function MobileProfileButton() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="mobile-profile" ref={menuRef}>
      <button className="mobile-profile-btn" onClick={() => setOpen(!open)}>
        <User size={18} />
      </button>
      {open && (
        <div className="mobile-profile-menu">
          <div className="mobile-profile-info">
            <span className="mobile-profile-name">{user?.name}</span>
            <span className="mobile-profile-email">{user?.email}</span>
          </div>
          <div className="mobile-profile-divider" />
          <button className="mobile-profile-item" onClick={() => { navigate('/settings'); setOpen(false); }}>
            <Settings size={16} />
            <span>Settings</span>
          </button>
          <button className="mobile-profile-item mobile-profile-item--danger" onClick={() => { logout(); setOpen(false); }}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
