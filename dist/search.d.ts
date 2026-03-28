import { ProcessedEpisode } from "./loader.js";
export interface SearchResult {
    title: string;
    date: string;
    snippet: string;
    url: string;
    relevance: number;
}
export declare function initializeIndex(loadedEpisodes: ProcessedEpisode[]): void;
export declare function searchTranscripts(query: string, limit?: number): Promise<SearchResult[]>;
export declare function getEpisode(titleQuery: string): ProcessedEpisode | null;
export declare function listEpisodes(): string[];
export declare function getRecentEpisodes(limit?: number): ProcessedEpisode[];
//# sourceMappingURL=search.d.ts.map