"use client";

import React, { useState, useRef, useEffect, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { SelectOption } from "../../interface";

interface MultiSelectProps {
  options: SelectOption[];
  label?: string;
  name?: string;
  className?: string;
  placeholder?: string;
  value?: (string | number)[];
  onChange?: (name: string, value: (string | number)[]) => void;
  showSearch?: boolean;
}

const MultiSelect = ({
  options = [],
  label,
  name = "",
  className = "",
  onChange,
  placeholder,
  value = [],
  showSearch = true,
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredOptions, setFilteredOptions] =
    useState<SelectOption[]>(options);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyles, setMenuStyles] = useState<React.CSSProperties>({});

  // Sync filtered options when options prop changes
  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideWrapper =
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node);
      const isOutsideMenu =
        menuRef.current && !menuRef.current.contains(event.target as Node);

      if (isOutsideWrapper && isOutsideMenu) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dynamic menu placement and portal positioning
  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 240; // max-h-60 is 15rem = 240px
      const shouldPlaceTop = spaceBelow < menuHeight && rect.top > menuHeight;

      setMenuStyles({
        position: "fixed",
        top: shouldPlaceTop ? rect.top - 4 : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        transform: shouldPlaceTop ? "translateY(-100%)" : "none",
        zIndex: 9999,
      });
    }
  }, [isOpen]);

  // Handle search input
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(term),
    );
    setFilteredOptions(filtered);
  };

  // Handle option selection/deselection
  const handleSelect = (option: SelectOption) => {
    const isSelected = value.includes(option.value);
    let newValue: (string | number)[];

    if (isSelected) {
      newValue = value.filter((v) => v !== option.value);
    } else {
      newValue = [...value, option.value];
    }

    if (onChange) {
      onChange(name, newValue);
    }
  };

  const removeValue = (valToRemove: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = value.filter((v) => v !== valToRemove);
    if (onChange) {
      onChange(name, newValue);
    }
  };

  // Highlight matching text in options
  const highlightMatch = (text: string, highlight: string): React.ReactNode => {
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
          ),
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
        className={`flex items-center justify-between p-2 text-sm border rounded-md bg-white dark:bg-slate-800 cursor-pointer transition-all min-h-[3rem] ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-100"
            : "border-gray-300 dark:border-slate-700"
        } ${className}`}
      >
        <div className="flex-1 flex flex-wrap gap-1">
          {value.length > 0 ? (
            value.map((val) => {
              const option = options.find((o) => o.value === val);
              return (
                <span
                  key={val}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {option?.label || val}
                  <X
                    size={12}
                    className="cursor-pointer hover:text-blue-600"
                    onClick={(e) => removeValue(val, e)}
                  />
                </span>
              );
            })
          ) : (
            <span className="text-gray-500 dark:text-slate-400">
              {label || placeholder || "Select options"}
            </span>
          )}

          {isOpen && showSearch && (
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              className="bg-transparent outline-none text-gray-900 dark:text-white min-w-[50px] flex-1"
              placeholder=""
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "transform rotate-180" : ""
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

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyles}
            className="text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto custom-scrollbar"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={`px-4 py-2 cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200"
                        : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-white"
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    <span>{highlightMatch(option.label, searchTerm)}</span>
                    {isSelected && <Check size={16} />}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-2 text-gray-500 dark:text-slate-400 italic">
                No options found
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

// Helper component for check icon
const Check = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default MultiSelect;
