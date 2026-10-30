import { Fragment } from "react";

// Renders **bold** markers as <strong>; everything else stays plain text.
export default function RichText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i}>{part}</strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
