import raw from "../data/topics.json";

export interface Topic {
  id: string;
  section: string;
  title: string;
  url: string;
  hints: string[];
  definitions: { term: string; definition: string }[];
  points: string[];
}

export const topics = raw as Topic[];

export function displayTitle(t: Topic) {
  return t.title.replace(/^Flipped\s*[-–]\s*/, "");
}

export function findTopic(id: string | undefined) {
  return topics.find((t) => t.id === id);
}

export function groupBySection() {
  const map = new Map<string, Topic[]>();
  for (const t of topics) {
    map.set(t.section, [...(map.get(t.section) ?? []), t]);
  }
  return [...map.entries()];
}

import { getRecent } from "./storage";

// Random pick from watched topics, avoiding the most recent ones where possible.
export function pickTopic(watched: Set<string>, excludeId?: string) {
  const pool = topics.filter((t) => watched.has(t.id));
  if (pool.length === 0) return undefined;
  const recent = new Set(getRecent());
  if (excludeId) recent.add(excludeId);
  const fresh = pool.filter((t) => !recent.has(t.id));
  const choices = fresh.length ? fresh : pool.filter((t) => t.id !== excludeId);
  const list = choices.length ? choices : pool;
  return list[Math.floor(Math.random() * list.length)];
}
