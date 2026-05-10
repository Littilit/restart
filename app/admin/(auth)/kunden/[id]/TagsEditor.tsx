'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function TagsEditor({
  customerId,
  initial,
  allTags,
}: {
  customerId: string;
  initial: string[];
  allTags: string[];
}) {
  const router = useRouter();
  const [tags, setTags] = useState(initial);
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const suggestions = allTags.filter(
    (t) => !tags.includes(t) && t.toLowerCase().includes(inputValue.toLowerCase())
  );

  async function save(next: string[]) {
    setTags(next);
    await fetch(`/api/admin/customers/${customerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: next }),
    });
    startTransition(() => router.refresh());
  }

  function commit(val?: string) {
    const v = (val ?? inputValue).trim();
    setInputValue('');
    setOpen(false);
    if (!v || tags.includes(v)) return;
    save([...tags, v]);
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {tags.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
          {tag}
          <button
            onClick={() => save(tags.filter((t) => t !== tag))}
            disabled={pending}
            className="text-gray-400 hover:text-gray-700 leading-none disabled:opacity-50"
          >
            ×
          </button>
        </span>
      ))}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          placeholder="Tag hinzufügen…"
          disabled={pending}
          onChange={(e) => { setInputValue(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); commit(); }
            if (e.key === 'Escape') { setOpen(false); setInputValue(''); }
          }}
          className="text-xs border border-dashed border-gray-300 rounded-full px-2 py-1 w-32 focus:outline-none focus:border-cp-tuerkis disabled:opacity-50"
        />
        {open && suggestions.length > 0 && (
          <ul className="absolute z-10 top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-md max-h-40 overflow-y-auto">
            {suggestions.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); commit(t); }}
                  className="w-full text-left text-xs px-3 py-1.5 hover:bg-gray-50 text-gray-700"
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
