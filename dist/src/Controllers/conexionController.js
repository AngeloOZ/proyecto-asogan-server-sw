"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureConexionController = void 0;
function configureConexionController(socket) {
    // console.log(`Socket connected: ${socket.id}`);
    // socket.emit('connection', 'Hola mundo desde el server');
    socket.on('disconnect', () => {
        // console.log(`Socket disconnected: ${socket.id}`);
    });
}
exports.configureConexionController = configureConexionController;
