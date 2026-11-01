import { useCallback, useEffect, useState } from "react";

const WATCHED_KEY = "recall.watched";
const MINUTES_KEY = "recall.minutes";
const RECENT_KEY = "recall.recent";
const RAG_COOKIE = "recall.rag";
const RAG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type RagRating = "red" | "amber" | "green";
export type TopicRatings = Record<string, RagRating>;

function readTopicRatings(): TopicRatings {
  if (typeof document === "undefined") return {};
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${RAG_COOKIE}=`));
  if (!cookie) return {};

  const ratings: TopicRatings = {};
  for (const entry of cookie.slice(RAG_COOKIE.length + 1).split(",")) {
    const separator = entry.lastIndexOf(":");
    if (separator < 1) continue;

    const id = entry.slice(0, separator);
    const rating = entry.slice(separator + 1);
    if (rating === "red" || rating === "amber" || rating === "green") {
      ratings[id] = rating;
    }
  }
  return ratings;
}

function writeTopicRatings(ratings: TopicRatings) {
  if (typeof document === "undefined") return;
  const value = Object.entries(ratings)
    .map(([id, rating]) => `${id}:${rating}`)
    .join(",");
  // biome-ignore lint/suspicious/noDocumentCookie: Use the widely supported cookie API so ratings persist across browsers.
  document.cookie = `${RAG_COOKIE}=${value}; max-age=${RAG_COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
  if (
    !document.cookie
      .split("; ")
      .some((entry) => entry === `${RAG_COOKIE}=${value}`)
  ) {
    throw new Error("The topic rating cookie could not be saved.");
  }
}

export function useTopicRatings() {
  const [ratings, setRatings] = useState<TopicRatings>(readTopicRatings);
  const [saveError, setSaveError] = useState(false);

  const setRating = useCallback(
    (id: string, rating: RagRating | null) => {
      const next = { ...ratings };
      if (rating) next[id] = rating;
      else delete next[id];
      try {
        writeTopicRatings(next);
        setRatings(next);
        setSaveError(false);
      } catch {
        setSaveError(true);
      }
    },
    [ratings],
  );

  return { ratings, setRating, saveError };
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (e.g. private mode); settings just won't persist.
  }
}

function usePersisted<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => read(key, fallback));
  useEffect(() => write(key, value), [key, value]);
  return [value, setValue] as const;
}

export function useWatched() {
  const [ids, setIds] = usePersisted<string[]>(WATCHED_KEY, []);
  const set = new Set(ids);

  const toggle = useCallback(
    (id: string) =>
      setIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      ),
    [setIds],
  );

  const setMany = useCallback(
    (targets: string[], on: boolean) =>
      setIds((prev) => {
        const next = new Set(prev);
        for (const id of targets) {
          if (on) next.add(id);
          else next.delete(id);
        }
        return [...next];
      }),
    [setIds],
  );

  return { watched: set, toggle, setMany };
}

export function useMinutes() {
  return usePersisted<number>(MINUTES_KEY, 5);
}

export function getRecent(): string[] {
  return read<string[]>(RECENT_KEY, []);
}

export function pushRecent(id: string, keep: number) {
  const next = [id, ...getRecent().filter((x) => x !== id)].slice(0, keep);
  write(RECENT_KEY, next);
}
