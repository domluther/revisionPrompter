import { useNavigate } from "react-router";
import { useMinutes, useWatched } from "../lib/storage";
import { displayTitle, groupBySection, pickTopic, topics } from "../lib/topics";

export default function Home() {
  const navigate = useNavigate();
  const { watched, toggle, setMany } = useWatched();
  const [minutes, setMinutes] = useMinutes();
  const sections = groupBySection();
  const allIds = topics.map((t) => t.id);
  const count = topics.filter((t) => watched.has(t.id)).length;

  function pick() {
    const t = pickTopic(watched);
    if (t) navigate(`/topic/${t.id}`);
  }

  return (
    <div className="container">
      <section className="card controls">
        <h1>Pick a topic</h1>
        <p>
          Tick the videos you have watched. Press the button and write down
          everything you can remember about the topic on paper or a whiteboard.
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
            <button type="button" onClick={() => setMany(allIds, true)}>
              Select all
            </button>
            <button type="button" onClick={() => setMany(allIds, false)}>
              Clear all
            </button>
          </div>
        </div>
        <p className="muted">
          Tick a whole SLR with its checkbox, or open it to choose individual
          videos.
        </p>
        {sections.map(([section, items]) => {
          const ids = items.map((t) => t.id);
          const n = ids.filter((id) => watched.has(id)).length;
          return (
            <details className="slr" key={section}>
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
                  <li key={t.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={watched.has(t.id)}
                        onChange={() => toggle(t.id)}
                      />
                      {displayTitle(t)}
                    </label>
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
