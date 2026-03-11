import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Video } from 'lucide-react';
import { getSharedMeeting, getPlatformInfo, formatDuration } from '../lib/meetings-api';
import TranscriptViewer from '../components/meetings/TranscriptViewer';
import SummaryPanel from '../components/meetings/SummaryPanel';
import RecordingPlayer from '../components/meetings/RecordingPlayer';
import './SharedMeeting.css';

export default function SharedMeeting() {
  const { token } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    getSharedMeeting(token)
      .then(data => {
        if (data) {
          setMeeting(data.meeting);
          setSegments(data.segments || []);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSeek = (time) => {
    setCurrentTime(time);
    window.__ppPlayerSeek?.(time);
  };

  if (loading) {
    return (
      <div className="shared-meeting-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="shared-meeting-error">
        <Video size={48} strokeWidth={1} />
        <h2>Meeting Not Found</h2>
        <p>This shared meeting link is invalid or has been revoked.</p>
      </div>
    );
  }

  const platform = getPlatformInfo(meeting.platform);

  return (
    <div className="shared-meeting">
      <div className="shared-meeting-header">
        <div className="shared-meeting-brand">
          <Video size={20} />
          PurelyPersonal
        </div>
      </div>

      <div className="shared-meeting-content">
        <div className="shared-meeting-top">
          <span className="shared-meeting-platform" style={{ background: platform.color }}>{platform.name}</span>
          <h1>{meeting.title || 'Shared Meeting'}</h1>
          <div className="shared-meeting-meta">
            {meeting.started_at && <span>{new Date(meeting.started_at).toLocaleString()}</span>}
            {meeting.duration_seconds > 0 && <span>{formatDuration(meeting.duration_seconds)}</span>}
            {meeting.participants?.length > 0 && <span>{meeting.participants.length} participants</span>}
          </div>
        </div>

        <div className="shared-meeting-body">
          <div className="shared-meeting-left">
            <RecordingPlayer
              videoUrl={meeting.video_url}
              audioUrl={meeting.audio_url}
              onTimeUpdate={setCurrentTime}
            />
            <div className="shared-meeting-transcript">
              <h3>Transcript</h3>
              <TranscriptViewer
                segments={segments}
                currentTime={currentTime}
                onSeek={handleSeek}
              />
            </div>
          </div>

          <div className="shared-meeting-right">
            <SummaryPanel meeting={meeting} onSeek={handleSeek} />
          </div>
        </div>
      </div>
    </div>
  );
}
