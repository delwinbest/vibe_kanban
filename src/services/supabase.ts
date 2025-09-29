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
    },
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 5000),
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
  console.log('🔧 SUPABASE: Creating subscription', {
    board_id: boardId,
    channel: `cards_changes_${boardId}`,
    timestamp: new Date().toISOString()
  });
  
  
  const channel = supabase
    .channel(`cards_changes_${boardId}`)
    .on('postgres_changes', 
      { 
        // Complex filters have problems with DELETE events, using broad subscription then filtering in callback
        event: '*', 
        schema: 'public', 
        table: TABLES.CARDS
        // Removed complex filter - DELETE events often don't include column_id in old record
        // We'll handle filtering in the subscription callback instead
      },
      (payload) => {
        console.log('🔧 SUPABASE: Raw Supabase subscription event (broad)', {
          channel: `cards_changes_${boardId}`,
          event_type: payload.eventType,
          new_data: payload.new,
          old_data: payload.old,
          timestamp: new Date().toISOString()
        });
        
        // Log filter attempt for debugging
        const cardId = (payload.new as any)?.id || (payload.old as any)?.id;
        console.log('🔧 SUPABASE: Filtering card for board:', {
          card_id: cardId,
          target_board_id: boardId,
          has_column_id: !!(payload.new as any)?.column_id || !!(payload.old as any)?.column_id
        });
        
        callback(payload);
      }
    )
    .subscribe((status) => {
      console.log('🔧 SUPABASE: Subscription status update', {
        channel: `cards_changes_${boardId}`,
        status: status,
        timestamp: new Date().toISOString()
      });
      
      // Handle problematic statuses gracefully
      if (status === 'TIMED_OUT' || status === 'CLOSED') {
        console.warn('🔧 SUPABASE: Main channel issue detected', {
          channel: `cards_changes_${boardId}`,
          status: status,
          board_id: boardId
        });
      }
    });
    
  // Store channel for cleanup
  subscriptionManager.subscribe(`cards_changes_${boardId}`, channel);
    
  return channel;
};

// Subscription management
export class SubscriptionManager {
  private subscriptions: Map<string, any> = new Map();

  subscribe(key: string, subscription: any) {
    // Clean up existing subscription first to prevent conflicts
    this.unsubscribe(key);
    this.subscriptions.set(key, subscription);
  }

  unsubscribe(key: string) {
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      try {
        supabase.removeChannel(subscription);
        console.log('🔧 SUBSCRIPTION: Successfully removed channel', { key });
      } catch (error) {
        console.warn('🔧 SUBSCRIPTION: Error removing channel', { key, error });
      }
      this.subscriptions.delete(key);
    }
  }

  unsubscribeAll() {
    console.log('🔧 SUBSCRIPTION: Cleaning up all subscriptions', {
      count: this.subscriptions.size,
      keys: Array.from(this.subscriptions.keys())
    });
    
    this.subscriptions.forEach((subscription, key) => {
      try {
        supabase.removeChannel(subscription);
        console.log('🔧 SUBSCRIPTION: Removed channel', { key });
      } catch (error) {
        console.warn('🔧 SUBSCRIPTION: Error removing channel', { key, error });
      }
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
