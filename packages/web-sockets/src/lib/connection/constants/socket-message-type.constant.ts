/** Event names the client emits to the server. */
export enum SocketMessageType {
  JOIN_ROOM = 'join-room',
  LEAVE_ROOM = 'leave-room',
  MESSAGE = 'message',
}
