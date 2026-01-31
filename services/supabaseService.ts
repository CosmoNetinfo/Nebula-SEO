
import { createClient } from '@supabase/supabase-js';
import { SavedSeoResult } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export const saveArticleToDb = async (article: SavedSeoResult) => {
    if (!supabase) return null;
    
    const { data, error } = await supabase
        .from('articles')
        .upsert([
            { 
                id: article.id,
                title: article.title,
                original_text: article.originalArticleText,
                full_json: article,
                created_at: new Date().toISOString()
            }
        ])
        .select();

    if (error) {
        console.error('Error saving to Supabase:', error);
        throw error;
    }
    return data;
};

export const loadArticlesFromDb = async (): Promise<SavedSeoResult[]> => {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

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
