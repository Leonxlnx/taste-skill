'use client';

import { useState, type FormEvent } from 'react';

// @ts-expect-error -- the pinned upstream component is intentionally shipped as JavaScript.
import DualListBox from '@/registry/sources/react-dual-listbox/components/react-dual-listbox/index.js';
import '@/registry/sources/react-dual-listbox/components/react-dual-listbox/react-dual-listbox.css';

const options = [
  { value: 'discovery', label: 'Discovery' },
  { value: 'research', label: 'Research' },
  { value: 'design', label: 'Interface design' },
  { value: 'content', label: 'Content design' },
  { value: 'development', label: 'Development' },
  { value: 'quality', label: 'Quality assurance' },
  { value: 'release', label: 'Release management' },
];

const initialSelected = ['design', 'quality'];

export default function ReactDualListboxPreview() {
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [selected, setSelected] = useState(initialSelected);
  const [submitted, setSubmitted] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(String(new FormData(event.currentTarget).get('workstreams') ?? ''));
  }

  return (
    <form
      className="w-full max-w-3xl rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-950 shadow-sm"
      onReset={() => {
        setSelected(initialSelected);
        setSubmitted('');
      }}
      onSubmit={handleSubmit}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">Project workstreams</h3>
          <p className="mt-1 text-sm text-neutral-600">
            Transfer workstreams, then use the order controls to set priority.
          </p>
        </div>
        <button
          className="min-h-11 rounded-lg border border-neutral-300 px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
          type="button"
          onClick={() => setDirection((current) => (current === 'ltr' ? 'rtl' : 'ltr'))}
        >
          Direction: {direction.toUpperCase()}
        </button>
      </div>

      <DualListBox
        canFilter
        htmlDir={direction}
        id="workstreams"
        name="workstreams"
        options={options}
        preserveSelectOrder
        required
        selected={selected}
        showHeaderLabels
        showNoOptionsText
        showOrderButtons
        onChange={(nextSelected: string[]) => setSelected(nextSelected)}
      />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          className="min-h-11 rounded-lg bg-neutral-950 px-4 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2"
          type="submit"
        >
          Save selection
        </button>
        <button
          className="min-h-11 rounded-lg border border-neutral-300 px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
          type="reset"
        >
          Reset
        </button>
        <output aria-live="polite" className="min-w-0 break-words text-sm text-neutral-600">
          {submitted ? 'Submitted: ' + submitted : selected.length + ' selected'}
        </output>
      </div>
    </form>
  );
}
