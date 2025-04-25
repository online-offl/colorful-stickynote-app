'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Note } from '@/types/note';
import { getNotes, saveNote, deleteNote } from '@/utils/storage';
import NoteCard, { DEFAULT_COLOR } from '@/components/NoteCard';
import ViewSwitcher from '@/components/ViewSwitcher';
import { ViewMode } from '@/config/constants';
import LoadingScreen from '@/components/LoadingScreen';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('tile');
  const [loading, setLoading] = useState(true);
  const [isChangingView, setIsChangingView] = useState(false);
  const [isDetailView, setIsDetailView] = useState(false);

  useEffect(() => {
    // Show loading screen for at least 3 seconds on initial load
    const loadingTimer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    loadNotes();
    // Load view preference
    const savedView = localStorage.getItem('viewMode');
    if (savedView && ['small', 'medium', 'tile', 'large'].includes(savedView)) {
      setViewMode(savedView as ViewMode);
    } else {
      setViewMode('tile');
      localStorage.setItem('viewMode', 'tile');
    }

    return () => clearTimeout(loadingTimer);
  }, []);

  const loadNotes = async () => {
    try {
      const loadedNotes = await getNotes();
      const sortedNotes = loadedNotes.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setNotes(sortedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    const newNote: Note = {
      id: uuidv4(),
      title: `Note ${notes.length + 1}`,
      content: '',
      color: DEFAULT_COLOR,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveNote(newNote);
      setNotes([newNote, ...notes]);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleUpdateNote = async (updatedNote: Note) => {
    try {
      await saveNote(updatedNote);
      const updatedNotes = notes.map((note) => 
        note.id === updatedNote.id ? updatedNote : note
      ).sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleViewChange = (newView: ViewMode) => {
    setIsChangingView(true);
    setLoading(true); // Show loading when changing views
    
    setTimeout(() => {
      setViewMode(newView);
      setIsChangingView(false);
      setLoading(false);
      localStorage.setItem('viewMode', newView);
    }, 3000);
  };

  const getGridStyles = () => {
    const baseStyles = 'transition-all duration-700 ease-out';
    switch (viewMode) {
      case 'small':
      case 'medium':
        return `${baseStyles} flex flex-col gap-4 max-w-4xl mx-auto`;
      case 'large':
        return `${baseStyles} grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto`;
      default: // tile view
        return `${baseStyles} grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`;
    }
  };

  const handleNoteViewStateChange = (isViewing: boolean) => {
    setIsDetailView(isViewing);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen p-2 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-[10px]">
          <h1 className="text-3xl font-bold text-gray-800">My Notes</h1>
          <div className="flex items-center gap-4">
            {!isDetailView && !isChangingView && (
              <ViewSwitcher currentView={viewMode} onViewChange={handleViewChange} />
            )}
            <button
              onClick={handleCreateNote}
              className="w-10 h-10 rounded-full bg-[#e42256] text-white shadow-lg hover:bg-[#d41e4d] transition-all duration-200 flex items-center justify-center text-2xl hover:scale-110"
            >
              +
            </button>
          </div>
        </div>

        <div className={`
          grid gap-4 p-4
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
          auto-rows-fr
          ${viewMode === 'tile' ? 'w-full' : 'max-w-4xl mx-auto'}
        `}>
          {notes.map((note, index) => (
            <NoteCard
              key={note.id}
              note={note}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
              noteNumber={index + 1}
              viewMode={viewMode}
              onViewStateChange={handleNoteViewStateChange}
            />
          ))}
          {notes.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              No notes yet. Click the + button to create one!
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
