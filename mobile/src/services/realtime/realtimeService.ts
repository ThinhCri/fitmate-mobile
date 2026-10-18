import { AppState } from 'react-native';
import { sessionManager } from '@/services/session/sessionManager';
import { getApiBaseUrl } from '@/services/api/baseUrl';

type RealtimeHandler = (payload: unknown) => void;

const RECORD_SEPARATOR = '\u001e';
const RAW_API_BASE_URL = getApiBaseUrl();

function buildHubUrl(token: string): string {
  const apiUrl = new URL(RAW_API_BASE_URL.replace(/\/+$/, ''));
  apiUrl.protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  apiUrl.pathname = apiUrl.pathname.replace(/\/api\/v1\/?$/, '') + '/hubs/realtime';
  apiUrl.search = `access_token=${encodeURIComponent(token)}`;
  return apiUrl.toString();
}

class RealtimeService {
  private socket: WebSocket | null = null;
  private listeners = new Map<string, Set<RealtimeHandler>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private explicitlyStopped = false;

  constructor() {
    AppState.addEventListener('change', (state) => {
      if (state === 'active' && this.listenerCount() > 0) this.connect();
      if (state !== 'active') this.closeSocket();
    });
    sessionManager.onSessionExpired(() => this.stop());
  }

  subscribe(eventName: string, handler: RealtimeHandler): () => void {
    const handlers = this.listeners.get(eventName) || new Set<RealtimeHandler>();
    handlers.add(handler);
    this.listeners.set(eventName, handlers);
    this.explicitlyStopped = false;
    this.connect();
    return () => {
      const current = this.listeners.get(eventName);
      current?.delete(handler);
      if (current?.size === 0) this.listeners.delete(eventName);
      if (this.listenerCount() === 0) this.stop();
    };
  }

  private listenerCount(): number {
    return [...this.listeners.values()].reduce((count, handlers) => count + handlers.size, 0);
  }

  private connect(): void {
    if (this.socket || this.explicitlyStopped || AppState.currentState !== 'active') return;
    const token = sessionManager.getAccessToken();
    if (!token) return;

    const socket = new WebSocket(buildHubUrl(token));
    this.socket = socket;
    socket.onopen = () => {
      this.reconnectAttempt = 0;
      socket.send(JSON.stringify({ protocol: 'json', version: 1 }) + RECORD_SEPARATOR);
    };
    socket.onmessage = (event) => this.handleFrame(typeof event.data === 'string' ? event.data : '');
    socket.onerror = () => socket.close();
    socket.onclose = () => {
      if (this.socket === socket) this.socket = null;
      this.scheduleReconnect();
    };
  }

  private handleFrame(raw: string): void {
    raw.split(RECORD_SEPARATOR).filter(Boolean).forEach((frame) => {
      try {
        const message = JSON.parse(frame) as { type?: number; target?: string; arguments?: unknown[]; error?: string };
        if (message.type === 1 && message.target) {
          this.listeners.get(message.target)?.forEach((handler) => handler(message.arguments?.[0]));
        } else if (message.type === 7) {
          this.closeSocket();
        }
      } catch {
        // Ignore malformed/partial protocol frames; the fallback poll remains authoritative.
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.explicitlyStopped || this.listenerCount() === 0 || AppState.currentState !== 'active' || this.reconnectTimer) return;
    const delays = [1000, 2000, 5000, 10000, 30000];
    const delay = delays[Math.min(this.reconnectAttempt, delays.length - 1)];
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private closeSocket(): void {
    const socket = this.socket;
    this.socket = null;
    if (socket && socket.readyState < WebSocket.CLOSING) socket.close();
  }

  private stop(): void {
    this.explicitlyStopped = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.closeSocket();
  }
}

export const realtimeService = new RealtimeService();
