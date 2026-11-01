import { useState } from "react";
import { useNavigate } from "react-router";
import {
  type RagRating,
  useMinutes,
  useTopicRatings,
  useWatched,
} from "../lib/storage";
import { displayTitle, groupBySection, pickTopic, topics } from "../lib/topics";

type RagFilter = RagRating | "unrated";

const FILTER_OPTIONS: { value: RagFilter; label: string }[] = [
  { value: "red", label: "Red" },
  { value: "amber", label: "Amber" },
  { value: "green", label: "Green" },
  { value: "unrated", label: "Unrated" },
];

export default function Home() {
  const navigate = useNavigate();
  const { watched, toggle, setMany } = useWatched();
  const { ratings, setRating } = useTopicRatings();
  const [minutes, setMinutes] = useMinutes();
  const sections = groupBySection();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Set<RagFilter>>(
    new Set(FILTER_OPTIONS.map((o) => o.value)),
  );
  const allIds = topics.map((t) => t.id);
  const matchingIds = topics
    .filter((t) => filter.has(ratings[t.id] ?? "unrated"))
    .map((t) => t.id);
  const allSelected = filter.size === FILTER_OPTIONS.length;
  const count = topics.filter((t) => watched.has(t.id)).length;

  function toggleFilter(value: RagFilter) {
    setFilter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function pick() {
    const t = pickTopic(watched);
    if (t) navigate(`/topic/${t.id}`);
  }

  return (
    <div className="container">
      <section className="card controls">
        <p className="eyebrow">OCR A-Level Computer Science | H446</p>
        <h1>Pick a topic</h1>
        <p>
          Tick the videos you have watched. Press the button and write down
          everything you can remember about the topic on paper or a whiteboard.
        </p>
        <p className="resource-link">
          For extra support, check out{" "}
          <a
            href="https://www.physicsandmathstutor.com/computer-science-revision/a-level-ocr/"
            target="_blank"
            rel="noreferrer"
          >
            PMT
          </a>{" "}
          or{" "}
          <a
            href="https://www.csnewbs.com/ocr-a-level"
            target="_blank"
            rel="noreferrer"
          >
            CSNewbs
          </a>
          .
        </p>
        <div className="control-row">
          <label>
            Timer (minutes)
            <input
              type="number"
              min={1}
              max={60}
              value={minutes}
              onChange={(e) =>
                setMinutes(
                  Math.min(60, Math.max(1, Number(e.target.value) || 1)),
                )
              }
            />
          </label>
          <button
            type="button"
            className="primary big"
            disabled={count === 0}
            onClick={pick}
          >
            Pick a topic
          </button>
        </div>
        <p className="muted">
          {count === 0
            ? "Tick at least one video below to get started."
            : `${count} of ${topics.length} videos ticked. Your ticks are saved on this device.`}
        </p>
      </section>

      <section className="card">
        <div className="section-head">
          <h2>Videos watched</h2>
          <div className="bulk">
            <details className="rag-filter">
              <summary>
                {allSelected
                  ? "All ratings"
                  : filter.size === 0
                    ? "No ratings"
                    : FILTER_OPTIONS.filter((o) => filter.has(o.value))
                        .map((o) => o.label)
                        .join(" + ")}
              </summary>
              <div className="rag-filter-menu">
                {FILTER_OPTIONS.map((o) => (
                  <label key={o.value}>
                    <input
                      type="checkbox"
                      checked={filter.has(o.value)}
                      onChange={() => toggleFilter(o.value)}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </details>
            <button
              type="button"
              disabled={matchingIds.length === 0}
              onClick={() => setMany(matchingIds, true)}
            >
              {allSelected ? "Select all" : "Select matching"}
            </button>
            <button type="button" onClick={() => setMany(allIds, false)}>
              Clear all
            </button>
          </div>
        </div>
        <div className="bulk">
          <button
            type="button"
            onClick={() => setOpenSections(new Set(sections.map(([s]) => s)))}
          >
            Expand all
          </button>
          <button type="button" onClick={() => setOpenSections(new Set())}>
            Collapse all
          </button>
        </div>
        <p className="muted">
          Tick a whole SLR with its checkbox, or open it to choose individual
          videos.
        </p>
        {sections.map(([section, items]) => {
          const ids = items.map((t) => t.id);
          const n = ids.filter((id) => watched.has(id)).length;
          return (
            <details
              className="slr"
              key={section}
              open={openSections.has(section)}
              onToggle={(e) => {
                const isOpen = e.currentTarget.open;
                setOpenSections((prev) => {
                  if (prev.has(section) === isOpen) return prev;
                  const next = new Set(prev);
                  if (isOpen) next.add(section);
                  else next.delete(section);
                  return next;
                });
              }}
            >
              <summary>
                <input
                  type="checkbox"
                  aria-label={`Select all in ${section}`}
                  checked={n === ids.length}
                  ref={(el) => {
                    if (el) el.indeterminate = n > 0 && n < ids.length;
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => setMany(ids, n !== ids.length)}
                />
                <span className="slr-name">{section}</span>
                <span className="muted">
                  {n}/{ids.length}
                </span>
              </summary>
              <ul className="checklist">
                {items.map((t) => (
                  <li
                    key={t.id}
                    className={
                      ratings[t.id]
                        ? `rag-topic rag-${ratings[t.id]}`
                        : "rag-topic"
                    }
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={watched.has(t.id)}
                        onChange={() => toggle(t.id)}
                      />
                      <span className="topic-checklist-title">
                        {displayTitle(t)}
                      </span>
                    </label>
                    <select
                      className="rag-select"
                      aria-label={`RAG rating for ${displayTitle(t)}`}
                      value={ratings[t.id] ?? ""}
                      onChange={(e) =>
                        setRating(
                          t.id,
                          (e.target.value || null) as RagRating | null,
                        )
                      }
                    >
                      <option value="">Unrated</option>
                      <option value="red">Red</option>
                      <option value="amber">Amber</option>
                      <option value="green">Green</option>
                    </select>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </section>
    </div>
  );
}
