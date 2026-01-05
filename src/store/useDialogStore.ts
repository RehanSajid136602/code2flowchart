import { create } from 'zustand';

type DialogType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

interface DialogState {
    isOpen: boolean;
    type: DialogType;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    showInput?: boolean;
    inputValue?: string;
    isLoading?: boolean;
    onConfirm?: (inputValue?: string) => void | Promise<void>;
    onCancel?: () => void;

    setIsLoading: (loading: boolean) => void;
    setInputValue: (value: string) => void;
    showDialog: (options: {
        type?: DialogType;
        title: string;
        message: string;
        showInput?: boolean;
        confirmLabel?: string;
        cancelLabel?: string;
        onConfirm?: (inputValue?: string) => void | Promise<void>;
        onCancel?: () => void;
    }) => void;
    closeDialog: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    showInput: false,
    inputValue: '',
    isLoading: false,
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',

    setIsLoading: (loading) => set({ isLoading: loading }),
    setInputValue: (value) => set({ inputValue: value }),

    showDialog: (options) => set({
        isOpen: true,
        type: options.type || 'info',
        title: options.title,
        message: options.message,
        showInput: options.showInput || false,
        inputValue: '',
        isLoading: false,
        confirmLabel: options.confirmLabel || 'Confirm',
        cancelLabel: options.cancelLabel || 'Cancel',
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
    }),

    closeDialog: () => set({ isOpen: false, isLoading: false }),
}));
