'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results
  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return { constituencies: [] };
      const res = await fetch(`/api/constituency?search=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    enabled: debouncedQuery.length > 0,
  });

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (constituencyName: string) => {
    setQuery(constituencyName);
    setShowDropdown(false);
    router.push(`/constituency/${encodeURIComponent(constituencyName)}`);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/constituency/${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={dropdownRef}>
      <form onSubmit={onSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          className="w-full pl-12 pr-4 py-4 rounded-2xl border bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-lg transition-all"
          placeholder="Search by constituency name (e.g. GUMMIDIPUNDI)..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}
      </form>

      {/* Autocomplete Dropdown */}
      {showDropdown && data?.constituencies && data.constituencies.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-900 border rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden">
          {data.constituencies.map((item: any) => (
            <button
              key={item.constituency_name}
              onClick={() => handleSelect(item.constituency_name)}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b last:border-0 flex flex-col items-start gap-1 justify-start cursor-pointer focus:bg-slate-100"
            >
              <div className="font-semibold text-gray-900 dark:text-gray-100">{item.constituency_name}</div>
              <div className="text-sm text-gray-500">District: {item.district}</div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && query.length > 0 && data?.constituencies && data.constituencies.length === 0 && !isLoading && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-900 border rounded-xl shadow-xl px-4 py-3 text-gray-500">
          No constituencies found matching "{query}"
        </div>
      )}
    </div>
  );
}
