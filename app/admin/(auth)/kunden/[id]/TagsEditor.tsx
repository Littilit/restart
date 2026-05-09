'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function TagsEditor({ customerId, initial }: { customerId: string; initial: string[] }) {
  const router = useRouter();
  const [tags, setTags] = useState(initial);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function save(next: string[]) {
    setTags(next);
    await fetch(`/api/admin/customers/${customerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: next }),
    });
    startTransition(() => router.refresh());
  }

  function addTag() {
    const val = inputRef.current?.value.trim();
    if (!val || tags.includes(val)) return;
    if (inputRef.current) inputRef.current.value = '';
    save([...tags, val]);
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
      <input
        ref={inputRef}
        type="text"
        placeholder="Tag hinzufügen…"
        disabled={pending}
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
        onBlur={addTag}
        className="text-xs border border-dashed border-gray-300 rounded-full px-2 py-1 w-32 focus:outline-none focus:border-cp-tuerkis disabled:opacity-50"
      />
    </div>
  );
}
