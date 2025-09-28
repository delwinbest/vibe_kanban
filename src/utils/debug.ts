/**
 * Debug logging utility for development
 * Only logs when running in development mode
 */

const isDevelopment = import.meta.env.DEV;

export const debugLog = {
  card: {
    create: (data: any) => {
      if (isDevelopment) {
        console.log('🟢 [CARD CREATE]', data);
      }
    },
    edit: (cardId: string, changes: any) => {
      if (isDevelopment) {
        console.log('🟡 [CARD EDIT]', { cardId, changes });
      }
    },
    delete: (cardId: string, cardTitle: string) => {
      if (isDevelopment) {
        console.log('🔴 [CARD DELETE]', { cardId, cardTitle });
      }
    },
    move: (cardId: string, fromColumn: string, toColumn: string, position: number) => {
      if (isDevelopment) {
        console.log('🔄 [CARD MOVE]', { cardId, fromColumn, toColumn, position });
      }
    },
    reorder: (cardId: string, columnId: string, fromPosition: number, toPosition: number) => {
      if (isDevelopment) {
        console.log('📋 [CARD REORDER]', { cardId, columnId, fromPosition, toPosition });
      }
    }
  },
  column: {
    create: (data: any) => {
      if (isDevelopment) {
        console.log('🟢 [COLUMN CREATE]', data);
      }
    },
    edit: (columnId: string, changes: any) => {
      if (isDevelopment) {
        console.log('🟡 [COLUMN EDIT]', { columnId, changes });
      }
    },
    delete: (columnId: string, columnName: string) => {
      if (isDevelopment) {
        console.log('🔴 [COLUMN DELETE]', { columnId, columnName });
      }
    },
    reorder: (columnId: string, fromPosition: number, toPosition: number) => {
      if (isDevelopment) {
        console.log('📋 [COLUMN REORDER]', { columnId, fromPosition, toPosition });
      }
    }
  },
  modal: {
    open: (type: string, data?: any) => {
      if (isDevelopment) {
        console.log('📱 [MODAL OPEN]', { type, data });
      }
    },
    close: (type: string) => {
      if (isDevelopment) {
        console.log('📱 [MODAL CLOSE]', { type });
      }
    }
  },
  drag: {
    start: (itemId: string, itemType: 'card' | 'column') => {
      if (isDevelopment) {
        console.log('🖱️ [DRAG START]', { itemId, itemType });
      }
    },
    end: (itemId: string, itemType: 'card' | 'column', result: any) => {
      if (isDevelopment) {
        console.log('🖱️ [DRAG END]', { itemId, itemType, result });
      }
    }
  },
  api: {
    request: (action: string, data?: any) => {
      if (isDevelopment) {
        console.log('🌐 [API REQUEST]', { action, data });
      }
    },
    success: (action: string, response: any) => {
      if (isDevelopment) {
        console.log('✅ [API SUCCESS]', { action, response });
      }
    },
    error: (action: string, error: any) => {
      if (isDevelopment) {
        console.log('❌ [API ERROR]', { action, error });
      }
    }
  }
};

export default debugLog;
