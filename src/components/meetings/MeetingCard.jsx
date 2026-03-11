import { useNavigate } from 'react-router-dom';
import { Clock, Users, FileText, Video } from 'lucide-react';
import { formatDuration, getPlatformInfo, getStatusInfo } from '../../lib/meetings-api';
import './MeetingCard.css';

export default function MeetingCard({ meeting }) {
  const navigate = useNavigate();
  const platform = getPlatformInfo(meeting.platform);
  const status = getStatusInfo(meeting.recall_bot_status);
  const isActive = ['joining_call', 'in_waiting_room', 'in_call_recording', 'in_call_not_recording'].includes(meeting.recall_bot_status);

  const date = meeting.started_at || meeting.created_at;
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const formattedTime = new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });

  const participantCount = Array.isArray(meeting.participants) ? meeting.participants.length : 0;
  const actionItemCount = Array.isArray(meeting.action_items) ? meeting.action_items.length : 0;

  return (
    <div
      className={`meeting-card ${isActive ? 'meeting-card--active' : ''}`}
      onClick={() => navigate(`/meetings/${meeting.id}`)}
    >
      <div className="meeting-card-header">
        <div className="meeting-card-platform" style={{ background: platform.color }}>
          {platform.name}
        </div>
        <div className="meeting-card-status" style={{ color: status.color }}>
          {isActive && <span className="meeting-card-pulse" />}
          {status.label}
        </div>
      </div>

      <h3 className="meeting-card-title">{meeting.title || 'Untitled Meeting'}</h3>

      <div className="meeting-card-meta">
        <span className="meeting-card-date">{formattedDate} at {formattedTime}</span>
        {meeting.duration_seconds > 0 && (
          <span className="meeting-card-duration">
            <Clock size={13} />
            {formatDuration(meeting.duration_seconds)}
          </span>
        )}
      </div>

      <div className="meeting-card-footer">
        {participantCount > 0 && (
          <span className="meeting-card-stat">
            <Users size={13} />
            {participantCount}
          </span>
        )}
        {actionItemCount > 0 && (
          <span className="meeting-card-stat">
            <FileText size={13} />
            {actionItemCount} action items
          </span>
        )}
        {(meeting.video_url || meeting.audio_url) && (
          <span className="meeting-card-stat">
            <Video size={13} />
            Recording
          </span>
        )}
      </div>

      {meeting.summary?.overview && (
        <p className="meeting-card-summary">
          {typeof meeting.summary.overview === 'string'
            ? meeting.summary.overview.slice(0, 120) + (meeting.summary.overview.length > 120 ? '...' : '')
            : ''}
        </p>
      )}
    </div>
  );
}
