"use client";

import React, {
  useState,
  useRef,
  useEffect,
  type ChangeEvent,
} from "react";
import { Search } from "lucide-react";
import type { SelectOption } from "../../interface";

interface SelectProps {
  options?: SelectOption[];
  label?: string;
  name?: string;
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (name: string, value: string) => void;
  showSearch?: boolean;
  menuPortalTarget?: HTMLElement | null; // Add this
  styles?: any; // Add this
}

const Select = ({
  options = [],
  label,
  name = "",
  className = "",
  onChange,
  placeholder,
  value,
  showSearch = true,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredOptions, setFilteredOptions] =
    useState<SelectOption[]>(options);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Sync filtered options when options prop changes
  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  // Sync selected option when controlled value changes
  useEffect(() => {
    if (typeof value !== "undefined") {
      const match =
        options.find((o) => String(o.value) === String(value)) || null;
      setSelectedOption(match);
    }
  }, [value, options]);

  const [menuPlacement, setMenuPlacement] = useState<"top" | "bottom">(
    "bottom"
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dynamic menu placement
  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 240; // max-h-60 is 15rem = 240px

      if (spaceBelow < menuHeight && rect.top > menuHeight) {
        setMenuPlacement("top");
      } else {
        setMenuPlacement("bottom");
      }
    }
  }, [isOpen]);

  // Handle search input
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = options.filter(
      (option) => option && option.label.toLowerCase().includes(term)
    );
    setFilteredOptions(filtered);
  };

  // Handle option selection
  const handleSelect = (option: SelectOption) => {
    setSelectedOption(option);
    setSearchTerm("");
    setIsOpen(false);
    if (onChange) {
      onChange(name, String(option.value));
    }
  };

  // Highlight matching text in options
  const highlightMatch = (
    text: string,
    highlight: string
  ): React.ReactNode => {
    if (!highlight.trim()) {
      return text;
    }
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-200 text-gray-700">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Dropdown Trigger */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          if (showSearch) {
            setTimeout(() => {
              searchRef.current?.focus();
            }, 100);
          }
        }}
        className={`flex items-center justify-between p-2 text-sm border rounded-md bg-white cursor-pointer transition-all ${isOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-300"
          } ${className}`}
      >
        <div className="flex-1">
          {isOpen && showSearch ? (
            <div className="flex items-center">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input
                ref={searchRef}
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full bg-transparent outline-none"
                placeholder="Search..."
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : (
            <span
              className={selectedOption ? "text-gray-700" : "text-gray-700"}
            >
              {selectedOption
                ? selectedOption.label
                : label || placeholder || "Select an option"}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "transform rotate-180" : ""
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-50 min-w-full w-max text-sm bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto ${menuPlacement === "top" ? "bottom-full mb-1" : "top-full mt-1"
            }`}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSelect(option)}
              >
                {highlightMatch(option.label, searchTerm)}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 italic">
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Select;
