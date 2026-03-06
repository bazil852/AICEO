import { NavLink } from 'react-router-dom';
import { navItems } from './Sidebar';
import './BottomBar.css';

export default function BottomBar() {
  return (
    <nav className="bottom-bar">
      {navItems.map((item) => (
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
      ))}
    </nav>
  );
}
