import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database table names
export const TABLES = {
  BOARDS: 'boards',
  COLUMNS: 'columns',
  CARDS: 'cards',
  CARD_LABELS: 'card_labels',
  CARD_ASSIGNEES: 'card_assignees',
} as const;

// Real-time subscription helpers
export const subscribeToTable = (table: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`${table}_changes`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table },
      callback
    )
    .subscribe();
};

// Specific subscription functions for each table
export const subscribeToBoards = (callback: (payload: any) => void) => {
  return supabase
    .channel('boards_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: TABLES.BOARDS },
      callback
    )
    .subscribe();
};

export const subscribeToColumns = (boardId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`columns_changes_${boardId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: TABLES.COLUMNS,
        filter: `board_id=eq.${boardId}`
      },
      callback
    )
    .subscribe();
};

export const subscribeToCards = (boardId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`cards_changes_${boardId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: TABLES.CARDS,
        filter: `column_id=in.(select id from columns where board_id=eq.${boardId})`
      },
      callback
    )
    .subscribe();
};

// Subscription management
export class SubscriptionManager {
  private subscriptions: Map<string, any> = new Map();

  subscribe(key: string, subscription: any) {
    this.unsubscribe(key);
    this.subscriptions.set(key, subscription);
  }

  unsubscribe(key: string) {
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      supabase.removeChannel(subscription);
      this.subscriptions.delete(key);
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach((subscription) => {
      supabase.removeChannel(subscription);
    });
    this.subscriptions.clear();
  }

  getActiveSubscriptions() {
    return Array.from(this.subscriptions.keys());
  }
}

export const subscriptionManager = new SubscriptionManager();

// Error handling helper
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  return {
    error: error.message || 'An unexpected error occurred',
    data: null
  };
};
