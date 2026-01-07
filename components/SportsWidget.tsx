
import React from 'react';

// Fix for JSX IntrinsicElements error for custom element api-sports-widget
// We augment the React namespace to include the custom element definition so TypeScript recognizes it in JSX
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'api-sports-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'data-type'?: string;
        'data-key'?: string;
        'data-sport'?: string;
        'data-lang'?: string;
        'data-theme'?: string;
        'data-target-game'?: string;
        'data-target-league'?: string;
        'data-show-logos'?: string;
        'data-show-errors'?: string;
        'data-league'?: string;
        'data-season'?: string;
        'data-show-toolbar'?: string;
        'data-refresh'?: string;
      }, HTMLElement>;
    }
  }
}

interface SportsWidgetProps {
  type: string;
  apiKey: string;
  leagueId?: string;
  season?: string;
  sport?: string;
  lang?: string;
  target?: string;
  refresh?: string;
}

export const SportsWidget: React.FC<SportsWidgetProps> = ({ 
  type, 
  apiKey, 
  leagueId, 
  season, 
  sport = 'football', 
  lang = 'fr',
  target = 'modal',
  refresh
}) => {
  return (
    <div className="w-full bg-[#0c0c0e] rounded-[2.5rem] border border-white/5 overflow-hidden animate-fade">
      {/* Config du Widget */}
      <api-sports-widget
        data-type="config"
        data-key={apiKey}
        data-sport={sport}
        data-lang={lang}
        data-theme="PronosAI"
        data-target-game={target}
        data-target-league={target}
        data-show-logos="true"
        data-show-errors="true"
      ></api-sports-widget>

      {/* Rendu du Widget spécifique */}
      {type === 'leagues' && (
        <api-sports-widget 
          data-type="leagues" 
          data-target-league={target}
        ></api-sports-widget>
      )}

      {type === 'standings' && leagueId && season && (
        <api-sports-widget 
          data-type="standings" 
          data-league={leagueId} 
          data-season={season}
        ></api-sports-widget>
      )}

      {type === 'games' && (
        <api-sports-widget 
          data-type="games" 
          data-show-toolbar="true"
          data-target-game={target}
          data-refresh={refresh}
        ></api-sports-widget>
      )}
    </div>
  );
};
