import { readFile } from "fs/promises";
import { join } from "path";

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

// Default path to transcripts JSON file
const DEFAULT_LOCAL_PATH = process.env.BIG_TECH_TRANSCRIPTS_PATH || "../transcripts.json";
const HOSTED_TRANSCRIPTS_PATH = "./transcripts.json";

// Determine which path to use
function getTranscriptsPath(): string {
  if (process.env.MCP_MODE === "sse") {
    return HOSTED_TRANSCRIPTS_PATH;
  }
  return DEFAULT_LOCAL_PATH;
}

// Clean transcript content
function cleanTranscript(content: string): string {
  // Remove excessive whitespace
  const newlinePattern = /\n{3,}/g;
  const whitespacePattern = /\s{2,}/g;
  return content
    .replace(newlinePattern, "\n\n")
    .replace(whitespacePattern, " ")
    .trim();
}

// Extract title from URL as fallback
function extractTitleFromUrl(url: string): string {
  if (!url) return "Untitled Episode";
  
  const match = url.match(/\/([^\/]+)$/);
  if (match) {
    return match[1]
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return "Untitled Episode";
}

export async function loadTranscripts(): Promise<ProcessedEpisode[]> {
  const transcriptsPath = getTranscriptsPath();
  const episodes: ProcessedEpisode[] = [];

  try {
    console.error(`Loading transcripts from ${transcriptsPath}...`);
    
    const rawContent = await readFile(transcriptsPath, "utf-8");
    const rawEpisodes: Episode[] = JSON.parse(rawContent);

    console.error(`Found ${rawEpisodes.length} episodes in JSON file`);

    for (const episode of rawEpisodes) {
      // Skip episodes without transcripts
      if (!episode.full_transcript || episode.full_transcript.trim().length === 0) {
        continue;
      }

      // Get title - try episode_title first, then extract from URL
      let title = episode.episode_title?.trim();
      if (!title) {
        title = extractTitleFromUrl(episode.url);
      }

      // Get date - try date first, then scraped_at
      let date = episode.date?.trim();
      if (!date && episode.scraped_at) {
        date = episode.scraped_at.split('T')[0];
      }

      episodes.push({
        title: title || "Untitled Episode",
        date: date || "Unknown Date",
        content: cleanTranscript(episode.full_transcript),
        url: episode.url || "",
        description: episode.episode_description?.trim() || "",
      });
    }

    console.error(`Loaded ${episodes.length} episodes successfully.`);
  } catch (error) {
    console.error(`Error loading transcripts: ${error}`);
    throw error;
  }

  return episodes;
}

// Extract a snippet around a match position
export function extractSnippet(
  content: string,
  searchTerms: string[],
  snippetLength: number = 600
): string {
  const lowerContent = content.toLowerCase();

  // Find the first occurrence of any search term
  let bestPosition = -1;
  for (const term of searchTerms) {
    const pos = lowerContent.indexOf(term.toLowerCase());
    if (pos !== -1 && (bestPosition === -1 || pos < bestPosition)) {
      bestPosition = pos;
    }
  }

  if (bestPosition === -1) {
    // No match found, return the beginning (skip first ~500 chars which might be intro)
    const startAfter = Math.min(500, content.length);
    return content.slice(startAfter, startAfter + snippetLength) + "...";
  }

  // Extract snippet centered around the match
  const halfLength = Math.floor(snippetLength / 2);
  const start = Math.max(0, bestPosition - halfLength);
  const end = Math.min(content.length, bestPosition + halfLength);

  let snippet = content.slice(start, end);

  // Try to start at a sentence/paragraph boundary
  if (start > 0) {
    const newlineChar = "\n";
    const newlinePos = snippet.indexOf(newlineChar);
    if (newlinePos !== -1 && newlinePos < 100) {
      snippet = snippet.slice(newlinePos + 1);
    }
    snippet = "..." + snippet;
  }

  if (end < content.length) {
    snippet = snippet + "...";
  }

  return snippet.trim();
}