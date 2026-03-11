import { useState } from 'react';
import { CheckCircle, Circle, Clock, BookOpen } from 'lucide-react';
import { formatTimestamp } from '../../lib/meetings-api';
import './SummaryPanel.css';

export default function SummaryPanel({ meeting, onSeek }) {
  const [tab, setTab] = useState('summary');

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'actions', label: `Action Items${meeting.action_items?.length ? ` (${meeting.action_items.length})` : ''}` },
    { id: 'chapters', label: 'Chapters' },
  ];

  return (
    <div className="summary-panel">
      <div className="summary-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`summary-tab ${tab === t.id ? 'summary-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="summary-content">
        {tab === 'summary' && <SummaryContent summary={meeting.summary} />}
        {tab === 'actions' && <ActionItemsContent items={meeting.action_items} />}
        {tab === 'chapters' && <ChaptersContent chapters={meeting.chapters} onSeek={onSeek} />}
      </div>
    </div>
  );
}

function SummaryContent({ summary }) {
  if (!summary) {
    return <div className="summary-empty">No summary generated yet. Summary will appear after the meeting ends.</div>;
  }

  return (
    <div className="summary-body">
      {typeof summary === 'string' ? (
        <p>{summary}</p>
      ) : (
        Object.entries(summary).map(([key, value]) => {
          if (key === 'error') return null;
          return (
            <div key={key} className="summary-section">
              <h4>{key.replace(/_/g, ' ')}</h4>
              {Array.isArray(value) ? (
                <ul>
                  {value.map((item, i) => (
                    <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                  ))}
                </ul>
              ) : (
                <p>{String(value)}</p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function ActionItemsContent({ items }) {
  if (!items?.length) {
    return <div className="summary-empty">No action items found.</div>;
  }

  return (
    <div className="action-items-list">
      {items.map((item, i) => (
        <div key={i} className="action-item">
          <div className="action-item-check">
            {item.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
          </div>
          <div className="action-item-body">
            <p className="action-item-text">{item.text}</p>
            <div className="action-item-meta">
              {item.assignee && <span className="action-item-assignee">{item.assignee}</span>}
              {item.due_date && (
                <span className="action-item-due">
                  <Clock size={12} />
                  {item.due_date}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChaptersContent({ chapters, onSeek }) {
  if (!chapters?.length) {
    return <div className="summary-empty">No chapters generated.</div>;
  }

  return (
    <div className="chapters-list">
      {chapters.map((ch, i) => (
        <div
          key={i}
          className="chapter-item"
          onClick={() => onSeek?.(ch.start_time)}
        >
          <div className="chapter-time">
            <BookOpen size={14} />
            {formatTimestamp(ch.start_time)}
          </div>
          <div className="chapter-body">
            <h4 className="chapter-title">{ch.title}</h4>
            {ch.summary && <p className="chapter-summary">{ch.summary}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
