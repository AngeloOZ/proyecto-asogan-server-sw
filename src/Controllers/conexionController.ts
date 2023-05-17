import { Socket } from 'socket.io';

export function configureConexionController(socket: Socket) {
    // console.log(`Socket connected: ${socket.id}`);

    // socket.emit('connection', 'Hola mundo desde el server');
    

    socket.on('disconnect', () => {
        // console.log(`Socket disconnected: ${socket.id}`);
    });
}
