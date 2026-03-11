import { supabase } from '../middleware/auth.js';

export async function linkParticipantsToContacts(meetingId, userId, participants) {
  if (!participants?.length) return;

  // Get user's contacts
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, name, email')
    .eq('user_id', userId);

  if (!contacts?.length) return;

  const linked = [];

  for (const participant of participants) {
    const pName = (participant.name || '').toLowerCase().trim();
    const pEmail = (participant.email || '').toLowerCase().trim();

    // Match by email first, then by name
    const match = contacts.find(c => {
      if (pEmail && c.email && c.email.toLowerCase() === pEmail) return true;
      if (pName && c.name && c.name.toLowerCase() === pName) return true;
      return false;
    });

    if (match) {
      linked.push({
        meeting_id: meetingId,
        contact_id: match.id,
        role: participant.is_host ? 'host' : 'participant',
      });
    }
  }

  if (linked.length) {
    const { error } = await supabase
      .from('meeting_contacts')
      .upsert(linked, { onConflict: 'meeting_id,contact_id' });

    if (error) {
      console.error('[contact-linker] Error linking contacts:', error.message);
    } else {
      console.log(`[contact-linker] Linked ${linked.length} contacts to meeting ${meetingId}`);
    }
  }
}
