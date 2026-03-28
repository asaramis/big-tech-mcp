import FlexSearch from "flexsearch";
import { extractSnippet } from "./loader.js";
// FlexSearch document index
let index = null;
let episodes = [];
export function initializeIndex(loadedEpisodes) {
    episodes = loadedEpisodes;
    // Create a document index
    index = new FlexSearch.Document({
        document: {
            id: "title",
            index: ["title", "content", "description"],
            store: ["title", "date", "content", "url", "description"],
        },
        tokenize: "forward",
        resolution: 9,
        cache: true,
    });
    // Add all episodes to the index
    if (index) {
        for (const episode of episodes) {
            index.add(episode);
        }
    }
    console.error(`Search index initialized with ${episodes.length} episodes.`);
}
export async function searchTranscripts(query, limit = 10) {
    if (!index) {
        throw new Error("Search index not initialized");
    }
    // Search across title, content, and description
    const results = index.search(query, {
        limit: limit * 2, // Get more results to deduplicate
        enrich: true,
    });
    // Collect unique episodes from results
    const seenTitles = new Set();
    const searchResults = [];
    const searchTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    // Process results from all fields
    for (const fieldResult of results) {
        if (!fieldResult.result)
            continue;
        for (const item of fieldResult.result) {
            // Handle both enriched and non-enriched results
            const title = typeof item === "string"
                ? item
                : item.id || item.doc?.title;
            if (!title || seenTitles.has(title))
                continue;
            seenTitles.add(title);
            // Find the full episode
            const episode = episodes.find((e) => e.title === title);
            if (!episode)
                continue;
            const snippet = extractSnippet(episode.content, searchTerms, 600);
            searchResults.push({
                title: episode.title,
                date: episode.date,
                snippet,
                url: episode.url,
                relevance: searchResults.length + 1,
            });
            if (searchResults.length >= limit)
                break;
        }
        if (searchResults.length >= limit)
            break;
    }
    // If FlexSearch didn't find enough, do a simple text search as fallback
    if (searchResults.length < limit) {
        for (const episode of episodes) {
            if (seenTitles.has(episode.title))
                continue;
            const lowerContent = episode.content.toLowerCase();
            const lowerTitle = episode.title.toLowerCase();
            const lowerDescription = episode.description.toLowerCase();
            const hasMatch = searchTerms.some((term) => lowerContent.includes(term) ||
                lowerTitle.includes(term) ||
                lowerDescription.includes(term));
            if (hasMatch) {
                seenTitles.add(episode.title);
                const snippet = extractSnippet(episode.content, searchTerms, 600);
                searchResults.push({
                    title: episode.title,
                    date: episode.date,
                    snippet,
                    url: episode.url,
                    relevance: searchResults.length + 1,
                });
                if (searchResults.length >= limit)
                    break;
            }
        }
    }
    return searchResults;
}
export function getEpisode(titleQuery) {
    // Try exact match first
    let episode = episodes.find((e) => e.title.toLowerCase() === titleQuery.toLowerCase());
    // Try partial match
    if (!episode) {
        episode = episodes.find((e) => e.title.toLowerCase().includes(titleQuery.toLowerCase()));
    }
    return episode || null;
}
export function listEpisodes() {
    return episodes.map((e) => `${e.title} (${e.date})`).sort();
}
export function getRecentEpisodes(limit = 10) {
    // Return most recent episodes (assuming they're in chronological order)
    return episodes.slice(0, limit);
}
//# sourceMappingURL=search.js.map