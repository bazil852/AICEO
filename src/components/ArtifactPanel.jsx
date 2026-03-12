import { useState, useRef } from 'react';
import { X, Copy, Send, Check, Mail, Code, FileText, PenTool, ChevronLeft, Rocket } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import { ARTIFACT_TYPES, parseEmailContent } from '../lib/artifacts';
import { sendEmailApi, deployToNetlify } from '../lib/api';
import './ArtifactPanel.css';

export default function ArtifactPanel({ artifact, emailAccounts, onClose, onChatMessage }) {
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(emailAccounts?.[0]?.id || null);
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState(null);
  const iframeRef = useRef(null);

  if (!artifact) return null;

  const { type, title, content, images } = artifact;
  const typeInfo = ARTIFACT_TYPES[type] || { label: 'Output', icon: 'FileText' };

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text || content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeploy = async () => {
    if (deploying) return;
    setDeploying(true);
    setDeployResult(null);
    setSendError('');
    try {
      const result = await deployToNetlify(content);
      setDeployResult(result);
      if (onChatMessage) {
        onChatMessage(`Deployed to Netlify! Your page is live at ${result.url}`);
      }
    } catch (err) {
      setSendError(err.message);
      if (onChatMessage) {
        onChatMessage(`Deploy failed: ${err.message}`);
      }
    } finally {
      setDeploying(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedAccountId) return;
    const email = parseEmailContent(content);
    setSending(true);
    setSendError('');
    try {
      await sendEmailApi({
        account_id: selectedAccountId,
        to: email.to,
        subject: email.subject,
        body_html: email.body_html,
        body_text: new DOMParser().parseFromString(email.body_html, 'text/html').body.textContent || '',
      });
      setSent(true);
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  };

  const renderIcon = () => {
    switch (type) {
      case 'email': return <Mail size={16} />;
      case 'html_template': return <FileText size={16} />;
      case 'content_post': return <PenTool size={16} />;
      case 'code_block': return <Code size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="ap">
      <div className="ap-header">
        <div className="ap-header-left">
          <button className="ap-back-btn" onClick={onClose}>
            <ChevronLeft size={18} />
          </button>
          {renderIcon()}
          <span className="ap-title">{title}</span>
          <span className="ap-type-badge">{typeInfo.label}</span>
        </div>
        <div className="ap-header-right">
          {type === 'email' && emailAccounts?.length > 0 && (
            <>
              <select
                className="ap-account-select"
                value={selectedAccountId || ''}
                onChange={(e) => setSelectedAccountId(e.target.value)}
              >
                {emailAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.email}</option>
                ))}
              </select>
              <button
                className="ap-btn ap-btn--send"
                onClick={handleSendEmail}
                disabled={sending || sent}
              >
                {sent ? <><Check size={14} /> Sent</> : sending ? 'Sending...' : <><Send size={14} /> Send</>}
              </button>
            </>
          )}
          {type === 'html_template' && (
            <button
              className={`ap-btn ${deployResult ? 'ap-btn--deploy-done' : 'ap-btn--deploy'}`}
              onClick={handleDeploy}
              disabled={deploying || !!deployResult}
            >
              {deployResult ? <><Check size={14} /> Live</> : deploying ? 'Deploying...' : <><Rocket size={14} /> Deploy</>}
            </button>
          )}
          {deployResult && (
            <a href={deployResult.url} target="_blank" rel="noopener noreferrer" className="ap-btn ap-btn--outline ap-deploy-link">
              {deployResult.url.replace('https://', '')}
            </a>
          )}
          {type !== 'email' && (
            <button className="ap-btn ap-btn--outline" onClick={() => handleCopy()}>
              {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
            </button>
          )}
          <button className="ap-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
      </div>

      {sendError && <div className="ap-error">{sendError}</div>}

      <div className="ap-body">
        {type === 'email' && <EmailRenderer content={content} />}
        {type === 'html_template' && <HtmlRenderer content={content} iframeRef={iframeRef} />}
        {type === 'content_post' && <ContentPostRenderer content={content} images={images} />}
        {type === 'code_block' && <CodeRenderer content={content} />}
        {type === 'markdown_doc' && <MarkdownRenderer content={content} />}
      </div>
    </div>
  );
}

function EmailRenderer({ content }) {
  const email = parseEmailContent(content);
  return (
    <div className="ap-email">
      <div className="ap-email-field">
        <label>To</label>
        <span>{email.to || '(no recipient specified)'}</span>
      </div>
      <div className="ap-email-field">
        <label>Subject</label>
        <span>{email.subject || '(no subject)'}</span>
      </div>
      <div className="ap-email-divider" />
      <div className="ap-email-body" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(email.body_html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'span', 'div', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'img', 'hr', 'b', 'i', 'u'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'style', 'class', 'target', 'width', 'height'],
      }) }} />
    </div>
  );
}

function HtmlRenderer({ content, iframeRef }) {
  return (
    <iframe
      ref={iframeRef}
      srcDoc={content}
      className="ap-html-frame"
      title="Template Preview"
      sandbox=""
    />
  );
}

function ContentPostRenderer({ content, images }) {
  return (
    <div className="ap-content-post">
      <div className="ap-content-caption">{content}</div>
      {images?.length > 0 && (
        <div className="ap-content-images">
          {images.map((img, i) => (
            <img key={i} src={img.src} alt={`Generated ${i + 1}`} className="ap-content-image" />
          ))}
        </div>
      )}
    </div>
  );
}

function CodeRenderer({ content }) {
  return (
    <pre className="ap-code">
      <code>{content}</code>
    </pre>
  );
}

function MarkdownRenderer({ content }) {
  return (
    <div className="ap-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
