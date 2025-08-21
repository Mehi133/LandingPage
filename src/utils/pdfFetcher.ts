import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches the latest PDF URL from the database
 */
export const getPdfUrl = async (): Promise<string | null> => {
  try {
    console.log('Fetching PDF URL from database...');
    
    const { data, error } = await supabase
      .from('pdfUrl')
      .select('pdf_Url')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    console.log('Database query result:', { data, error });
    
    if (error) {
      console.error('Database query error:', error);
      return null;
    }
    
    if (!data || !data.pdf_Url) {
      console.log('No PDF URL found in database');
      return null;
    }
    
    console.log('Successfully retrieved PDF URL from database:', data.pdf_Url);
    return data.pdf_Url;
  } catch (error) {
    console.error('Unexpected error fetching PDF URL:', error);
    return null;
  }
};
