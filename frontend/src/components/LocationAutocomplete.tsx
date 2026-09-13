import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { fetchLocationSuggestions, type LocationSuggestion } from "../services/api";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function LocationAutocomplete({ value, onChange, placeholder }: Props) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (text: string) => {
    onChange(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const results = await fetchLocationSuggestions(text);
      setSuggestions(results);
      setOpen(true);
      setLoading(false);
    }, 600); // debounced — respects the free geocoder's rate limit
  };

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <input
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className="w-full bg-surface-container-lowest border border-surface-variant rounded-full px-space-md py-space-sm font-body-md text-body-md text-on-surface outline-none focus:border-secondary"
      />
      {open && (loading || suggestions.length > 0) && (
        <div className="absolute z-30 top-full left-0 right-0 mt-space-2xs bg-surface-container-lowest border border-surface-variant rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
          {loading && <div className="p-space-sm font-body-sm text-on-surface-variant">Searching...</div>}
          {!loading && suggestions.map((s, i) => (
            <button key={i} onClick={() => { onChange(s.label); setOpen(false); }}
              className="w-full text-left px-space-md py-space-sm font-body-sm hover:bg-surface-container-low flex items-center gap-space-xs border-b border-surface-variant last:border-0">
              <MapPin size={14} className="text-secondary shrink-0" />
              <span className="truncate">{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}