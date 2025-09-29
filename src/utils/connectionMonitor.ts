// Connection monitoring utility for network resilience
import React from 'react';
interface ConnectionState {
  isOnline: boolean;
  hasRecentErrors: boolean;
  subscriptionStatuses: Record<string, string>;
  lastConnected: Date | null;
}

class ConnectionMonitor {
  private state: ConnectionState = {
    isOnline: navigator.onLine,
    hasRecentErrors: false,
    subscriptionStatuses: {},
    lastConnected: navigator.onLine ? new Date() : null,
  };

  private listeners: Set<(state: ConnectionState) => void> = new Set();
  private reconnectAttempts = 0;

  constructor() {
    this.setupNetworkListeners();
    this.monitorSubscriptionHealth();
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.error('🔧 CONNECTION: Network restored', {
        timestamp: new Date().toISOString()
      });
      this.state.isOnline = true;
      this.state.lastConnected = new Date();
      this.state.hasRecentErrors = false;
      this.reconnectAttempts = 0;
      this.notifyListeners();
    });

    window.addEventListener('offline', () => {
      console.warn('🔧 CONNECTION: Network lost', {
        timestamp: new Date().toISOString()
      });
      this.state.isOnline = false;
      this.state.hasRecentErrors = true;
      this.notifyListeners();
    });
  }

  private monitorSubscriptionHealth() {
    // Check subscription health every 30 seconds
    setInterval(() => {
      const hasProblematicStatuses = Object.values(this.state.subscriptionStatuses).some(
        status => status === 'TIMED_OUT' || status === 'CLOSED'
      );

      if (hasProblematicStatuses && this.state.isOnline) {
        this.state.hasRecentErrors = true;
        this.reconnectAttempts++;
        this.notifyListeners();
        
        console.warn('🔧 CONNECTION: Detected subscription issues', {
          statuses: this.state.subscriptionStatuses,
          attempts: this.reconnectAttempts,
          timestamp: new Date().toISOString()
        });
      }
    }, 30000);
  }

  public updateSubscriptionStatus(channel: string, status: string) {
    this.state.subscriptionStatuses[channel] = status;
    
    if (status === 'SUBSCRIBED') {
      this.state.lastConnected = new Date();
      this.state.hasRecentErrors = false;
      this.reconnectAttempts = Math.max(0, this.reconnectAttempts - 1);
    } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
      this.state.hasRecentErrors = true;
    }

    this.notifyListeners();
  }

  public recordError(error: Error) {
    console.error('🔧 CONNECTION: Error recorded', {
      error: error.message,
      timestamp: new Date().toISOString()
    });

    if (error.name === 'NotFoundError' || error.message.includes('removeChild')) {
      // DOM manipulation errors don't necessarily indicate connection issues
      return;
    }

    this.state.hasRecentErrors = true;
    this.notifyListeners();
  }

  public getStatus(): ConnectionState {
    return { ...this.state };
  }

  public subscribe(callback: (state: ConnectionState) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Error in connection monitor listener:', error);
      }
    });
  }

  public getStatusMessage(): string {
    if (!this.state.isOnline) {
      return 'Offline - Check your internet connection';
    }

    if (this.state.hasRecentErrors) {
      if (this.reconnectAttempts > 0) {
        return `Connection issues - Attempting to reconnect (${this.reconnectAttempts}/5)`;
      }
      return 'Connection unstable - Reconnecting...';
    }

    return 'Connected';
  }

  public getStatusColor(): string {
    if (!this.state.isOnline) return 'text-red-600';
    if (this.state.hasRecentErrors) return 'text-yellow-600';
    return 'text-green-600';
  }
}

// Singleton instance
export const connectionMonitor = new ConnectionMonitor();

// React hook for connection status
export const useConnectionStatus = () => {
  const [status, setStatus] = React.useState(connectionMonitor.getStatus());
  
  React.useEffect(() => {
    const unsubscribe = connectionMonitor.subscribe(setStatus);
    return unsubscribe;
  }, []);

  const statusMessage = connectionMonitor.getStatusMessage();
  const statusColor = connectionMonitor.getStatusColor();
  
  return {
    ...status,
    statusMessage,
    statusColor,
  };
};
