import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { Breakable } from './Code';
import {
  DIAGRAM_H,
  DIAGRAM_W,
  STAGE_H,
  STAGE_W,
  edges,
  loopFrame,
  stages,
  type Stage,
  type StageId,
} from '../content/tnd';

interface PipelineDiagramProps {
  caption: React.ReactNode;
  /** Level of the detail heading, so the diagram fits the outline it sits in. */
  headingLevel?: 2 | 3;
  initial?: StageId;
  /** Play the one-time signal pass on load. */
  animate?: boolean;
}

const pct = (value: number, total: number) => `${(value / total) * 100}%`;
const order = stages.map((s) => s.id);

function conditionalNote(id: StageId) {
  if (id === 'extract') return 'Runs for URL input only.';
  return null;
}

function loopPosition(id: StageId) {
  if (id === 'retrieve') return 'first';
  if (id === 'content') return 'middle';
  if (id === 'verify') return 'last';
  return undefined;
}

function StageSpec({ stage }: { stage: Stage }) {
  const note = conditionalNote(stage.id);
  return (
    <div className="stage-spec">
      <ul className="stage-spec__specs">
        {stage.specs.map((spec) => (
          <li key={spec}>{spec}</li>
        ))}
        {note && <li>{note}</li>}
      </ul>
      <p className="stage-spec__files">
        {stage.files.map((file) => (
          <code key={file}>
            <Breakable text={file} />
          </code>
        ))}
      </p>
    </div>
  );
}

export function PipelineDiagram({
  caption,
  headingLevel = 3,
  initial = 'claims',
  animate = true,
}: PipelineDiagramProps) {
  const DetailHeading = headingLevel === 2 ? 'h2' : 'h3';
  const [selected, setSelected] = useState<StageId>(initial);
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const uid = useId();
  const hintId = `${uid}-hint`;
  const current = stages.find((s) => s.id === selected) ?? stages[0]!;

  const focusStage = (id: StageId, layout: 'graph' | 'list') => {
    setSelected(id);
    refs.current.get(`${layout}:${id}`)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent, layout: 'graph' | 'list') => {
    const index = order.indexOf(selected);
    const last = order.length - 1;
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = Math.min(index + 1, last);
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = Math.max(index - 1, 0);
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    focusStage(order[next]!, layout);
  };

  const stageButton = (stage: Stage, layout: 'graph' | 'list') => {
    const isSelected = stage.id === selected;
    return (
      <button
        type="button"
        ref={(el) => {
          if (el) refs.current.set(`${layout}:${stage.id}`, el);
          else refs.current.delete(`${layout}:${stage.id}`);
        }}
        className="stage"
        aria-pressed={isSelected}
        aria-describedby={hintId}
        tabIndex={isSelected ? 0 : -1}
        onClick={() => setSelected(stage.id)}
        onKeyDown={(event) => onKeyDown(event, layout)}
        style={
          layout === 'graph'
            ? {
                left: pct(stage.box.x, DIAGRAM_W),
                top: pct(stage.box.y, DIAGRAM_H),
                width: pct(STAGE_W, DIAGRAM_W),
                height: pct(STAGE_H, DIAGRAM_H),
                ['--i' as string]: order.indexOf(stage.id),
              }
            : undefined
        }
      >
        <span className="stage__label">{stage.label}</span>
        <span className="stage__sub">{stage.sub}</span>
      </button>
    );
  };

  return (
    <figure className={`pipeline${animate ? ' pipeline--animate' : ''}`}>
      <p id={hintId} className="visually-hidden">
        Select a stage to read its details. Arrow keys move between stages.
      </p>

      {/* Graph layout: wide containers. */}
      <div className="pipeline__graph" role="group" aria-label="TND analysis pipeline">
        <svg
          className="pipeline__lines"
          viewBox={`0 0 ${DIAGRAM_W} ${DIAGRAM_H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <marker id={`${uid}-arrow`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0 8 4 0 8" fill="none" stroke="context-stroke" strokeWidth="1.5" />
            </marker>
          </defs>
          <rect
            className="pipeline__loop"
            x={loopFrame.x}
            y={loopFrame.y}
            width={loopFrame.w}
            height={loopFrame.h}
          />
          {edges.map((edge) => {
            const active = edge.from === selected || edge.to === selected;
            return (
              <path
                key={`${edge.from}-${edge.to}`}
                d={edge.d}
                className={`pipeline__edge${edge.conditional ? ' is-conditional' : ''}${active ? ' is-active' : ''}`}
                markerEnd={`url(#${uid}-arrow)`}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          {animate &&
            // Branches leaving the same stage start together, like the request does.
            edges.map((edge) => (
              <path
                key={`signal-${edge.from}-${edge.to}`}
                d={edge.d}
                className="pipeline__signal"
                pathLength={1}
                vectorEffect="non-scaling-stroke"
                style={{ ['--i' as string]: order.indexOf(edge.from) }}
              />
            ))}
        </svg>
        {/* Labels as HTML so they stay crisp and readable at any scale. */}
        <span className="pipeline__tag" style={{ left: pct(loopFrame.x + 10, DIAGRAM_W), top: pct(loopFrame.y + 4, DIAGRAM_H) }}>
          {loopFrame.label}
        </span>
        <span className="pipeline__tag pipeline__tag--edge" style={{ left: pct(384, DIAGRAM_W), top: pct(20, DIAGRAM_H) }}>
          URL
        </span>
        <span className="pipeline__tag pipeline__tag--edge" style={{ left: pct(306, DIAGRAM_W), top: pct(92, DIAGRAM_H) }}>
          text
        </span>
        {stages.map((stage) => (
          <div key={stage.id} className="pipeline__slot">
            {stageButton(stage, 'graph')}
          </div>
        ))}
      </div>

      {/* List layout: narrow containers, specs open inline. */}
      <ol className="pipeline__list" aria-label="TND analysis pipeline">
        {stages.map((stage) => (
          <li
            key={stage.id}
            className={stage.id === selected ? 'is-selected' : undefined}
            data-conditional={conditionalNote(stage.id) ? '' : undefined}
            data-loop={loopPosition(stage.id)}
          >
            {stage.id === 'retrieve' && <span className="pipeline__loop-label">{loopFrame.label}</span>}
            {stageButton(stage, 'list')}
            {stage.id === selected && <StageSpec stage={stage} />}
          </li>
        ))}
      </ol>

      <div className="pipeline__detail" aria-live="polite">
        <DetailHeading className="pipeline__detail-title">{current.label}</DetailHeading>
        <StageSpec key={current.id} stage={current} />
      </div>

      <figcaption className="pipeline__caption">
        {caption}
        <span className="pipeline__legend">
          <span className="legend-line" aria-hidden="true" /> always runs
          <span className="legend-line legend-line--dashed" aria-hidden="true" /> depends on input
        </span>
      </figcaption>
    </figure>
  );
}
