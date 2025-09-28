import React, { createContext, useContext, useState, ReactNode } from 'react';
import Modal from './Modal';

interface ModalContextType {
  openModal: (content: ReactNode, options?: ModalOptions) => void;
  closeModal: () => void;
  isOpen: boolean;
}

interface ModalOptions {
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [options, setOptions] = useState<ModalOptions>({});

  const openModal = (modalContent: ReactNode, modalOptions: ModalOptions = {}) => {
    setContent(modalContent);
    setOptions(modalOptions);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setContent(null);
    setOptions({});
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal, isOpen }}>
      {children}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title={options.title}
        size={options.size}
        showCloseButton={options.showCloseButton}
      >
        {content}
      </Modal>
    </ModalContext.Provider>
  );
};
