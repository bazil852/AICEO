import { useState, useEffect } from 'react';
import { X, Send, Video } from 'lucide-react';
import { createMeeting, getTemplates } from '../../lib/meetings-api';
import './BotLauncher.css';

export default function BotLauncher({ onClose, onCreated }) {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState('general');
  const [botName, setBotName] = useState('PurelyPersonal Notetaker');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getTemplates().then(d => setTemplates(d.templates || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!meetingUrl.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = await createMeeting({
        meeting_url: meetingUrl.trim(),
        title: title.trim() || undefined,
        bot_name: botName.trim() || undefined,
        template,
      });
      onCreated?.(result.meeting);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bot-launcher-overlay" onClick={onClose}>
      <div className="bot-launcher" onClick={e => e.stopPropagation()}>
        <div className="bot-launcher-header">
          <Video size={20} />
          <h3>Record a Meeting</h3>
          <button className="bot-launcher-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bot-launcher-field">
            <label>Meeting URL *</label>
            <input
              type="url"
              placeholder="https://zoom.us/j/... or meet.google.com/..."
              value={meetingUrl}
              onChange={e => setMeetingUrl(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="bot-launcher-field">
            <label>Meeting Title</label>
            <input
              type="text"
              placeholder="Optional — will auto-generate if empty"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="bot-launcher-row">
            <div className="bot-launcher-field">
              <label>Summary Template</label>
              <select value={template} onChange={e => setTemplate(e.target.value)}>
                {templates.map(t => (
                  <option key={t.slug} value={t.slug}>{t.name}</option>
                ))}
                {!templates.length && <option value="general">General Meeting</option>}
              </select>
            </div>

            <div className="bot-launcher-field">
              <label>Bot Name</label>
              <input
                type="text"
                value={botName}
                onChange={e => setBotName(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="bot-launcher-error">{error}</div>}

          <button type="submit" className="bot-launcher-submit" disabled={loading || !meetingUrl.trim()}>
            <Send size={16} />
            {loading ? 'Sending Bot...' : 'Send Bot to Meeting'}
          </button>
        </form>
      </div>
    </div>
  );
}
