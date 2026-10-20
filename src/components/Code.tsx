import { Fragment } from 'react';

/** Paths break only after "/"; identifiers never split. */
export function Breakable({ text }: { text: string }) {
  const parts = text.split(/(?<=\/)/);
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && <wbr />}
        </Fragment>
      ))}
    </>
  );
}

/** Renders `backticked` spans as code and leaves the words around them in the body face. */
export function Ticks({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((part, i) =>
        part.startsWith('`') ? (
          <code key={i}>
            <Breakable text={part.slice(1, -1)} />
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
