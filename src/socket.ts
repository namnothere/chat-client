import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = 'http://localhost:3001';
// io.listen(+process.env.PORT);

export const socket = io(URL, {
    transports: ['websocket', 'polling', 'flashsocket']
});

