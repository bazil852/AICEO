import { useState, useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchMeetings, getPlatformInfo } from '../../lib/meetings-api';
import './MeetingSearch.css';

export default function MeetingSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const search = useCallback((q) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchMeetings(q);
        setResults(data.results || []);
        setOpen(true);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const handleChange = (e) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  const handleSelect = (id) => {
    setOpen(false);
    setQuery('');
    navigate(`/meetings/${id}`);
  };

  return (
    <div className="meeting-search">
      <div className="meeting-search-input-wrap">
        <Search size={16} className="meeting-search-icon" />
        <input
          type="text"
          placeholder="Search meetings..."
          value={query}
          onChange={handleChange}
          onFocus={() => results.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          className="meeting-search-input"
        />
        {query && (
          <button className="meeting-search-clear" onClick={() => { setQuery(''); setResults([]); setOpen(false); }}>
            <X size={14} />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="meeting-search-results">
          {results.map(r => {
            const platform = getPlatformInfo(r.platform);
            return (
              <div key={r.id} className="meeting-search-result" onClick={() => handleSelect(r.id)}>
                <div className="meeting-search-result-header">
                  <span className="meeting-search-platform" style={{ background: platform.color }}>{platform.name}</span>
                  <span className="meeting-search-result-title">{r.title}</span>
                </div>
                {r.snippet && <p className="meeting-search-snippet">{r.snippet}</p>}
              </div>
            );
          })}
        </div>
      )}

      {open && loading && <div className="meeting-search-results"><div className="meeting-search-loading">Searching...</div></div>}
    </div>
  );
}
