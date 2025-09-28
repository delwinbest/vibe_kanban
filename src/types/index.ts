// Core entity types for the kanban board
export interface Board {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  column_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: Priority;
  status: Status;
  position: number;
  assignee_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  board_id: string;
  created_at: string;
  updated_at: string;
}

export interface CardLabel {
  id: string;
  card_id: string;
  label_id: string;
  created_at: string;
}

export interface CardAssignee {
  id: string;
  card_id: string;
  user_id: string;
  assigned_at: string;
}

// Enums
export type Priority = 'P1' | 'P2' | 'P3';
export type Status = 'not_started' | 'started' | 'ongoing' | 'in_progress' | 'completed';

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
  labels: Label[];
  cardLabels: CardLabel[];
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
  column_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority?: Priority;
  status?: Status;
}

export interface UpdateCardRequest {
  id: string;
  title?: string;
  description?: string;
  due_date?: string;
  priority?: Priority;
  status?: Status;
  column_id?: string;
  position?: number;
  assignee_id?: string;
}

export interface CreateColumnRequest {
  board_id: string;
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
  onEditCard?: (card: Card) => void;
  onDeleteCard?: (cardId: string) => void;
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
