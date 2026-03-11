import { useState } from 'react';
import { X, Link, Copy, Check, Trash2 } from 'lucide-react';
import { shareMeeting, unshareMeeting } from '../../lib/meetings-api';
import './ShareModal.css';

export default function ShareModal({ meeting, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = meeting.share_token
    ? `${window.location.origin}/shared/${meeting.share_token}`
    : null;

  const handleShare = async () => {
    setLoading(true);
    try {
      const result = await shareMeeting(meeting.id);
      onUpdate?.({ ...meeting, share_token: result.share_token, is_shared: true });
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnshare = async () => {
    setLoading(true);
    try {
      await unshareMeeting(meeting.id);
      onUpdate?.({ ...meeting, share_token: null, is_shared: false });
    } catch (err) {
      console.error('Unshare failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="share-overlay" onClick={onClose}>
      <div className="share-modal" onClick={e => e.stopPropagation()}>
        <div className="share-header">
          <Link size={18} />
          <h3>Share Meeting</h3>
          <button className="share-close" onClick={onClose}><X size={18} /></button>
        </div>

        {shareUrl ? (
          <>
            <p className="share-desc">Anyone with this link can view the meeting transcript and summary.</p>
            <div className="share-link-row">
              <input type="text" readOnly value={shareUrl} className="share-link-input" />
              <button className="share-copy-btn" onClick={handleCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <button className="share-revoke" onClick={handleUnshare} disabled={loading}>
              <Trash2 size={14} />
              Revoke Link
            </button>
          </>
        ) : (
          <>
            <p className="share-desc">Generate a public link to share this meeting's transcript and AI summary.</p>
            <button className="share-generate" onClick={handleShare} disabled={loading}>
              <Link size={16} />
              {loading ? 'Generating...' : 'Generate Share Link'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
