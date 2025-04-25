import CryptoJS from 'crypto-js';
import { Note } from '@/types/note';

const SECRET_KEY = 'sticky-notes-secret-key'; // In a real app, this should be stored securely

export const encryptData = (data: unknown): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const decryptData = (encryptedData: string): unknown => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) {
      return null;
    }
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Error decrypting data:', error);
    return null;
  }
};

// Type guard to check if value is Note[]
export const isNoteArray = (value: unknown): value is Note[] => {
  return Array.isArray(value) && 
    value.every(item => 
      typeof item === 'object' && 
      item !== null && 
      'id' in item && 
      'content' in item && 
      'createdAt' in item &&
      'updatedAt' in item &&
      'color' in item
    );
}; 