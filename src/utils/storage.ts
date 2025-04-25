import localforage from 'localforage';
import { Note } from '@/types/note';
import { encryptData, decryptData, isNoteArray } from './encryption';

const NOTES_KEY = 'sticky-notes';

export const saveNote = async (note: Note): Promise<void> => {
  const notes = await getNotes();
  const existingNoteIndex = notes.findIndex((n) => n.id === note.id);
  
  if (existingNoteIndex >= 0) {
    notes[existingNoteIndex] = note;
  } else {
    notes.push(note);
  }
  
  const encryptedNotes = encryptData(notes);
  await localforage.setItem(NOTES_KEY, encryptedNotes);
};

export const getNotes = async (): Promise<Note[]> => {
  const encryptedNotes = await localforage.getItem<string>(NOTES_KEY);
  if (!encryptedNotes) return [];
  
  const decryptedNotes = decryptData(encryptedNotes);
  return isNoteArray(decryptedNotes) ? decryptedNotes : [];
};

export const deleteNote = async (id: string): Promise<void> => {
  const notes = await getNotes();
  const filteredNotes = notes.filter((note) => note.id !== id);
  const encryptedNotes = encryptData(filteredNotes);
  await localforage.setItem(NOTES_KEY, encryptedNotes);
}; 