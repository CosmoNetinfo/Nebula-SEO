
import { createClient } from '@supabase/supabase-js';
import { SavedSeoResult } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let dbClient = null;
try {
    if (supabaseUrl && supabaseKey) {
        dbClient = createClient(supabaseUrl, supabaseKey);
    }
} catch (e) {
    console.error("Supabase init failed:", e);
}

export const supabase = dbClient;

export const saveArticleToDb = async (article: SavedSeoResult) => {
    if (!supabase) return null;
    
    const user_id = localStorage.getItem('cosmonet_user_id');
    const { data, error } = await supabase
        .from('articles')
        .upsert([
            { 
                id: article.id,
                title: article.title,
                original_text: article.originalArticleText,
                full_json: article,
                created_at: new Date().toISOString(),
                user_id: user_id
            }
        ])
        .select();

    if (error) {
        console.error('Error saving to Supabase:', error);
        throw error;
    }
    return data;
};

export const saveUserSettingsToDb = async (settings: any) => {
    if (!supabase) return null;
    const user_id = localStorage.getItem('cosmonet_user_id');
    if (!user_id) return null;

    const { data, error } = await supabase
        .from('user_settings')
        .upsert([
            { 
                user_id: user_id,
                settings: settings,
                updated_at: new Date().toISOString()
            }
        ])
        .select();

    if (error) {
        console.error('Error saving settings to Supabase:', error);
        throw error;
    }
    return data;
};

export const loadUserSettingsFromDb = async () => {
    if (!supabase) return null;
    const user_id = localStorage.getItem('cosmonet_user_id');
    if (!user_id) return null;

    const { data, error } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', user_id)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error loading settings from Supabase:', error);
        return null;
    }
    return data?.settings || null;
};

export const loadArticlesFromDb = async (): Promise<SavedSeoResult[]> => {
    if (!supabase) return [];

    const user_id = localStorage.getItem('cosmonet_user_id');
    let query = supabase.from('articles').select('*');
    
    if (user_id) {
        query = query.eq('user_id', user_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading from Supabase:', error);
        return [];
    }

    // Map DB format back to application format
    return data.map((item: any) => item.full_json as SavedSeoResult);
};

export const deleteArticleFromDb = async (id: string) => {
    if (!supabase) return;

    const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting from Supabase:', error);
        throw error;
    }
};
