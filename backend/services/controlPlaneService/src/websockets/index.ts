import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { AppError } from '../error/AppError';

let io: SocketIOServer;

export function initSocket(server: HttpServer) {
    io = new SocketIOServer(server, {
        // you forgot to pass the server
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket: Socket) => {
        console.log(`${socket.id} connected`);

        socket.on('disconnect', (reason: string) => {
            console.log(`${socket.id} disconnected because: ${reason}`);
        });
    });

    return io;
}

export function getIo() {
    if (!io) throw new AppError('Socket not initialized', '', 500);
    return io;
}
