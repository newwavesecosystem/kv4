// socket.js
import { io, Socket } from 'socket.io-client';

const socket = io('https://k4caption.konn3ct.ng');
// const socket: Socket = io('http://34.207.102.15:3001');
// const socket: Socket = io('http://localhost:3001');

export default socket;
