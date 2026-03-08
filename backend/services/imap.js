import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

const CONNECTION_TIMEOUT = 15000; // 15s

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
    ),
  ]);
}

function createClient(account) {
  return new ImapFlow({
    host: account.imap_host,
    port: account.imap_port,
    secure: account.imap_port === 993,
    auth: {
      user: account.username,
      pass: account.password,
    },
    logger: false,
    tls: {
      rejectUnauthorized: true,
    },
    connectionTimeout: CONNECTION_TIMEOUT,
    greetingTimeout: CONNECTION_TIMEOUT,
    socketTimeout: 30000,
  });
}

/**
 * Connect to an IMAP server and fetch emails.
 */
export async function fetchEmails(account, { folder = 'INBOX', limit = 50, since } = {}) {
  const client = createClient(account);
  const emails = [];

  try {
    await withTimeout(client.connect(), CONNECTION_TIMEOUT, 'IMAP connect');

    const lock = await client.getMailboxLock(folder);
    try {
      const searchCriteria = since ? { since } : 'ALL';
      const messages = client.fetch(searchCriteria, {
        envelope: true,
        source: true,
        uid: true,
        flags: true,
        bodyStructure: true,
      }, { uid: true });

      let count = 0;
      for await (const msg of messages) {
        if (count >= limit) break;

        const parsed = await simpleParser(msg.source);

        const attachments = (parsed.attachments || []).map((att) => ({
          filename: att.filename || 'attachment',
          mime_type: att.contentType,
          size: att.size,
          content: att.content,
        }));

        emails.push({
          message_id: parsed.messageId || null,
          in_reply_to: parsed.inReplyTo || null,
          references: parsed.references || [],
          from_name: parsed.from?.value?.[0]?.name || '',
          from_email: parsed.from?.value?.[0]?.address || '',
          to_emails: (parsed.to?.value || []).map((t) => ({ name: t.name || '', email: t.address })),
          cc_emails: (parsed.cc?.value || []).map((c) => ({ name: c.name || '', email: c.address })),
          subject: parsed.subject || '(no subject)',
          body_text: parsed.text || '',
          body_html: parsed.html || null,
          date: parsed.date || new Date(),
          is_read: msg.flags?.has('\\Seen') || false,
          is_starred: msg.flags?.has('\\Flagged') || false,
          has_attachments: attachments.length > 0,
          attachments,
          uid: msg.uid,
        });

        count++;
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (err) {
    try { await client.logout(); } catch (_) {}
    throw err;
  }

  return emails;
}

/**
 * Validate IMAP connection credentials.
 */
export async function validateImapConnection(account) {
  const client = createClient(account);

  try {
    await withTimeout(client.connect(), CONNECTION_TIMEOUT, 'IMAP connect');
    await client.logout();
    return { ok: true };
  } catch (err) {
    try { await client.logout(); } catch (_) {}
    return { ok: false, error: err.message };
  }
}
