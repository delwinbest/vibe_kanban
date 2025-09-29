import { useConnectionStatus } from '../../utils/connectionMonitor';

interface ConnectionStatusProps {
  className?: string;
}

export default function ConnectionStatus({ className = '' }: ConnectionStatusProps) {
  const { 
    isOnline, 
    hasRecentErrors, 
    statusMessage, 
    statusColor 
  } = useConnectionStatus();

  if (isOnline && !hasRecentErrors) {
    return null; // Don't show anything when everything is working fine
  }

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md ${className}`}>
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${statusColor === 'text-red-600' ? 'bg-red-500' : 'bg-yellow-500'}`} />
          <span className={`text-sm font-medium ${statusColor}`}>
            {statusMessage}
          </span>
          {hasRecentErrors && (
            <div className="animate-spin ml-1">
              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
