import { useAuth } from '../context/AuthContext';
import { Zap } from 'lucide-react';
import './CreditPill.css';

export default function CreditPill() {
  const { credits } = useAuth();

  return (
    <div className="credit-pill">
      <Zap size={14} />
      <span>{credits.toLocaleString()}</span>
    </div>
  );
}
