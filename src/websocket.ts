/**
 * Signal WebSocket
 * Reactive WebSocket integration
 */

import { signal, type Signal } from './signal';

export interface WebSocketSignalOptions {
  protocols?: string | string[];
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

/**
 * Creates a reactive WebSocket signal
 */
export function websocketSignal<T = string>(
  url: string,
  options: WebSocketSignalOptions = {}
): Signal<T | null> & {
  send: (data: string | ArrayBuffer | Blob) => void;
  close: () => void;
  reconnect: () => void;
  isConnected: () => boolean;
} {
  const {
    protocols,
    reconnect = true,
    reconnectInterval = 1000,
    maxReconnectAttempts = Infinity,
    onOpen,
    onClose,
    onError,
  } = options;

  const sig = signal<T | null>(null);
  let ws: WebSocket | null = null;
  let reconnectAttempts = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let isManualClose = false;

  const connect = () => {
    try {
      ws = protocols
        ? new WebSocket(url, protocols)
        : new WebSocket(url);

      ws.onopen = () => {
        reconnectAttempts = 0;
        if (onOpen) {
          onOpen();
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          sig.set(data as T);
        } catch {
          sig.set(event.data as T);
        }
      };

      ws.onerror = (error) => {
        if (onError) {
          onError(error);
        }
      };

      ws.onclose = () => {
        if (onClose) {
          onClose();
        }

        if (!isManualClose && reconnect && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          reconnectTimer = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };
    } catch (error) {
      if (onError) {
        onError(error as Event);
      }
    }
  };

  const send = (data: string | ArrayBuffer | Blob) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  };

  const close = () => {
    isManualClose = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (ws) {
      ws.close();
      ws = null;
    }
  };

  const reconnect = () => {
    close();
    isManualClose = false;
    reconnectAttempts = 0;
    connect();
  };

  const isConnected = (): boolean => {
    return ws !== null && ws.readyState === WebSocket.OPEN;
  };

  // Connect initially
  connect();

  return Object.assign(sig, {
    send,
    close,
    reconnect,
    isConnected,
  });
}

