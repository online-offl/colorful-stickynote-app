'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ViewMode, VIEW_MODES } from '@/config/constants';

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-xl text-gray-600 hover:text-gray-800"
        title="Change View"
      >
        {VIEW_MODES[currentView].icon}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl z-10 py-2 border border-gray-100"
        >
          {Object.entries(VIEW_MODES).map(([mode, { icon, label }]) => (
            <button
              key={mode}
              onClick={() => {
                onViewChange(mode as ViewMode);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-3
                ${currentView === mode ? 'text-[#e42256] font-medium' : 'text-gray-600'}`}
            >
              <span className="text-xl">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 