import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import RichText from "../lib/RichText";
import {
  pushRecent,
  useMinutes,
  useTopicRatings,
  useWatched,
} from "../lib/storage";
import Timer from "../lib/Timer";
import { displayTitle, findTopic, pickTopic } from "../lib/topics";

export default function TopicPage() {
  const { id } = useParams();
  const topic = findTopic(id);
  const navigate = useNavigate();
  const { watched } = useWatched();
  const { ratings, setRating, saveError } = useTopicRatings();
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
        <p className="muted">{topic.section} | OCR H446</p>
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
          <div className="answer-section definitions-section">
            <h2>Key definitions</h2>
            <p>
              Use these concise definitions to check your recall. For extra
              support, check out{" "}
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
          </div>
          <div className="answer-section key-points-section">
            <h2>Key points</h2>
            <ul>
              {topic.points.map((p, i) => (
                <li key={i}>
                  <RichText text={p} />
                </li>
              ))}
            </ul>
          </div>
          <fieldset className="rag-rating">
            <legend>How confident are you with this topic?</legend>
            <p className="muted">
              Your rating is saved on this device and shown in the topic list.
            </p>
            <div className="rag-options">
              {(
                [
                  ["red", "Red", "Need more practice"],
                  ["amber", "Amber", "Getting there"],
                  ["green", "Green", "Confident"],
                ] as const
              ).map(([rating, label, description]) => (
                <button
                  key={rating}
                  type="button"
                  className={`rag-option rag-${rating}`}
                  aria-pressed={ratings[topic.id] === rating}
                  onClick={() => setRating(topic.id, rating)}
                >
                  <strong>{label}</strong>
                  <span>{description}</span>
                </button>
              ))}
              <button
                type="button"
                className="rag-option rag-clear"
                aria-pressed={!ratings[topic.id]}
                onClick={() => setRating(topic.id, null)}
              >
                <strong>Not rated</strong>
                <span>Clear rating</span>
              </button>
            </div>
            {saveError && (
              <p className="rag-save-error" role="alert">
                Your rating could not be saved. Check that cookies are enabled
                in this browser.
              </p>
            )}
          </fieldset>
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
