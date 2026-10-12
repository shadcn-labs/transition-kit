import { LRUCache } from "lru-cache";

import { GITHUB } from "@/constants/links";

interface Stargazer {
  login: string;
  avatar_url: string;
}

const stargazersCache = new LRUCache<string, Stargazer[]>({
  fetchMethod: async (): Promise<Stargazer[]> => {
    try {
      const pages: Stargazer[] = [];
      let page = 1;

      while (page <= 5) {
        const response = await fetch(
          `https://api.github.com/repos/${GITHUB.org}/${GITHUB.repo}/stargazers?per_page=100&page=${page}`,
          {
            headers: {
              Accept: "application/vnd.github+json",
              "X-GitHub-Api-Version": "2022-11-28",
            },
          }
        );

        if (!response.ok) {
          break;
        }

        const data: Stargazer[] = await response.json();
        if (data.length === 0) {
          break;
        }

        pages.push(...data);
        if (data.length < 100) {
          break;
        }
        page += 1;
      }

      return pages.filter((s) => s.login !== GITHUB.user);
    } catch {
      return [];
    }
  },
  max: 1,
  ttl: 86_400_000,
});

export const getStargazers = async (): Promise<Stargazer[]> =>
  (await stargazersCache.fetch("stargazers")) ?? [];

const stargazerCountCache = new LRUCache<string, number>({
  fetchMethod: async () => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB.org}/${GITHUB.repo}`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      if (!response.ok) {
        return 0;
      }

      const json = (await response.json()) as { stargazers_count?: number };
      return Number(json.stargazers_count) || 0;
    } catch {
      return 0;
    }
  },
  max: 1,
  ttl: 86_400_000,
});

export const getStargazerCount = async (): Promise<number> =>
  (await stargazerCountCache.fetch("count")) ?? 0;
