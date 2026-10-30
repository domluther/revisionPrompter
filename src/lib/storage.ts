import { useCallback, useEffect, useState } from "react";

const WATCHED_KEY = "recall.watched";
const MINUTES_KEY = "recall.minutes";
const RECENT_KEY = "recall.recent";

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
