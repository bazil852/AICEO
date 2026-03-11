import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import { navItems } from './Sidebar';
import './BottomBar.css';

export default function BottomBar() {
  const [contentOpen, setContentOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isContentActive = location.pathname === '/content' || location.pathname === '/outlier-detector';

  useEffect(() => {
    setContentOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setContentOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, []);

  return (
    <nav className="bottom-bar">
      {navItems.map((item) =>
        item.children ? (
          <div key={item.label} className="bottom-bar-dropdown" ref={menuRef}>
            <div
              className={`bottom-bar-link ${isContentActive ? 'bottom-bar-link--active' : ''}`}
              onClick={() => setContentOpen(!contentOpen)}
            >
              <item.icon size={22} />
              <span>{item.label}</span>
              <ChevronUp size={12} className={`bottom-bar-chevron ${contentOpen ? 'bottom-bar-chevron--open' : ''}`} />
            </div>
            {contentOpen && (
              <div className="bottom-bar-popup">
                {item.children.map((child) => (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    className={({ isActive }) =>
                      `bottom-bar-popup-item ${isActive ? 'bottom-bar-popup-item--active' : ''}`
                    }
                  >
                    <child.icon size={16} />
                    <span>{child.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ) : (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `bottom-bar-link ${isActive ? 'bottom-bar-link--active' : ''}`
            }
          >
            <item.icon size={22} />
            <span>{item.label}</span>
          </NavLink>
        )
      )}
    </nav>
  );
}
