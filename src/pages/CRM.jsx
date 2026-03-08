import { useState, useRef, useCallback } from 'react';
import { Search, Filter, ArrowUpDown, Plus, X, Phone, Mail, Building2, Calendar, Play, Download, ExternalLink, Send, Instagram, Linkedin, Trash2 } from 'lucide-react';
import './CRM.css';

function XIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const LISTS = [
  { id: 'all', name: 'All' },
  { id: 'sample', name: 'Sample List' },
];

const INITIAL_CONTACTS = [
  { id: 1, name: 'Sarah Mitchell', phone: '+1 (555) 234-8901', email: 'sarah@brightedge.co', business: 'BrightEdge Marketing', created: 'Mar 7, 2026', status: 'Qualified', tags: ['VIP', 'Agency'], notes: 'Very interested in our agency plan. Mentioned they want to scale their team to 20 people by Q3. Follow up with pricing deck.', socials: { instagram: ['https://instagram.com/sarah_mitchell', 'https://instagram.com/brightedge_mktg'], linkedin: ['https://linkedin.com/in/sarahmitchell'], x: ['https://x.com/sarahm_mktg'] } },
  { id: 2, name: 'James Thornton', phone: '+1 (555) 876-1234', email: 'james@thorntondev.com', business: 'Thornton Development', created: 'Mar 6, 2026', status: 'New Lead', tags: ['Inbound'], notes: 'Came in through the landing page. Downloaded the free guide. No response to first email yet.', socials: { instagram: [], linkedin: ['https://linkedin.com/in/jamesthornton'], x: [] } },
  { id: 3, name: 'Maria Gonzalez', phone: '+1 (555) 345-6789', email: 'maria@vistacreative.io', business: 'Vista Creative', created: 'Mar 5, 2026', status: 'Contacted', tags: ['Referral'], notes: 'Referred by David Kim. Had a quick intro call, she wants a proposal by next week.', socials: { instagram: ['https://instagram.com/vistacreative.io'], linkedin: [], x: [] } },
  { id: 4, name: 'David Kim', phone: '+1 (555) 901-2345', email: 'david@peakperform.co', business: 'Peak Performance Co', created: 'Mar 4, 2026', status: 'Proposal Sent', tags: ['Enterprise', 'Hot'], notes: 'Sent the enterprise proposal on Mar 4. He said his team will review by Friday. High probability close.', socials: { instagram: ['https://instagram.com/davidkim_peak'], linkedin: ['https://linkedin.com/in/davidkim'], x: ['https://x.com/davidkim'] } },
  { id: 5, name: 'Emily Carter', phone: '+1 (555) 567-8901', email: 'emily@carterconsult.com', business: 'Carter Consulting', created: 'Mar 3, 2026', status: 'Qualified', tags: ['Coaching'], notes: 'Runs a coaching business with 500+ clients. Looking for automation to save time on DMs and emails.', socials: { instagram: ['https://instagram.com/emilycarter_coach'], linkedin: [], x: [] } },
  { id: 6, name: 'Ryan O\'Brien', phone: '+1 (555) 123-4567', email: 'ryan@obrienmedia.com', business: 'O\'Brien Media Group', created: 'Mar 2, 2026', status: 'New Lead', tags: ['Social Media'], notes: 'Signed up for the newsletter. No direct engagement yet.', socials: { instagram: ['https://instagram.com/ryanobrien', 'https://instagram.com/obrienmedia'], linkedin: ['https://linkedin.com/in/ryanobrien'], x: ['https://x.com/ryanobrien_media'] } },
  { id: 7, name: 'Aisha Patel', phone: '+1 (555) 678-9012', email: 'aisha@novatech.io', business: 'NovaTech Solutions', created: 'Mar 1, 2026', status: 'Contacted', tags: ['SaaS', 'Inbound'], notes: 'SaaS founder, 2k MRR. Interested in content marketing automation. Booked a demo for next Tuesday.', socials: { instagram: [], linkedin: ['https://linkedin.com/in/aishapatel'], x: [] } },
  { id: 8, name: 'Marcus Johnson', phone: '+1 (555) 234-5678', email: 'marcus@elevatebrand.co', business: 'Elevate Branding', created: 'Feb 28, 2026', status: 'Qualified', tags: ['Agency'], notes: 'Agency owner with 8 clients. Wants to white-label our tools. Discussing partnership terms.', socials: { instagram: ['https://instagram.com/elevatebrand'], linkedin: [], x: [] } },
  { id: 9, name: 'Lisa Chen', phone: '+1 (555) 890-1234', email: 'lisa@streamline.app', business: 'Streamline App', created: 'Feb 27, 2026', status: 'New Lead', tags: ['Startup'], notes: 'Early-stage startup. Exploring options for growth. Budget may be limited.', socials: { instagram: [], linkedin: [], x: [] } },
  { id: 10, name: 'Tom Walker', phone: '+1 (555) 456-7890', email: 'tom@walkerfit.com', business: 'Walker Fitness', created: 'Feb 26, 2026', status: 'Proposal Sent', tags: ['Fitness', 'VIP'], notes: 'Fitness influencer with 120k followers. Sent custom creator package proposal. Very engaged.', socials: { instagram: ['https://instagram.com/tomwalker_fit', 'https://instagram.com/walkerfitnessco'], linkedin: [], x: ['https://x.com/tomwalkerfit'] } },
  { id: 11, name: 'Nina Rossi', phone: '+1 (555) 012-3456', email: 'nina@rossidesigns.com', business: 'Rossi Designs', created: 'Feb 25, 2026', status: 'Contacted', tags: ['Creative'], notes: 'Graphic designer looking for newsletter tools. Had a quick 15-min call, sending follow-up.', socials: { instagram: ['https://instagram.com/ninarossi_design'], linkedin: ['https://linkedin.com/in/ninarossi'], x: [] } },
  { id: 12, name: 'Alex Brennan', phone: '+1 (555) 789-0123', email: 'alex@fuelgrowth.co', business: 'Fuel Growth Agency', created: 'Feb 24, 2026', status: 'Qualified', tags: ['Agency', 'Hot'], notes: 'Ready to close. Wants the annual plan. Just waiting on budget approval from his partner.', socials: { instagram: [], linkedin: ['https://linkedin.com/in/alexbrennan'], x: ['https://x.com/alexbrennan_growth'] } },
];

const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', Icon: Instagram, color: '#E1306C' },
  { key: 'linkedin', label: 'LinkedIn', Icon: Linkedin, color: '#0A66C2' },
  { key: 'x', label: 'X', Icon: XIcon, color: '#000000' },
];

const MOCK_RECORDINGS = {
  1: [
    { id: 'r1', name: 'Discovery Call — Sarah Mitchell', date: 'Mar 7, 2026', duration: '24:12' },
    { id: 'r2', name: 'Follow-up — Pricing Discussion', date: 'Mar 5, 2026', duration: '18:45' },
  ],
  3: [
    { id: 'r3', name: 'Intro Call — Maria Gonzalez', date: 'Mar 4, 2026', duration: '15:30' },
  ],
  4: [
    { id: 'r4', name: 'Demo Call — David Kim', date: 'Mar 3, 2026', duration: '42:08' },
    { id: 'r5', name: 'Enterprise Walkthrough', date: 'Mar 1, 2026', duration: '35:20' },
  ],
  5: [
    { id: 'r6', name: 'Strategy Call — Emily Carter', date: 'Mar 2, 2026', duration: '28:15' },
  ],
  7: [
    { id: 'r7', name: 'Product Demo — Aisha Patel', date: 'Feb 28, 2026', duration: '32:00' },
  ],
  8: [
    { id: 'r8', name: 'Partnership Discussion — Marcus', date: 'Feb 27, 2026', duration: '45:10' },
  ],
  10: [
    { id: 'r9', name: 'Creator Package Call — Tom', date: 'Feb 25, 2026', duration: '22:30' },
  ],
  11: [
    { id: 'r10', name: 'Quick Intro — Nina Rossi', date: 'Feb 24, 2026', duration: '14:55' },
  ],
  12: [
    { id: 'r11', name: 'Closing Call — Alex Brennan', date: 'Feb 23, 2026', duration: '19:40' },
  ],
};

const MOCK_EMAILS = {
  1: [
    { id: 'e1', subject: 'Agency Plan — Custom Pricing', date: 'Mar 6, 2026', snippet: 'Hi Sarah, following up on our call. Here\'s the custom pricing breakdown we discussed for your team of 20...' },
    { id: 'e2', subject: 'Welcome to PuerlyPersonal!', date: 'Mar 7, 2026', snippet: 'Thanks for signing up! Here\'s everything you need to get started with your AI CEO dashboard...' },
  ],
  2: [
    { id: 'e3', subject: 'Your Free Growth Guide', date: 'Mar 6, 2026', snippet: 'Hey James! Thanks for downloading our growth guide. I noticed you\'re in development — here are 3 tips...' },
  ],
  4: [
    { id: 'e4', subject: 'Enterprise Proposal — Peak Performance', date: 'Mar 4, 2026', snippet: 'Hi David, as promised, here\'s the full enterprise proposal with the custom integration timeline...' },
    { id: 'e5', subject: 'Quick Question About Your Team', date: 'Mar 2, 2026', snippet: 'Hey David, before I put the proposal together, how many team members will need access?...' },
  ],
  6: [
    { id: 'e6', subject: 'Welcome — Here\'s What\'s Next', date: 'Mar 2, 2026', snippet: 'Hey Ryan, welcome aboard! I saw you signed up for the newsletter. Here\'s what to expect...' },
  ],
  10: [
    { id: 'e7', subject: 'Creator Package — Your Custom Plan', date: 'Feb 26, 2026', snippet: 'Hey Tom! Loved our call. Here\'s the creator package I put together based on your 120k audience...' },
  ],
};

const MOCK_PRODUCTS = {
  4: [
    { id: 'p1', name: 'Enterprise Annual Plan', price: '$4,800', date: 'Mar 4, 2026' },
  ],
  10: [
    { id: 'p2', name: 'Creator Pro Monthly', price: '$97/mo', date: 'Feb 20, 2026' },
    { id: 'p3', name: 'DM Automation Add-on', price: '$49/mo', date: 'Feb 20, 2026' },
  ],
  8: [
    { id: 'p4', name: 'Agency Starter Plan', price: '$197/mo', date: 'Feb 15, 2026' },
  ],
};

const STATUSES = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent'];

const STATUS_COLORS = {
  'New Lead': { bg: '#eff6ff', color: '#2563eb' },
  'Contacted': { bg: '#fefce8', color: '#ca8a04' },
  'Qualified': { bg: '#f0fdf4', color: '#16a34a' },
  'Proposal Sent': { bg: '#fdf4ff', color: '#9333ea' },
};

export default function CRM() {
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [activeList, setActiveList] = useState('all');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [view, setView] = useState('table');
  const [popup, setPopup] = useState(null);
  const [popupTab, setPopupTab] = useState('recordings');
  const [addingSocial, setAddingSocial] = useState(null); // { platform: 'instagram' | 'linkedin' | 'x' }
  const [socialInput, setSocialInput] = useState('');
  const pageRef = useRef(null);

  const updateContact = useCallback((contactId, updater) => {
    setContacts((prev) => prev.map((c) => c.id === contactId ? updater(c) : c));
    // Also update the popup's contact reference
    setPopup((prev) => {
      if (!prev || prev.contact.id !== contactId) return prev;
      return { ...prev, contact: updater(prev.contact) };
    });
  }, []);

  const filtered = contacts.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.business.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  const openContact = useCallback((contact, e) => {
    const page = pageRef.current;
    if (!page) return;
    const pageRect = page.getBoundingClientRect();
    const clickX = e.clientX - pageRect.left;
    const clickY = e.clientY - pageRect.top;
    const midX = pageRect.width / 2;

    const popupW = 520;
    const popupH = Math.min(700, pageRect.height - 40);
    const spikeW = 14;
    let arrowSide, px, py;

    if (clickX < midX) {
      // Click on left half → popup to the right, spike points left
      arrowSide = 'left';
      px = clickX + spikeW;
    } else {
      // Click on right half → popup to the left, spike points right
      arrowSide = 'right';
      px = clickX - popupW - spikeW;
    }

    // Clamp popup within page bounds
    px = Math.max(16, Math.min(px, pageRect.width - popupW - 16));

    // Vertically center on click, clamped
    py = Math.min(Math.max(clickY - popupH / 2, 10), pageRect.height - popupH - 10);

    setPopup({ contact, x: px, y: py, arrowSide, clickX, clickY });
    setPopupTab('recordings');
  }, []);

  const closePopup = () => setPopup(null);

  const recordings = popup ? (MOCK_RECORDINGS[popup.contact.id] || []) : [];
  const emails = popup ? (MOCK_EMAILS[popup.contact.id] || []) : [];
  const products = popup ? (MOCK_PRODUCTS[popup.contact.id] || []) : [];

  return (
    <div className="crm-page" ref={pageRef}>
      {/* List tabs */}
      <div className="crm-lists">
        {LISTS.map((list) => (
          <button
            key={list.id}
            className={`crm-list-tab ${activeList === list.id ? 'crm-list-tab--active' : ''}`}
            onClick={() => setActiveList(list.id)}
          >
            {list.name}
          </button>
        ))}
        <button className="crm-list-tab crm-list-tab--create">
          <Plus size={14} />
          Create a new list
        </button>
      </div>

      {/* Toolbar */}
      <div className="crm-toolbar">
        <div className="crm-toolbar-left">
          <button className="crm-pill">
            <Filter size={14} />
            Filters
          </button>
          <button className="crm-pill">
            <ArrowUpDown size={14} />
            Sort
          </button>
        </div>
        <div className="crm-toolbar-right">
          {searchOpen ? (
            <div className="crm-search-box">
              <Search size={14} className="crm-search-icon" />
              <input
                className="crm-search-input"
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                onBlur={() => { if (!search) setSearchOpen(false); }}
              />
            </div>
          ) : (
            <button className="crm-pill" onClick={() => setSearchOpen(true)}>
              <Search size={14} />
              Search Contacts
            </button>
          )}
        </div>
      </div>

      {/* View switcher */}
      <div className="crm-views">
        <button
          className={`crm-view-tab ${view === 'table' ? 'crm-view-tab--active' : ''}`}
          onClick={() => setView('table')}
        >
          Table
        </button>
        <button
          className={`crm-view-tab ${view === 'kanban' ? 'crm-view-tab--active' : ''}`}
          onClick={() => setView('kanban')}
        >
          Kan-Ban
        </button>
      </div>

      {/* Table View */}
      {view === 'table' && (
        <div className="crm-table-wrap">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Contact Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Business Name</th>
                <th>Created At</th>
                <th>Lead Status</th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const st = STATUS_COLORS[c.status] || { bg: '#f3f4f6', color: '#374151' };
                return (
                  <tr key={c.id} onClick={(e) => openContact(c, e)} className="crm-row-clickable">
                    <td className="crm-cell-name">{c.name}</td>
                    <td>{c.phone}</td>
                    <td className="crm-cell-email">{c.email}</td>
                    <td>{c.business}</td>
                    <td className="crm-cell-date">{c.created}</td>
                    <td>
                      <span className="crm-status" style={{ background: st.bg, color: st.color }}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div className="crm-tags">
                        {c.tags.map((t) => (
                          <span key={t} className="crm-tag">{t}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="crm-empty">No contacts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="crm-kanban">
          {STATUSES.map((status) => {
            const st = STATUS_COLORS[status];
            const cards = filtered.filter((c) => c.status === status);
            return (
              <div key={status} className="crm-kb-col">
                <div className="crm-kb-col-header">
                  <span className="crm-kb-col-dot" style={{ background: st.color }} />
                  <span className="crm-kb-col-title">{status}</span>
                  <span className="crm-kb-col-count">{cards.length}</span>
                </div>
                <div className="crm-kb-cards">
                  {cards.map((c) => (
                    <div key={c.id} className="crm-kb-card" onClick={(e) => openContact(c, e)}>
                      <div className="crm-kb-card-name">{c.name}</div>
                      <div className="crm-kb-card-biz">{c.business}</div>
                      <div className="crm-kb-card-email">{c.email}</div>
                      <div className="crm-kb-card-footer">
                        <span className="crm-kb-card-date">{c.created}</span>
                        <div className="crm-tags">
                          {c.tags.map((t) => (
                            <span key={t} className="crm-tag">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contact Detail Popup */}
      {popup && (
        <>
          <div className="crm-popup-overlay" onClick={closePopup} />

          {/* Triangle spike — positioned directly at click coordinates */}
          {(() => {
            const popupW = 520;
            // Calculate gap between click point and popup edge (spike stretches to bridge it)
            const gap = popup.arrowSide === 'left'
              ? Math.max(popup.x - popup.clickX, 8)
              : Math.max(popup.clickX - (popup.x + popupW), 8);
            const sw = gap + 1; // +1px overlap into popup to cover its border

            if (popup.arrowSide === 'left') {
              // Tip at left, base touches popup's left edge
              return (
                <svg
                  className="crm-popup-spike-svg"
                  style={{ left: popup.clickX, top: popup.clickY - 10, width: sw, height: 20 }}
                >
                  <polygon points={`0,10 ${sw},0 ${sw},20`} fill="var(--bg-white)" />
                  <line x1="0" y1="10" x2={sw} y2="0" stroke="var(--border-light)" strokeWidth="1" />
                  <line x1="0" y1="10" x2={sw} y2="20" stroke="var(--border-light)" strokeWidth="1" />
                </svg>
              );
            } else {
              // Tip at right, base touches popup's right edge
              return (
                <svg
                  className="crm-popup-spike-svg"
                  style={{ left: popup.x + popupW - 1, top: popup.clickY - 10, width: sw, height: 20 }}
                >
                  <polygon points={`${sw},10 0,0 0,20`} fill="var(--bg-white)" />
                  <line x1={sw} y1="10" x2="0" y2="0" stroke="var(--border-light)" strokeWidth="1" />
                  <line x1={sw} y1="10" x2="0" y2="20" stroke="var(--border-light)" strokeWidth="1" />
                </svg>
              );
            }
          })()}

          <div
            className="crm-popup"
            style={{ left: popup.x, top: popup.y }}
          >
            {/* Close button */}
            <button className={`crm-popup-close ${popup.arrowSide === 'right' ? 'crm-popup-close--left' : ''}`} onClick={closePopup}>
              <X size={16} />
            </button>

            {/* Contact info */}
            <div className="crm-popup-info">
              <h2 className="crm-popup-name">{popup.contact.name}</h2>
              <div className="crm-popup-fields">
                <div className="crm-popup-field">
                  <Phone size={14} className="crm-popup-field-icon" />
                  <span>{popup.contact.phone}</span>
                </div>
                <div className="crm-popup-field">
                  <Mail size={14} className="crm-popup-field-icon" />
                  <span className="crm-popup-field-email">{popup.contact.email}</span>
                </div>
                <div className="crm-popup-field">
                  <Building2 size={14} className="crm-popup-field-icon" />
                  <span>{popup.contact.business}</span>
                </div>
                <div className="crm-popup-field">
                  <Calendar size={14} className="crm-popup-field-icon" />
                  <span>Created {popup.contact.created}</span>
                </div>
              </div>
              <div className="crm-popup-meta">
                <span
                  className="crm-status"
                  style={{
                    background: STATUS_COLORS[popup.contact.status]?.bg,
                    color: STATUS_COLORS[popup.contact.status]?.color,
                  }}
                >
                  {popup.contact.status}
                </span>
                {popup.contact.tags.map((t) => (
                  <span key={t} className="crm-tag">{t}</span>
                ))}
              </div>

              {/* Social Media */}
              <div className="crm-popup-socials">
                <span className="crm-popup-section-label">Social Media</span>
                {SOCIAL_PLATFORMS.map(({ key, Icon, color }) => {
                  const accounts = popup.contact.socials?.[key] || [];
                  return (
                    <div key={key} className="crm-social-row">
                      <div className="crm-social-icon" style={{ color }}>
                        <Icon size={16} />
                      </div>
                      <div className="crm-social-accounts">
                        {accounts.map((url, i) => (
                          <div key={i} className="crm-social-link-chip">
                            <a href={url} target="_blank" rel="noopener noreferrer" className="crm-social-url">{url.replace(/^https?:\/\//, '')}</a>
                            <button
                              className="crm-social-remove"
                              onClick={() => {
                                updateContact(popup.contact.id, (c) => ({
                                  ...c,
                                  socials: {
                                    ...c.socials,
                                    [key]: c.socials[key].filter((_, idx) => idx !== i),
                                  },
                                }));
                              }}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ))}
                        {addingSocial?.platform === key ? (
                          <form
                            className="crm-social-add-form"
                            onSubmit={(ev) => {
                              ev.preventDefault();
                              if (!socialInput.trim()) return;
                              updateContact(popup.contact.id, (c) => ({
                                ...c,
                                socials: {
                                  ...c.socials,
                                  [key]: [...(c.socials[key] || []), socialInput.trim()],
                                },
                              }));
                              setSocialInput('');
                              setAddingSocial(null);
                            }}
                          >
                            <input
                              className="crm-social-add-input"
                              placeholder="https://..."
                              value={socialInput}
                              onChange={(ev) => setSocialInput(ev.target.value)}
                              autoFocus
                              onBlur={() => { if (!socialInput.trim()) { setAddingSocial(null); setSocialInput(''); } }}
                              onKeyDown={(ev) => { if (ev.key === 'Escape') { setAddingSocial(null); setSocialInput(''); } }}
                            />
                          </form>
                        ) : (
                          <button
                            className="crm-social-add-btn"
                            onClick={() => { setAddingSocial({ platform: key }); setSocialInput(''); }}
                          >
                            <Plus size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Editable Notes */}
              <div className="crm-popup-notes">
                <span className="crm-popup-section-label">Notes</span>
                <textarea
                  className="crm-popup-notes-textarea"
                  value={popup.contact.notes || ''}
                  onChange={(ev) => {
                    updateContact(popup.contact.id, (c) => ({ ...c, notes: ev.target.value }));
                  }}
                  placeholder="Add notes about this contact..."
                  rows={3}
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="crm-popup-tabs">
              <button
                className={`crm-view-tab ${popupTab === 'recordings' ? 'crm-view-tab--active' : ''}`}
                onClick={() => setPopupTab('recordings')}
              >
                Call Recordings
              </button>
              <button
                className={`crm-view-tab ${popupTab === 'emails' ? 'crm-view-tab--active' : ''}`}
                onClick={() => setPopupTab('emails')}
              >
                Emails
              </button>
              <button
                className={`crm-view-tab ${popupTab === 'products' ? 'crm-view-tab--active' : ''}`}
                onClick={() => setPopupTab('products')}
              >
                Products Purchased
              </button>
            </div>

            {/* Tab content */}
            <div className="crm-popup-tab-content">
              {popupTab === 'recordings' && (
                <div className="crm-popup-list">
                  {recordings.length === 0 && <p className="crm-popup-empty">No call recordings yet.</p>}
                  {recordings.map((r) => (
                    <div key={r.id} className="crm-rec-item">
                      <img src="/fireflies-square-logo.png" alt="" className="crm-rec-logo" />
                      <div className="crm-rec-info">
                        <span className="crm-rec-name">{r.name}</span>
                        <span className="crm-rec-meta">{r.date} &middot; {r.duration}</span>
                      </div>
                      <div className="crm-rec-actions">
                        <button className="crm-rec-btn" title="Play">
                          <Play size={14} />
                        </button>
                        <button className="crm-rec-btn" title="Download">
                          <Download size={14} />
                        </button>
                        <button className="crm-rec-btn" title="Open">
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {popupTab === 'emails' && (
                <div className="crm-popup-list">
                  {emails.length === 0 && <p className="crm-popup-empty">No emails yet.</p>}
                  {emails.map((em) => (
                    <div key={em.id} className="crm-email-item">
                      <div className="crm-email-top">
                        <span className="crm-email-subject">{em.subject}</span>
                        <span className="crm-email-date">{em.date}</span>
                      </div>
                      <p className="crm-email-snippet">{em.snippet}</p>
                    </div>
                  ))}
                  <button className="crm-email-compose">
                    <Send size={14} />
                    Compose New Email to {popup.contact.name.split(' ')[0]}
                  </button>
                </div>
              )}

              {popupTab === 'products' && (
                <div className="crm-popup-list">
                  {products.length === 0 && <p className="crm-popup-empty">No products purchased yet.</p>}
                  {products.map((p) => (
                    <div key={p.id} className="crm-product-item">
                      <div className="crm-product-info">
                        <span className="crm-product-name">{p.name}</span>
                        <span className="crm-product-date">{p.date}</span>
                      </div>
                      <span className="crm-product-price">{p.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
