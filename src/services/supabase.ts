import { createClient } from '@supabase/supabase-js';
import { connectionMonitor } from '../utils/connectionMonitor';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with enhanced network resilience
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
    heartbeatIntervalMs: 15000, // More frequent heartbeats for poor networks
    reconnectAfterMs: (tries: number) => {
      // Exponential backoff with jitter for better resilience
      const baseDelay = Math.min(tries * 1000, 10000); // Max 10 seconds
      const jitter = Math.random() * 1000; // Add randomness
      return baseDelay + jitter;
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
      
      // Report status to connection monitor
      connectionMonitor.updateSubscriptionStatus(`cards_changes_${boardId}`, status);
      
      // Handle network timeouts with automatic retry
      if (status === 'TIMED_OUT') {
        console.warn('🔧 SUPABASE: Network timeout detected - scheduling retry', {
          channel: `cards_changes_${boardId}`,
          status: status,
          board_id: boardId
        });
        
        // Trigger automatic retry using the subscription manager
        const channelKey = `cards_changes_${boardId}`;
        subscriptionManager.handleTimeout(channelKey, () => {
          console.log('🔧 SUPABASE: Retrying subscription after timeout', { channelKey, boardId });
          // This will be handled by the slice's subscription recreation logic
        });
        
      } else if (status === 'CLOSED') {
        console.warn('🔧 SUPABASE: Channel closed unexpectedly', {
          channel: `cards_changes_${boardId}`,
          status: status,
          board_id: boardId
        });
        
        // Try to recover from closed channel
        setTimeout(() => {
          console.log('🪧 SUPABASE: Attempting to recreate closed channel', { channelKey: `cards_changes_${boardId}` });
          // Trigger a recreation by dispatching unsubscribe and subscribe again
          subscriptionManager.unsubscribe(`cards_changes_${boardId}`);
        }, 2000);
        
      } else if (status === 'SUBSCRIBED') {
        console.log('✅ SUPABASE: Subscription successful', { 
          channel: `cards_changes_${boardId}`,
          board_id: boardId 
        });
      }
    });
    
  // Store channel for cleanup
  subscriptionManager.subscribe(`cards_changes_${boardId}`, channel);
    
  return channel;
};

// Subscription management with retry logic and network resilience
export class SubscriptionManager {
  private subscriptions: Map<string, any> = new Map();
  private retryAttempts: Map<string, number> = new Map();
  private maxRetries: number = 5;
  private retryTimeouts: Map<string, number> = new Map();

  subscribe(key: string, subscription: any) {
    // Clean up existing subscription first to prevent conflicts
    this.unsubscribe(key);
    
    // Reset retry count for new subscription
    this.retryAttempts.set(key, 0);
    this.subscriptions.set(key, subscription);
    
    console.log('🔧 SUBSCRIPTION: Channel subscribed', { 
      key, 
      retries: this.retryAttempts.get(key),
      timestamp: new Date().toISOString()
    });
  }

  unsubscribe(key: string) {
    const subscription = this.subscriptions.get(key);
    
    // Clear any pending retry timeouts
    const timeout = this.retryTimeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.retryTimeouts.delete(key);
    }
    
    if (subscription) {
      try {
        supabase.removeChannel(subscription);
        console.log('🔧 SUBSCRIPTION: Successfully removed channel', { key });
      } catch (error) {
        console.warn('🔧 SUBSCRIPTION: Error removing channel', { key, error });
      }
    }
    
    this.subscriptions.delete(key);
    this.retryAttempts.delete(key);
  }

  handleTimeout(key: string, recreateCallback: () => void) {
    const currentAttempts = this.retryAttempts.get(key) || 0;
    
    if (currentAttempts < this.maxRetries) {
      this.retryAttempts.set(key, currentAttempts + 1);
      
      const retryDelay = Math.min(1000 * Math.pow(2, currentAttempts), 30000); // Exponential backoff, max 30s
      
      console.warn('🔧 SUBSCRIPTION: Scheduling retry', {
        key,
        attempt: currentAttempts + 1,
        maxAttempts: this.maxRetries,
        retryInMs: retryDelay,
        timestamp: new Date().toISOString()
      });
      
      const timeout = setTimeout(() => {
        console.log('🔧 SUBSCRIPTION: Executing retry', { key, attempt: currentAttempts + 1 });
        recreateCallback();
        this.retryTimeouts.delete(key);
      }, retryDelay);
      
      this.retryTimeouts.set(key, timeout as unknown as number);
    } else {
      console.error('🔧 SUBSCRIPTION: Max retries exceeded', {
        key,
        attempts: currentAttempts,
        timestamp: new Date().toISOString()
      });
    }
  }

  unsubscribeAll() {
    console.log('🔧 SUBSCRIPTION: Cleaning up all subscriptions', {
      count: this.subscriptions.size,
      keys: Array.from(this.subscriptions.keys())
    });
    
    // Clear all retry timeouts
    this.retryTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.retryTimeouts.clear();
    
    this.subscriptions.forEach((subscription, key) => {
      try {
        supabase.removeChannel(subscription);
        console.log('🔧 SUBSCRIPTION: Removed channel', { key });
      } catch (error) {
        console.warn('🔧 SUBSCRIPTION: Error removing channel', { key, error });
      }
    });
    this.subscriptions.clear();
    this.retryAttempts.clear();
  }

  getActiveSubscriptions() {
    return Array.from(this.subscriptions.keys());
  }

  getRetryStatus() {
    const status: Record<string, { attempts: number; maxRetries: number }> = {};
    this.retryAttempts.forEach((attempts, key) => {
      status[key] = { attempts, maxRetries: this.maxRetries };
    });
    return status;
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
