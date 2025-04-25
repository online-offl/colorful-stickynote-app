// Auto-save settings
export const AUTO_SAVE_INTERVAL = 5000; // 5 seconds in milliseconds
export const AUTO_SAVE_NOTIFICATION_DURATION = 2000; // 2 seconds in milliseconds

// Note display settings
export const MAX_NOTE_HEIGHT = 250; // maximum characters to show in home screen 

// View modes
export type ViewMode = 'small' | 'medium' | 'tile' | 'large';

export const VIEW_MODES: { [key in ViewMode]: { icon: string; label: string } } = {
  tile: {
    icon: '⊞',
    label: 'Tiles'
  },
  small: {
    icon: '▤',
    label: 'Small List'
  },
  medium: {
    icon: '≣',
    label: 'Medium List'
  },
  large: {
    icon: '▣',
    label: 'Large Cards'
  }
}; 