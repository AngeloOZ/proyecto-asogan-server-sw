import express, { Request, Response } from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import http from 'http';

import * as dotenv from 'dotenv';
dotenv.config()

import { configureConexionController, mejoresPujas, obtenerLoteActivo, ultimaPuja } from './Controllers';

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Configuración de la ruta de prueba
app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Server is running');
});

app.get('/status', (req: Request, res: Response) => {
    res.status(200).send('OK');
});

io.on('connection', (socket) => {
    configureConexionController(socket);

    obtenerLoteActivo(socket, io);

    ultimaPuja(socket, io);

    mejoresPujas(socket, io);

});


server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
