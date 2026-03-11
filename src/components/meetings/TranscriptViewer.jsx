import { useRef, useEffect } from 'react';
import { formatTimestamp } from '../../lib/meetings-api';
import './TranscriptViewer.css';

export default function TranscriptViewer({ segments, currentTime, onSeek, isLive }) {
  const containerRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTime]);

  // Auto-scroll to bottom for live transcripts
  useEffect(() => {
    if (isLive && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [segments?.length, isLive]);

  if (!segments?.length) {
    return (
      <div className="transcript-viewer-empty">
        {isLive ? 'Waiting for transcript...' : 'No transcript available'}
      </div>
    );
  }

  // Group consecutive segments by speaker
  const grouped = [];
  let current = null;
  for (const seg of segments) {
    if (current && current.speaker === seg.speaker_name) {
      current.segments.push(seg);
      current.endTime = seg.end_time;
    } else {
      current = {
        speaker: seg.speaker_name || 'Unknown',
        segments: [seg],
        startTime: seg.start_time,
        endTime: seg.end_time,
      };
      grouped.push(current);
    }
  }

  return (
    <div className="transcript-viewer" ref={containerRef}>
      {grouped.map((group, gi) => {
        const isActive = currentTime !== undefined &&
          currentTime >= group.startTime &&
          currentTime <= group.endTime;

        return (
          <div
            key={gi}
            className={`transcript-group ${isActive ? 'transcript-group--active' : ''}`}
            ref={isActive ? activeRef : null}
          >
            <div className="transcript-speaker">
              <span className="transcript-speaker-name">{group.speaker}</span>
              {group.startTime != null && (
                <button
                  className="transcript-timestamp"
                  onClick={() => onSeek?.(group.startTime)}
                >
                  {formatTimestamp(group.startTime)}
                </button>
              )}
            </div>
            <div className="transcript-text">
              {group.segments.map((seg, si) => (
                <span
                  key={si}
                  className={`transcript-segment ${
                    currentTime !== undefined &&
                    currentTime >= seg.start_time &&
                    currentTime <= seg.end_time
                      ? 'transcript-segment--active'
                      : ''
                  } ${seg.is_partial ? 'transcript-segment--partial' : ''}`}
                  onClick={() => onSeek?.(seg.start_time)}
                >
                  {seg.text}{' '}
                </span>
              ))}
            </div>
          </div>
        );
      })}
      {isLive && (
        <div className="transcript-live-indicator">
          <span className="transcript-live-dot" />
          Live
        </div>
      )}
    </div>
  );
}
