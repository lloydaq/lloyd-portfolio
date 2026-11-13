import { useEffect, useRef } from 'react';
import { Close } from './Icons';
import { OPEN_SHORTCUTS_EVENT, SHORTCUTS, createKeyReader, isTyping, run } from './keyShortcuts';

/**
 * Listens for the keyboard shortcuts and shows the help sheet. A native modal <dialog>
 * gives focus trapping, Escape to close and an inert page for free.
 */
export function Shortcuts() {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const press = createKeyReader();

    const toggleHelp = () => {
      if (dialog.open) dialog.close();
      else dialog.showModal?.();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      if (isTyping(event.target)) return;
      const action = press(event.key, performance.now());
      // While the sheet is open, only `?` (to close it) does anything.
      if (!action || (dialog.open && action.type !== 'help')) return;
      event.preventDefault();
      if (action.type !== 'help' && dialog.open) dialog.close();
      run(action, toggleHelp);
    };
    const onOpen = () => {
      if (!dialog.open) dialog.showModal?.();
    };

    document.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_SHORTCUTS_EVENT, onOpen);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_SHORTCUTS_EVENT, onOpen);
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="shortcuts"
      aria-labelledby="shortcuts-title"
      // A click on the backdrop lands on the dialog itself; the panel fills the rest.
      onClick={(event) => event.target === ref.current && ref.current.close()}
    >
      <div className="shortcuts__panel">
        <div className="shortcuts__head">
          <h2 id="shortcuts-title" className="shortcuts__title">
            Keyboard shortcuts
          </h2>
          <button type="button" className="icon-button" aria-label="Close" onClick={() => ref.current?.close()}>
            <Close />
          </button>
        </div>
        <dl className="shortcuts__list">
          {SHORTCUTS.map(({ keys, label }) => (
            <div key={keys.join('')} className="shortcuts__row">
              <dt>
                {keys.map((key, i) => (
                  <span key={key}>
                    {i > 0 && <span className="shortcuts__then"> then </span>}
                    <kbd>{key}</kbd>
                  </span>
                ))}
              </dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
        <p className="shortcuts__hint">One more is hidden. It involves ink.</p>
      </div>
    </dialog>
  );
}
