"use client";

import { useState } from "react";
import { Sparkle } from "@phosphor-icons/react";

interface AiSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function AiSearchBar({ value, onChange }: AiSearchBarProps) {
  const [input, setInput] = useState(value);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onChange(input.trim());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-border rounded-[20px] px-5 py-4 flex items-center gap-3 shadow-sm"
    >
      <Sparkle size={20} weight="fill" className="text-brand shrink-0" />
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Try: boutique hotel with rooftop pool near Eiffel Tower"
        className="flex-1 text-sm text-text placeholder:text-text-muted bg-transparent outline-none min-w-0"
      />
      <button
        type="submit"
        className="shrink-0 bg-brand text-white text-sm font-semibold px-5 py-2 rounded-[12px] hover:opacity-90 transition-opacity duration-200 flex items-center gap-1.5"
      >
        <Sparkle size={14} weight="fill" />
        AI Search
      </button>
    </form>
  );
}
