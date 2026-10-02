import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase URL & Anon Key from Vite environment variables or local storage
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('meetmee_supabase_url') || '' : '';
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('meetmee_supabase_anon_key') || '' : '';

export const activeSupabaseUrl = (envUrl || storedUrl).trim();
export const activeSupabaseKey = (envKey || storedKey).trim();

export const isSupabaseConfigured = Boolean(
  activeSupabaseUrl && 
  activeSupabaseKey && 
  activeSupabaseUrl.includes('supabase.co')
);

export const supabase = isSupabaseConfigured 
  ? createClient(activeSupabaseUrl, activeSupabaseKey) 
  : null;

// Dynamic Credential Updater
export const saveSupabaseCredentials = (url, key) => {
  if (url) localStorage.setItem('meetmee_supabase_url', url.trim());
  if (key) localStorage.setItem('meetmee_supabase_anon_key', key.trim());
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem('meetmee_supabase_url');
  localStorage.removeItem('meetmee_supabase_anon_key');
};

// 1. Sync User to Supabase
export const syncUserToSupabase = async (user) => {
  if (!supabase) return { success: false, reason: 'not_configured' };
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.name,
        role: user.role,
        subscription_tier: user.plan || 'free',
        meetings_used: String(user.meetingsCount || 0),
        allow_comic: user.plan === 'yearly' || user.plan === 'monthly',
        allow_podcast: user.plan === 'yearly',
        allow_native_assistant: user.plan === 'yearly'
      }, { onConflict: 'email' });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn("Supabase user sync notice:", err);
    return { success: false, error: err.message };
  }
};

// 2. Sync Meeting to Supabase
export const syncMeetingToSupabase = async (meeting, userId) => {
  if (!supabase) return { success: false, reason: 'not_configured' };
  try {
    const { data, error } = await supabase
      .from('meetings')
      .upsert({
        id: meeting.id,
        user_id: userId,
        title: meeting.title,
        platform: meeting.platform,
        meeting_url: meeting.url || '',
        status: 'completed',
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });
    if (error) throw error;

    // Sync summary if present
    if (meeting.summary) {
      await supabase.from('meeting_summaries').upsert({
        id: `sum-${meeting.id}`,
        meeting_id: meeting.id,
        tldr_json: JSON.stringify(meeting.summary.tldr || []),
        hint_notes_json: JSON.stringify(meeting.summary.anchors || []),
        action_items_json: JSON.stringify(meeting.summary.actions || [])
      }, { onConflict: 'meeting_id' });
    }

    return { success: true, data };
  } catch (err) {
    console.warn("Supabase meeting sync notice:", err);
    return { success: false, error: err.message };
  }
};

// 3. Fetch Meetings from Supabase for a User
export const fetchMeetingsFromSupabase = async (userId) => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('*, meeting_summaries(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Supabase fetch notice:", err);
    return [];
  }
};
