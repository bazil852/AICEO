import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, CreditCard, Zap, Check, X, Copy, Upload, Trash2, ChevronRight } from 'lucide-react';
import './Pages.css';
import './Settings.css';

const NOTE_TAKERS = [
  { id: 'fireflies', name: 'Fireflies AI', logo: '/fireflies-logo.png' },
  { id: 'fathom', name: 'Fathom', logo: '/fathom-logo.png' },
];

const MOCK_WEBHOOK_URL = 'https://api.puerlypersonal.com/webhooks/fireflies/abc123';
const MOCK_WEBHOOK_SECRET = 'whsec_k7x9Qm2pLnR4vT8wZ1yB3dF6';

export default function Settings() {
  const { user, credits } = useAuth();
  const [passwordReset, setPasswordReset] = useState(false);
  const [integrations, setIntegrations] = useState({ fireflies: false, fathom: false });
  const [modalOpen, setModalOpen] = useState(null); // 'fireflies' or 'fathom'
  const [apiKey, setApiKey] = useState('');
  const [firefliesStep, setFirefliesStep] = useState(1);
  const [copiedField, setCopiedField] = useState(null);

  // Brand DNA
  const [brandDnaCreated, setBrandDnaCreated] = useState(false);
  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef(null);

  const handleResetPassword = () => {
    setPasswordReset(true);
    setTimeout(() => setPasswordReset(false), 3000);
  };

  const openModal = (id) => {
    setApiKey('');
    setFirefliesStep(1);
    setCopiedField(null);
    setModalOpen(id);
  };

  const handleConnect = () => {
    if (modalOpen) {
      setIntegrations((prev) => ({ ...prev, [modalOpen]: true }));
    }
    setModalOpen(null);
    setApiKey('');
    setFirefliesStep(1);
  };

  const handleDisconnect = (id) => {
    setIntegrations((prev) => ({ ...prev, [id]: false }));
  };

  const handleFirefliesNext = () => {
    if (!apiKey.trim()) return;
    setFirefliesStep(2);
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 15 - photos.length;
    const toAdd = files.slice(0, remaining);
    const newPhotos = toAdd.map((file) => ({
      id: `photo-${Date.now()}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    e.target.value = '';
  };

  const removePhoto = (id) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleCreateBrandDna = () => {
    setBrandDnaCreated(true);
  };

  const currentModal = modalOpen ? NOTE_TAKERS.find((n) => n.id === modalOpen) : null;

  return (
    <div className="page-container">
      <h1 className="page-title">Settings</h1>

      {/* Account Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Account</h2>
        <div className="settings-card">
          <div className="settings-row">
            <div className="settings-row-icon">
              <Mail size={18} />
            </div>
            <div className="settings-row-content">
              <span className="settings-row-label">Email</span>
              <span className="settings-row-value">{user?.email}</span>
            </div>
          </div>

          <div className="settings-divider" />

          <div className="settings-row">
            <div className="settings-row-icon">
              <Lock size={18} />
            </div>
            <div className="settings-row-content">
              <span className="settings-row-label">Password</span>
              <span className="settings-row-value">••••••••</span>
            </div>
            <button
              className={`settings-btn ${passwordReset ? 'settings-btn--success' : ''}`}
              onClick={handleResetPassword}
              disabled={passwordReset}
            >
              {passwordReset ? (
                <><Check size={14} /> Email Sent</>
              ) : (
                'Reset Password'
              )}
            </button>
          </div>

          <div className="settings-divider" />

          <div className="settings-row">
            <div className="settings-row-icon">
              <CreditCard size={18} />
            </div>
            <div className="settings-row-content">
              <span className="settings-row-label">Subscription</span>
              <div className="settings-row-value">
                <span className="settings-plan-badge">{user?.plan} Plan</span>
                <span className="settings-status-badge">Active</span>
              </div>
            </div>
          </div>

          <div className="settings-divider" />

          <div className="settings-row">
            <div className="settings-row-icon">
              <Zap size={18} />
            </div>
            <div className="settings-row-content">
              <span className="settings-row-label">Credits</span>
              <span className="settings-row-value">{credits.toLocaleString()} remaining</span>
            </div>
            <button className="settings-btn settings-btn--primary">
              Buy More Credits
            </button>
          </div>
        </div>
      </div>

      {/* Integrations Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Integrations</h2>
        <div className="settings-integrations">
          {NOTE_TAKERS.map((nt) => (
            <div key={nt.id} className="settings-integration-card">
              <img src={nt.logo} alt={nt.name} className="settings-integration-logo" />
              <div className="settings-integration-info">
                <span className="settings-integration-name">{nt.name}</span>
                <span className={`settings-integration-status ${integrations[nt.id] ? 'settings-integration-status--connected' : ''}`}>
                  {integrations[nt.id] ? 'Connected' : 'Not connected'}
                </span>
              </div>
              {integrations[nt.id] ? (
                <button
                  className="settings-btn settings-btn--danger"
                  onClick={() => handleDisconnect(nt.id)}
                >
                  Disconnect
                </button>
              ) : (
                <button
                  className="settings-btn settings-btn--primary"
                  onClick={() => openModal(nt.id)}
                >
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Brand DNA Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Brand DNA</h2>
        {!brandDnaCreated ? (
          <div className="settings-card settings-brand-dna-card">
            <p className="settings-brand-dna-desc">
              Create your Brand DNA to help the AI CEO understand your personal brand, voice, and visual identity.
            </p>
            <button className="settings-btn settings-btn--primary settings-btn--lg" onClick={handleCreateBrandDna}>
              Create Brand DNA
              <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          <div className="settings-card">
            <div className="settings-brand-dna-header">
              <h3 className="settings-brand-dna-title">Your Photos</h3>
              <span className="settings-brand-dna-count">{photos.length}/15 photos</span>
            </div>

            <div
              className="settings-upload-box"
              onClick={() => photos.length < 15 && fileInputRef.current?.click()}
            >
              <Upload size={28} />
              <span>Upload all of your photos</span>
              <span className="settings-upload-hint">Click to browse — up to 15 images</span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </div>

            {photos.length > 0 && (
              <div className="settings-photo-grid">
                {photos.map((photo) => (
                  <div key={photo.id} className="settings-photo-item">
                    <img src={photo.url} alt="" />
                    <button
                      className="settings-photo-remove"
                      onClick={() => removePhoto(photo.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Integration Modal */}
      {modalOpen && currentModal && (
        <div className="modal-overlay" onClick={() => setModalOpen(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalOpen(null)}>
              <X size={18} />
            </button>

            <div className="modal-logo">
              <img src={currentModal.logo} alt={currentModal.name} />
            </div>

            {/* Fathom: single step */}
            {modalOpen === 'fathom' && (
              <>
                <p className="modal-description">
                  Connect your Fathom AI account to automatically sync all of your call recordings to the PuerlyPersonal AI CEO.
                </p>
                <div className="modal-field">
                  <label className="modal-label">Enter your Fathom API key</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="Paste your API key here"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                <button
                  className="modal-btn modal-btn--primary"
                  disabled={!apiKey.trim()}
                  onClick={handleConnect}
                >
                  Connect
                </button>
              </>
            )}

            {/* Fireflies: step 1 */}
            {modalOpen === 'fireflies' && firefliesStep === 1 && (
              <>
                <p className="modal-description">
                  Connect your Fireflies AI account to automatically sync all of your call recordings to the PuerlyPersonal AI CEO.
                </p>
                <div className="modal-field">
                  <label className="modal-label">Enter your Fireflies API key</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="Paste your API key here"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                <button
                  className="modal-btn modal-btn--primary"
                  disabled={!apiKey.trim()}
                  onClick={handleFirefliesNext}
                >
                  Next
                </button>
              </>
            )}

            {/* Fireflies: step 2 */}
            {modalOpen === 'fireflies' && firefliesStep === 2 && (
              <>
                <p className="modal-instruction">Copy this into your Fireflies AI settings</p>
                <div className="modal-field">
                  <label className="modal-label">Webhook URL</label>
                  <div className="modal-copy-row">
                    <input
                      type="text"
                      className="modal-input modal-input--readonly"
                      value={MOCK_WEBHOOK_URL}
                      readOnly
                    />
                    <button
                      className="modal-copy-btn"
                      onClick={() => copyToClipboard(MOCK_WEBHOOK_URL, 'url')}
                    >
                      {copiedField === 'url' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <div className="modal-field">
                  <label className="modal-label">Webhook Secret</label>
                  <div className="modal-copy-row">
                    <input
                      type="text"
                      className="modal-input modal-input--readonly"
                      value={MOCK_WEBHOOK_SECRET}
                      readOnly
                    />
                    <button
                      className="modal-copy-btn"
                      onClick={() => copyToClipboard(MOCK_WEBHOOK_SECRET, 'secret')}
                    >
                      {copiedField === 'secret' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  className="modal-btn modal-btn--primary"
                  onClick={handleConnect}
                >
                  Connect
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
