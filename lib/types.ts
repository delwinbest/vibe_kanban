export interface Card {
  id: string
  title: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Column {
  id: string
  title: string
  cards: Card[]
}

export interface Board {
  id: string
  title: string
  columns: Column[]
}
