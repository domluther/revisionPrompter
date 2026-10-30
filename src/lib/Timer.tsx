import { useEffect, useRef, useState } from "react";

interface Props {
  minutes: number;
  onFinish: () => void;
}

function format(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Timer({ minutes, onFinish }: Props) {
  const [duration, setDuration] = useState(minutes * 60_000);
  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(true);
  const [runId, setRunId] = useState(0);
  const endRef = useRef(Date.now() + duration);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  // biome-ignore lint/correctness/useExhaustiveDependencies: `remaining` is read only when (re)starting, runId forces a restart.
  useEffect(() => {
    if (!running) return;
    endRef.current = Date.now() + remaining;
    const tick = () => {
      const left = endRef.current - Date.now();
      if (left <= 0) {
        setRemaining(0);
        setRunning(false);
        finishRef.current();
      } else {
        setRemaining(left);
      }
    };
    const handle = setInterval(tick, 250);
    return () => clearInterval(handle);
  }, [running, runId]);

  function reset(newMinutes?: number) {
    const d = (newMinutes ?? duration / 60_000) * 60_000;
    setDuration(d);
    setRemaining(d);
    setRunning(false);
  }

  const done = remaining <= 0;

  return (
    <div className={`timer${done ? " done" : ""}`}>
      <div className="time" role="timer" aria-live="off">
        {done ? "Time's up!" : format(remaining)}
      </div>
      <div className="timer-controls">
        {!done && (
          <button type="button" onClick={() => setRunning((r) => !r)}>
            {running ? "Pause" : "Resume"}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            reset();
            setRunning(true);
            setRunId((n) => n + 1);
          }}
        >
          Restart
        </button>
        <label>
          Minutes
          <input
            type="number"
            min={1}
            max={60}
            value={Math.round(duration / 60_000)}
            onChange={(e) => {
              const v = Math.min(60, Math.max(1, Number(e.target.value) || 1));
              reset(v);
            }}
          />
        </label>
      </div>
    </div>
  );
}
