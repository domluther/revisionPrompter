import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import RichText from "../lib/RichText";
import { pushRecent, useMinutes, useWatched } from "../lib/storage";
import Timer from "../lib/Timer";
import { displayTitle, findTopic, pickTopic } from "../lib/topics";

export default function TopicPage() {
  const { id } = useParams();
  const topic = findTopic(id);
  const navigate = useNavigate();
  const { watched } = useWatched();
  const [minutes] = useMinutes();
  const [showHints, setShowHints] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    setShowHints(false);
    setShowAnswers(false);
    if (id) pushRecent(id, 5);
  }, [id]);

  if (!topic) {
    return (
      <div className="container">
        <p>Topic not found.</p>
        <Link to="/">Back</Link>
      </div>
    );
  }

  function next() {
    const t = pickTopic(watched, id);
    if (t) navigate(`/topic/${t.id}`);
  }

  return (
    <div className="container">
      <section className="card topic">
        <p className="muted">{topic.section}</p>
        <h1>{displayTitle(topic)}</h1>
        <Timer
          key={topic.id}
          minutes={minutes}
          onFinish={() => setShowAnswers(true)}
        />
        <p>
          <a href={topic.url} target="_blank" rel="noreferrer">
            ▶ Watch the video again
          </a>
        </p>

        <div className="actions">
          <button type="button" onClick={() => setShowHints((s) => !s)}>
            {showHints ? "Hide hint" : "Show hint"}
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => setShowAnswers((s) => !s)}
          >
            {showAnswers ? "Hide answers" : "I'm finished – show answers"}
          </button>
        </div>
      </section>

      {showHints && (
        <section className="card hint">
          <h2>Hint</h2>
          {topic.hints.length ? (
            <ul>
              {topic.hints.map((h, i) => (
                <li key={i}>
                  <RichText text={h} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No hint is available for this topic.</p>
          )}
        </section>
      )}

      {showAnswers && (
        <section className="card answers">
          <h2>Key definitions</h2>
          <dl>
            {topic.definitions.map((d) => (
              <div key={d.term}>
                <dt>
                  <RichText text={d.term} />
                </dt>
                <dd>
                  <RichText text={d.definition} />
                </dd>
              </div>
            ))}
          </dl>
          <h2>Key points</h2>
          <ul>
            {topic.points.map((p, i) => (
              <li key={i}>
                <RichText text={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="actions footer-actions">
        <button type="button" className="primary" onClick={next}>
          Pick another topic
        </button>
        <Link to="/" className="button">
          Change ticked videos / timer
        </Link>
      </div>
    </div>
  );
}
