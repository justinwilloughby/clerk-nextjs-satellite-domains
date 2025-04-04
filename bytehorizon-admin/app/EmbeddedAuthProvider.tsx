"use client";

import { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';

type PendingRequest = {
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
  timeout: NodeJS.Timeout;
};

// Context only provides the authentication interface, no token storage
const EmbeddedAuthContext = createContext<{
  executeAuthenticatedRequest: <T>(requestFn: (token: string) => Promise<T>) => Promise<T>;
  isLoading: boolean;
}>({
  executeAuthenticatedRequest: async () => { throw new Error('Auth context not initialized'); },
  isLoading: false
});

export function EmbeddedAuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const messageIdRef = useRef(1);
  // Use ref for pending requests to avoid dependency issues
  const pendingRequestsRef = useRef<Record<number, PendingRequest>>({});

  // Setup message listener on mount
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Validate origin
      if (event.origin !== 'https://bytehorizon.xyz') {
        console.warn(`Rejected message from untrusted origin: ${event.origin}`);
        return;
      }

      // Handle token response messages
      if (event.data?.type === 'AUTH_TOKEN_RESPONSE' && 
          typeof event.data.token === 'string' &&
          typeof event.data.id === 'number') {
        
        // Get the pending request
        const pendingRequest = pendingRequestsRef.current[event.data.id];
        
        if (pendingRequest) {
          // Clear the timeout
          clearTimeout(pendingRequest.timeout);
          
          // Resolve the promise with the token
          pendingRequest.resolve(event.data.token);
          
          // Remove from pending requests
          delete pendingRequestsRef.current[event.data.id];
        }
      }
    }

    // Store a reference to the current pending requests for cleanup
    const currentPendingRequests = pendingRequestsRef.current;

    // Register message listener
    window.addEventListener('message', handleMessage);
    
    // Clean up
    return () => {
      window.removeEventListener('message', handleMessage);
      
      // Clear any pending timeouts using the variable captured at effect creation time
      Object.values(currentPendingRequests).forEach(request => {
        clearTimeout(request.timeout);
      });
    };
  }, []);

  // Function to request a token from parent
  const requestToken = useCallback((): Promise<string> => {
    // Only proceed if we're in an iframe
    if (window.parent === window) {
      throw new Error('Not in an iframe, cannot request token');
    }

    return new Promise<string>((resolve, reject) => {
      const currentId = messageIdRef.current++;
      
      // Set a timeout to reject if parent doesn't respond
      const timeout = setTimeout(() => {
        // Clean up this pending request
        delete pendingRequestsRef.current[currentId];
        
        reject(new Error('Token request timed out'));
      }, 5000);
      
      // Store the promise handlers to resolve later
      pendingRequestsRef.current[currentId] = { resolve, reject, timeout };
      
      // Send request to parent
      window.parent.postMessage({
        type: 'REQUEST_AUTH_TOKEN',
        id: currentId,
        timestamp: Date.now()
      }, 'https://bytehorizon.xyz');
    });
  }, []);

  // Execute an authenticated request without storing the token
  const executeAuthenticatedRequest = useCallback(<T,>(
    requestFn: (token: string) => Promise<T>
  ): Promise<T> => {
    setIsLoading(true);
    
    return requestToken()
      .then(token => requestFn(token))
      .finally(() => {
        setIsLoading(false);
      });
  }, [requestToken]);

  return (
    <EmbeddedAuthContext.Provider value={{ executeAuthenticatedRequest, isLoading }}>
      {children}
    </EmbeddedAuthContext.Provider>
  );
}

// Hook to use the auth context
export function useEmbeddedAuth() {
  return useContext(EmbeddedAuthContext);
}