import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SEARCH_INDEX, SearchResult } from '../data/searchIndex';
import { SectionId } from '../types';
import { MagnifyingGlassIcon } from '../constants';

interface SearchBarProps {
  onNavigate: (sectionId: SectionId) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const performSearch = useCallback((currentQuery: string) => {
    if (currentQuery.length < 3) {
      setResults([]);
      return;
    }
    const lowerCaseQuery = currentQuery.toLowerCase();
    const searchResults = SEARCH_INDEX.filter(item =>
      item.title.toLowerCase().includes(lowerCaseQuery) ||
      item.content.toLowerCase().includes(lowerCaseQuery)
    );
    setResults(searchResults);
  }, []);

  const debouncedSearch = useCallback(debounce(performSearch, 300), [performSearch]);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleResultClick = (sectionId: SectionId) => {
    onNavigate(sectionId);
    setQuery('');
    setResults([]);
    setIsFocused(false);
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={index} className="bg-sky-100 text-sky-800 rounded px-1">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const generateSnippet = (text: string, query: string, maxLength: number = 150): string => {
    if (!query.trim()) {
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchIndex = lowerText.indexOf(lowerQuery);

    if (matchIndex === -1) {
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    const contextLength = Math.floor((maxLength - query.length) / 2);
    
    let startIndex = Math.max(0, matchIndex - contextLength);
    let endIndex = Math.min(text.length, matchIndex + query.length + contextLength);

    if (startIndex > 0) {
      const spaceIndex = text.lastIndexOf(' ', startIndex);
      if (spaceIndex !== -1) startIndex = spaceIndex + 1;
    }

    if (endIndex < text.length) {
      const spaceIndex = text.indexOf(' ', endIndex);
      if (spaceIndex !== -1) endIndex = spaceIndex;
    }

    let snippet = text.substring(startIndex, endIndex);

    if (startIndex > 0) {
      snippet = '...' + snippet;
    }
    if (endIndex < text.length) {
      snippet = snippet + '...';
    }
    
    return snippet;
  };


  return (
    <div ref={searchContainerRef} className="relative">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Rechercher dans le guide..."
          className="w-full bg-white border border-slate-300 rounded-lg py-3 pl-11 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-blue shadow-sm"
        />
      </div>

      {isFocused && query.length > 0 && (
        <div className="absolute mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <ul>
              {results.map((result, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleResultClick(result.sectionId)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors duration-200"
                  >
                    <p className="font-bold text-slate-800">{result.title}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {highlightText(generateSnippet(result.content, query), query)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            query.length >= 3 && <p className="p-4 text-slate-500">Aucun résultat trouvé.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;