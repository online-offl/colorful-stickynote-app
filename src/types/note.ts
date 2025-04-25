import { NoteColor } from '@/components/NoteCard';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  createdAt: string;
  updatedAt: string;
  isEditing?: boolean;
  isReading?: boolean;
} 