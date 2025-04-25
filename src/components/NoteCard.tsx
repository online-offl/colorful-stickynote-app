'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Note } from '@/types/note';
import LoadingScreen from './LoadingScreen';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon
} from 'react-share';
import { 
  AUTO_SAVE_INTERVAL, 
  AUTO_SAVE_NOTIFICATION_DURATION,
  MAX_NOTE_HEIGHT,
  ViewMode 
} from '@/config/constants';

interface NoteCardProps {
  note: Note;
  onUpdate: (note: Note) => void;
  onDelete: (id: string) => void;
  noteNumber?: number;
  viewMode?: ViewMode;
  onViewStateChange?: (isViewing: boolean) => void;
}

export type NoteColor = 'coral' | 'blueGreen' | 'freesia' | 'fuchsia';

export const DEFAULT_COLOR: NoteColor = 'blueGreen';

const colorPalette = {
  coral: {
    main: '#ff8370',
    contrast: '#00b1b0',
    text: 'text-white',
  },
  blueGreen: {
    main: '#00b1b0',
    contrast: '#e42256',
    text: 'text-white',
  },
  freesia: {
    main: '#fec84d',
    contrast: '#e42256',
    text: 'text-gray-800',
  },
  fuchsia: {
    main: '#e42256',
    contrast: '#00b1b0',
    text: 'text-white',
  },
};

const colors: { [key in NoteColor]: string } = {
  coral: 'bg-[#ff8370] border-[#ff8370]/60',
  blueGreen: 'bg-[#00b1b0] border-[#00b1b0]/60',
  freesia: 'bg-[#fec84d] border-[#fec84d]/60',
  fuchsia: 'bg-[#e42256] border-[#e42256]/60',
};

const headerColors: { [key in NoteColor]: { bg: string; text: string } } = {
  coral: { bg: 'bg-[#00b1b0]', text: 'text-white' },
  blueGreen: { bg: 'bg-[#e42256]', text: 'text-white' },
  freesia: { bg: 'bg-[#e42256]', text: 'text-white' },
  fuchsia: { bg: 'bg-[#00b1b0]', text: 'text-white' },
};

const FAB_STYLES = {
  button: 'w-12 h-12 rounded-full bg-[#e42256] text-white shadow-lg hover:bg-[#d41e4d] transition-all duration-200 flex items-center justify-center text-2xl hover:scale-110',
  menuItem: {
    save: 'w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 text-[#e42256]',
    cancel: 'w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-600'
  }
};

// Add date formatting helper
const formatLastUpdated = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear().toString().slice(-2);
  const hours = date.getHours() % 12 || 12;
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
  
  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};

export default function NoteCard({ note, onUpdate, onDelete, noteNumber = 1, viewMode, onViewStateChange }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [content, setContent] = useState(note.content);
  const [title, setTitle] = useState(note.title || `Note ${noteNumber}`);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const deleteConfirmRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [showAutoSaveToast, setShowAutoSaveToast] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef({ content, title });
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [originalContent, setOriginalContent] = useState(note.content);
  const [originalTitle, setOriginalTitle] = useState(title);

  useEffect(() => {
    if (!note.title) {
      setTitle(`Note ${noteNumber || 1}`);
    }
  }, [noteNumber, note.title]);

  // Add click outside handler effect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // More menu click outside
      if (
        showMenu &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !menuButtonRef.current?.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }

      // Color picker click outside
      if (
        showColorPicker &&
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node) &&
        !colorButtonRef.current?.contains(event.target as Node)
      ) {
        setShowColorPicker(false);
      }

      // Delete confirmation click outside
      if (
        showDeleteConfirm &&
        deleteConfirmRef.current &&
        !deleteConfirmRef.current.contains(event.target as Node)
      ) {
        setShowDeleteConfirm(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu, showColorPicker, showDeleteConfirm]); // Add dependencies to ensure effect updates

  // Add auto-save effect
  useEffect(() => {
    if (isEditing) {
      const hasChanges = 
        content !== lastSavedContentRef.current.content || 
        title !== lastSavedContentRef.current.title;

      if (hasChanges) {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(() => {
          onUpdate({ 
            ...note, 
            content, 
            title, 
            updatedAt: new Date().toISOString() 
          });
          lastSavedContentRef.current = { content, title };
          setShowAutoSaveToast(true);
          setTimeout(() => setShowAutoSaveToast(false), AUTO_SAVE_NOTIFICATION_DURATION);
        }, AUTO_SAVE_INTERVAL);
      }
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content, title, isEditing, note, onUpdate]);

  const handleStartEditing = () => {
    setOriginalContent(content);
    setOriginalTitle(title);
    setIsEditing(true);
    // Focus the editor after animation
    setTimeout(() => {
      editorRef.current?.focus();
    }, 300);
  };

  const handleSave = () => {
    onUpdate({ ...note, content, title, updatedAt: new Date().toISOString() });
    setIsExiting(true);
    setTimeout(() => {
      setIsEditing(false);
      setIsExiting(false);
    }, 300);
  };

  const handleCancel = () => {
    setContent(originalContent);
    setTitle(originalTitle);
    setIsExiting(true);
    setTimeout(() => {
      setIsEditing(false);
      setIsExiting(false);
    }, 300);
  };

  const handleColorChange = (color: NoteColor) => {
    onUpdate({ ...note, color });
    setShowColorPicker(false);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = `Check out my note: ${content.substring(0, 50)}...`;

  // Helper function to safely get the current note color
  const getNoteColor = (): NoteColor => {
    if (!note.color || !Object.keys(colors).includes(note.color as string)) {
      return DEFAULT_COLOR;
    }
    return note.color as NoteColor;
  };

  const getContrastColor = (color: NoteColor) => {
    return colorPalette[color].contrast;
  };

  const getFabStyles = (color: NoteColor) => {
    const contrastColor = getContrastColor(color);
    const darkerContrast = contrastColor.replace(/^#/, '');
    
    return {
      button: `w-12 h-12 rounded-full bg-[${contrastColor}] text-white shadow-lg hover:brightness-90 transition-all duration-200 flex items-center justify-center text-2xl hover:scale-110`,
      menuItem: {
        save: `w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 text-[${contrastColor}]`,
        cancel: 'w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-600'
      }
    };
  };

  // Helper function to get header styles
  const getHeaderStyles = () => {
    const color = getNoteColor();
    const contrastColor = getContrastColor(color);
    return `bg-[${contrastColor}] ${colorPalette[color].text}`;
  };

  // Helper function to get note background color
  const getNoteColorStyle = () => {
    return colors[getNoteColor()] || colors[DEFAULT_COLOR];
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(note.id);
    setShowDeleteConfirm(false);
  };

  const handleExitView = () => {
    if (isEditing) {
      handleSave();
    }
    setShowContent(false);
    setIsExiting(true);
    setIsLoading(true);
    onViewStateChange?.(false);
    
    // Show loading for configured duration
    setTimeout(() => {
      setIsEditing(false);
      setIsReading(false);
      setIsExiting(false);
      setIsLoading(false);
    }, 300);
  };

  const handleStartReading = () => {
    setIsLoading(true);
    onViewStateChange?.(true);
    
    // Show loading for configured duration
    setTimeout(() => {
      setIsLoading(false);
      setIsReading(true);
      setShowContent(true);
    }, 300);
  };

  // Helper function to get view mode specific styles
  const getViewModeStyles = () => {
    if (!viewMode || viewMode === 'tile') {
      return 'min-h-[180px] h-auto'; // Minimum height but can grow based on content
    }
    switch (viewMode) {
      case 'small':
        return 'h-[100px]';
      case 'medium':
        return 'h-[150px]';
      case 'large':
        return 'h-[200px]';
    }
  };

  // Helper function to get content styles based on view mode
  const getContentStyles = () => {
    if (!viewMode || viewMode === 'tile') {
      return 'text-sm overflow-hidden'; // Remove line-clamp to show all content
    }
    switch (viewMode) {
      case 'small':
        return 'text-sm line-clamp-2';
      case 'medium':
        return 'text-base line-clamp-3';
      case 'large':
        return 'text-lg line-clamp-6';
    }
  };

  // Helper function to get title styles based on view mode
  const getTitleStyles = () => {
    if (!viewMode || viewMode === 'tile') {
      return 'text-base line-clamp-1';
    }
    return 'text-lg';
  };

  // Helper function to get truncated content
  const getTruncatedContent = () => {
    if (content.length > MAX_NOTE_HEIGHT) {
      return `${content.substring(0, MAX_NOTE_HEIGHT)}...`;
    }
    return content;
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isEditing || isReading) {
    return (
      <div 
        className={`fixed inset-0 bg-gray-50 z-50 transition-all duration-300 ${
          isExiting ? 'translate-x-full' : 'translate-x-0'
        }`}
      >
        {/* Auto-save notification */}
        {showAutoSaveToast && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in-out z-50">
            Auto-saved
          </div>
        )}

        {/* Header */}
        <div className={`${getHeaderStyles()} p-2 flex flex-col shadow-md transition-all duration-300 overflow-hidden`}>
          <div className="flex justify-between items-center w-full max-w-full">
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl font-semibold bg-transparent border-none outline-none w-full placeholder-white/70 truncate pr-2"
                  placeholder="Note Title"
                />
              ) : (
                <h1 className="text-xl font-semibold truncate pr-2">{title}</h1>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isReading && (
                <>
                  <button
                    ref={colorButtonRef}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors text-white flex-shrink-0"
                  >
                    🎨
                  </button>
                  <button
                    onClick={handleStartEditing}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors text-white flex-shrink-0"
                  >
                    ✏️
                  </button>
                  <button
                    ref={menuButtonRef}
                    onClick={() => setShowMenu(!showMenu)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors text-white flex-shrink-0"
                  >
                    ⋮
                  </button>
                </>
              )}
              <button
                onClick={handleExitView}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors text-white flex-shrink-0"
                title={isEditing ? "Save & Return" : "Back"}
              >
                {isEditing ? "✓" : "←"}
              </button>
            </div>
          </div>
          <div className="text-[10px] italic opacity-75 mt-1 truncate">
            Last modified: {formatLastUpdated(note.updatedAt)}
          </div>
        </div>

        {/* More Menu */}
        {showMenu && (
          <div 
            ref={menuRef}
            className="absolute right-2 top-16 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl z-10 border-2 border-gray-100 w-48"
          >
            <div className="py-1">
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleStartEditing();
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <span>🔍 Find</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowDeleteConfirm(true);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 text-red-500"
              >
                <span>🗑️ Delete</span>
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <div className="px-4 py-2 text-sm text-gray-500">Share via</div>
              <div className="px-4 py-2 flex space-x-2">
                <FacebookShareButton url={shareUrl}>
                  <FacebookIcon size={24} round />
                </FacebookShareButton>
                <TwitterShareButton url={shareUrl} title={shareTitle}>
                  <TwitterIcon size={24} round />
                </TwitterShareButton>
                <WhatsappShareButton url={shareUrl} title={shareTitle}>
                  <WhatsappIcon size={24} round />
                </WhatsappShareButton>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-800/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div 
              ref={deleteConfirmRef}
              className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl"
            >
              <h3 className="text-lg font-semibold mb-2">Delete Note</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this note? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete(note.id);
                    setShowDeleteConfirm(false);
                    handleExitView();
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div 
          className="w-full h-[calc(100vh-4rem)] p-2 transition-all duration-300 overflow-hidden"
          style={{
            backgroundImage: "url('/images/note_bg_1.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="max-w-4xl mx-auto h-full rounded-xl shadow-xl p-1 relative bg-transparent">
            {isEditing ? (
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full p-2 resize-none focus:outline-none bg-transparent text-lg"
                style={{
                  backgroundColor: 'transparent',
                  color: '#2D3748',
                }}
                placeholder="Start writing here..."
              />
            ) : (
              <div 
                className="w-full h-full p-2 overflow-auto text-lg whitespace-pre-wrap"
                style={{ color: '#2D3748' }}
              >
                {content}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Home page view
  return (
    <div 
      onClick={handleStartReading}
      className={`
        rounded-lg border-2 ${getNoteColorStyle()} shadow-md
        flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-xl 
        cursor-pointer ${getViewModeStyles()}
      `}
    >
      {/* Note Header */}
      <div className={`${getHeaderStyles()} px-3 py-2 flex-shrink-0 flex justify-between items-center border-b border-white/20`}>
        <h3 className={`font-semibold truncate pr-2 ${getTitleStyles()}`}>{title}</h3>
      </div>

      <div className={`flex-1 px-3 py-2 ${getContentStyles()}`}>
        {getTruncatedContent()}
      </div>
      
      <div className="text-[10px] text-gray-500 px-3 py-1.5 truncate border-t border-white/10 flex-shrink-0">
        Last updated: {formatLastUpdated(note.updatedAt)}
      </div>
    </div>
  );
} 