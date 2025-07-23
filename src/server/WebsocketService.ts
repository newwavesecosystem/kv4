import SockJS from 'sockjs-client';
import * as ServerInfo from './ServerInfo';

const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY_BASE_MS = 1000;
const RECONNECT_DELAY_MAX_MS = 30000;

let sock: any | null = null;
let reconnectAttempts = 0;
let shouldReconnect = true;
let pingInterval: NodeJS.Timeout | null = null;

export const websocketService = {
    onOpen: () => {},
    onMessage: (data: any) => {},
    onClose: () => {},

    connect(messageHandler: (message: string) => void, startSub: () => void) {
        if (sock && (sock.readyState === SockJS.CONNECTING || sock.readyState === SockJS.OPEN)) {
            console.log('WebSocket connection attempt ignored: already open or connecting.');
            return;
        }

        sock = new SockJS(ServerInfo.websocketURL);
        reconnectAttempts = 0;
        shouldReconnect = true;

        sock.onopen = () => {
            console.log('WebSocket connection established');
            reconnectAttempts = 0;
            startSub();
            this.onOpen();
            // Start pinging to keep the connection alive
            if (pingInterval) clearInterval(pingInterval);
            pingInterval = setInterval(() => {
                if (sock && sock.readyState === SockJS.OPEN) {
                    this.send(JSON.stringify({ msg: 'ping' }));
                }
            }, 14000);
        };

        sock.onmessage = (e: MessageEvent) => {
            messageHandler(e.data);
        };

        sock.onclose = () => {
            console.log('WebSocket connection closed');
            if (pingInterval) clearInterval(pingInterval);
            this.onClose();

            if (shouldReconnect) {
                this.reconnect(messageHandler, startSub);
            }
        };
    },

    reconnect(messageHandler: (message: string) => void, onOpen: () => void) {
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.error('Max reconnect attempts reached. Giving up.');
            window.location.reload();
            return;
        }

        const delay = Math.min(RECONNECT_DELAY_BASE_MS * (2 ** reconnectAttempts), RECONNECT_DELAY_MAX_MS);
        reconnectAttempts++;

        console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})...`);
        setTimeout(() => {
            this.connect(messageHandler, onOpen);
        }, delay);
    },

    send(data: string) {
        if (sock && sock.readyState === SockJS.OPEN) {
            sock.send(data);
        } else {
            console.error('WebSocket is not connected. Cannot send message.');
        }
    },

    disconnect() {
        console.log('Disconnecting WebSocket...');
        shouldReconnect = false;
        if (pingInterval) clearInterval(pingInterval);
        if (sock) {
            sock.close();
            sock = null;
        }
    }
};
