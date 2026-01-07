
import { Match } from '../types';
import { searchRealMatchesViaAI } from './geminiMatchSearchService';

// On ignore l'API Football-Data qui est trop instable/limitée en mode gratuit
// L'IA avec Google Search est beaucoup plus performante pour trouver des matchs partout.

export const fetchMatchesByDate = async (date: string, onStatusUpdate?: (status: string) => void): Promise<{matches: Match[], source: 'API' | 'AI_SEARCH' | 'MOCK'}> => {
  try {
    if (onStatusUpdate) onStatusUpdate("Initialisation du scanner Quantum...");
    
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    if (onStatusUpdate) onStatusUpdate("Scan du Web mondial via Gemini IA...");
    const aiMatches = await searchRealMatchesViaAI(formattedDate);
    
    if (aiMatches && aiMatches.length > 0) {
      if (onStatusUpdate) onStatusUpdate(`${aiMatches.length} matchs synchronisés.`);
      return { matches: aiMatches, source: 'AI_SEARCH' };
    }

    if (onStatusUpdate) onStatusUpdate("Recherche étendue activée...");
    // Fallback Mock si vraiment le web est vide (très rare)
    return { matches: [], source: 'MOCK' };
  } catch (error) {
    console.error("Service API Error:", error);
    if (onStatusUpdate) onStatusUpdate("Échec du scan. Tentative de reconnexion...");
    return { matches: [], source: 'MOCK' };
  }
};
