// Barrel — re-export the entire public surface
// Add exports here as the library grows

// Connection — config, provider, service
export type { WebSocketConfig } from './lib/connection/config/web-socket-config.token';
export { WEBSOCKET_CONFIG } from './lib/connection/config/web-socket-config.token';
export { provideWebSocket } from './lib/connection/providers/web-socket.provider';
export { WebSocketService } from './lib/connection/services/web-socket.service';

// Connection — constants
export { SocketEventType } from './lib/connection/constants/socket-event.constant';
export { SocketMessageType } from './lib/connection/constants/socket-message-type.constant';

// Connection — interfaces
export type { Room } from './lib/connection/interfaces/room.interface';
export type { RoomAcknowledge } from './lib/connection/interfaces/room-acknowledge.interface';
export type { ClientConnection } from './lib/connection/interfaces/client-connection.interface';
export type { WebsocketError } from './lib/connection/interfaces/websocket-error.interface';

// Chat — components
export { ChatRoom } from './lib/chat/components/chat-room/chat-room';
export { ChatMessageBubble } from './lib/chat/components/chat-message-bubble/chat-message-bubble';

// Chat — constants
export { ChatMessageType } from './lib/chat/constants/chat-message-type.constant';

// Chat — interfaces
export type { ChatMessage } from './lib/chat/interfaces/chat-message.interface';
