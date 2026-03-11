import { Router } from 'express';
import { supabase } from '../middleware/auth.js';

const router = Router();

// GET /api/templates — List system + user templates
router.get('/', async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('meeting_templates')
    .select('*')
    .or(`is_system.eq.true,user_id.eq.${userId}`)
    .order('is_system', { ascending: false })
    .order('name');

  if (error) return res.status(500).json({ error: error.message });
  res.json({ templates: data || [] });
});

// POST /api/templates — Create custom template
router.post('/', async (req, res) => {
  const userId = req.user.id;
  const { name, slug, prompt_instructions, output_fields } = req.body;

  if (!name || !prompt_instructions) {
    return res.status(400).json({ error: 'name and prompt_instructions required' });
  }

  const { data, error } = await supabase
    .from('meeting_templates')
    .insert({
      user_id: userId,
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      prompt_instructions,
      output_fields: output_fields || [],
      is_system: false,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ template: data });
});

// PUT /api/templates/:id — Update custom template
router.put('/:id', async (req, res) => {
  const userId = req.user.id;
  const { name, prompt_instructions, output_fields } = req.body;

  const updates = { updated_at: new Date().toISOString() };
  if (name) updates.name = name;
  if (prompt_instructions) updates.prompt_instructions = prompt_instructions;
  if (output_fields) updates.output_fields = output_fields;

  const { data, error } = await supabase
    .from('meeting_templates')
    .update(updates)
    .eq('id', req.params.id)
    .eq('user_id', userId)
    .eq('is_system', false)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ template: data });
});

// DELETE /api/templates/:id — Delete custom template
router.delete('/:id', async (req, res) => {
  const userId = req.user.id;

  const { error } = await supabase
    .from('meeting_templates')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', userId)
    .eq('is_system', false);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

export default router;
