// src/services/websocket.js
import { useState, useEffect, useRef, useCallback } from 'react';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/v1/ws/notifications';

/**
 * Custom React hook for managing real-time WebSocket notification connections.
 * 
 * @param {Function} onFrame - Callback function triggered on incoming JSON frames (e.g., notification pushes or pings)
 * @param {Function} resyncRest - Callback function to trigger REST state resync upon successful socket connection
 */
export function useNotificationSocket(onFrame, resyncRest) {
  const [status, setStatus] = useState('connecting'); // 'connecting' | 'open' | 'reconnecting' | 'closed'
  const attempt = useRef(0);
  const stopRef = useRef(false);
  const wsRef = useRef(null);

  const connect = useCallback(() => {
    // Read current access token directly from localStorage
    const token = localStorage.getItem('swipex_auth_token') || localStorage.getItem('token');
    if (!token || stopRef.current) {
      setStatus('closed');
      return;
    }

    // Attach token strictly in the query parameter (no path trailing slashes)
    const wsUrl = `${WS_BASE_URL}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      attempt.current = 0;
      setStatus('open');
      if (resyncRest) resyncRest(); // Execute REST resync on connect
    };

    ws.onmessage = (event) => {
      try {
        const frame = JSON.parse(event.data);
        if (onFrame) onFrame(frame);
      } catch (err) {
        // Ignore non-JSON frames
      }
    };

    ws.onclose = () => {
      if (stopRef.current) {
        setStatus('closed');
        return;
      }
      setStatus('reconnecting');
      
      // Exponential backoff reconnect with jitter (1s to 30s)
      const delay = Math.min(30000, 1000 * Math.pow(2, attempt.current++)) + Math.random() * 500;
      setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [onFrame, resyncRest]);

  useEffect(() => {
    stopRef.current = false;
    connect();

    // Client heartbeat ping every 25s to keep websocket active
    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send('ping');
      }
    }, 25000);

    return () => {
      stopRef.current = true;
      clearInterval(pingInterval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return status;
}

export default useNotificationSocket;