// Core entity types for the kanban board
export interface Board {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  name: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: Priority;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CardLabel {
  id: string;
  cardId: string;
  name: string;
  color: LabelColor;
  createdAt: string;
}

export interface CardAssignee {
  id: string;
  cardId: string;
  userId: string;
  assignedAt: string;
}

// Enums
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type LabelColor = 
  | 'red' 
  | 'orange' 
  | 'yellow' 
  | 'green' 
  | 'blue' 
  | 'purple' 
  | 'pink' 
  | 'gray';

// UI State types
export interface DragItem {
  id: string;
  type: 'card' | 'column';
  columnId?: string;
}

export interface BoardState {
  board: Board | null;
  columns: Column[];
  cards: Card[];
  labels: CardLabel[];
  assignees: CardAssignee[];
  loading: boolean;
  error: string | null;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface CreateCardRequest {
  columnId: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: Priority;
}

export interface UpdateCardRequest {
  id: string;
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: Priority;
  columnId?: string;
  position?: number;
}

export interface CreateColumnRequest {
  boardId: string;
  name: string;
  position: number;
}

export interface UpdateColumnRequest {
  id: string;
  name?: string;
  position?: number;
}

// Component Props types
export interface CardProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (cardId: string) => void;
  onMove: (cardId: string, newColumnId: string, newPosition: number) => void;
}

export interface ColumnProps {
  column: Column;
  cards: Card[];
  onAddCard: (columnId: string) => void;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
  onMoveCard: (cardId: string, newColumnId: string, newPosition: number) => void;
}

export interface BoardProps {
  board: Board;
  columns: Column[];
  cards: Card[];
  onAddColumn: () => void;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
  onAddCard: (columnId: string) => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
  onMoveCard: (cardId: string, newColumnId: string, newPosition: number) => void;
  onMoveColumn: (columnId: string, newPosition: number) => void;
}

// Utility types
export type SortOrder = 'asc' | 'desc';

export interface FilterOptions {
  priority?: Priority[];
  labels?: string[];
  assignees?: string[];
  dueDate?: {
    from?: string;
    to?: string;
  };
}

export interface SortOptions {
  field: 'title' | 'dueDate' | 'priority' | 'createdAt' | 'updatedAt';
  order: SortOrder;
}
