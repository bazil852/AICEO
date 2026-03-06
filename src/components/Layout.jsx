import { useRef, useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { navItems } from './Sidebar';
import Sidebar from './Sidebar';
import BottomBar from './BottomBar';
import CreditPill from './CreditPill';
import MobileProfileButton from './MobileProfileButton';
import './Layout.css';

const SWIPE_THRESHOLD = 60;
const routes = navItems.map((item) => item.to);

function isMobile() {
  return window.innerWidth <= 768;
}

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const touchRef = useRef({ startX: 0, startY: 0, swiping: false });
  const [slideDir, setSlideDir] = useState(null); // 'left' or 'right'
  const prevPath = useRef(location.pathname);

  // Detect route change and apply slide animation
  useEffect(() => {
    if (prevPath.current !== location.pathname && slideDir) {
      const timer = setTimeout(() => setSlideDir(null), 300);
      prevPath.current = location.pathname;
      return () => clearTimeout(timer);
    }
    prevPath.current = location.pathname;
  }, [location.pathname, slideDir]);

  const handleTouchStart = useCallback((e) => {
    if (!isMobile()) return;
    const tag = e.target.tagName.toLowerCase();
    const isInteractive = e.target.closest('button, a, input, select, textarea, [role="button"]');
    if (isInteractive || tag === 'button' || tag === 'a' || tag === 'input') return;

    const scrollable = e.target.closest('.aiceo-table-scroll');
    if (scrollable) return;

    touchRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      swiping: true,
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (!touchRef.current.swiping) return;
      touchRef.current.swiping = false;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - touchRef.current.startX;
      const diffY = endY - touchRef.current.startY;

      if (Math.abs(diffX) < SWIPE_THRESHOLD || Math.abs(diffY) > Math.abs(diffX)) return;

      const currentIndex = routes.indexOf(location.pathname);
      if (currentIndex === -1) return;

      if (diffX < 0 && currentIndex < routes.length - 1) {
        setSlideDir('left');
        navigate(routes[currentIndex + 1]);
      } else if (diffX > 0 && currentIndex > 0) {
        setSlideDir('right');
        navigate(routes[currentIndex - 1]);
      }
    },
    [location.pathname, navigate]
  );

  useEffect(() => {
    const main = document.querySelector('.layout-main');
    if (!main) return;
    main.addEventListener('touchstart', handleTouchStart, { passive: true });
    main.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      main.removeEventListener('touchstart', handleTouchStart);
      main.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  const slideClass = slideDir === 'left' ? 'slide-in-left' : slideDir === 'right' ? 'slide-in-right' : '';

  return (
    <div className="layout">
      <Sidebar />
      <CreditPill />
      <MobileProfileButton />
      <main className={`layout-main ${slideClass}`}>
        <Outlet />
      </main>
      <BottomBar />
    </div>
  );
}
