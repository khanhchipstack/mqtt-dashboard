import { create } from 'zustand';

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  openConfirm: (params: { title: string; description: string; onConfirm: () => void }) => void;
  closeConfirm: () => void;
}

export const useConfirmDialog = create<ConfirmDialogState>((set) => ({
  isOpen: false,
  title: '',
  description: '',
  onConfirm: () => {},
  openConfirm: ({ title, description, onConfirm }) =>
    set({ isOpen: true, title, description, onConfirm }),
  closeConfirm: () => set({ isOpen: false }),
}));
