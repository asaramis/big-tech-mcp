export interface Episode {
    podcast_title: string;
    episode_title: string;
    date: string;
    episode_description: string;
    full_transcript: string;
    url: string;
    scraped_at: string;
}
export interface ProcessedEpisode {
    title: string;
    date: string;
    content: string;
    url: string;
    description: string;
}
export declare function loadTranscripts(): Promise<ProcessedEpisode[]>;
export declare function extractSnippet(content: string, searchTerms: string[], snippetLength?: number): string;
//# sourceMappingURL=loader.d.ts.map