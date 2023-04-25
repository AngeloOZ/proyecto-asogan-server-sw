import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient, lotes } from '@prisma/client';

import * as dotenv from 'dotenv';
dotenv.config()

import { configureConexionController, obtenerLotePorEvento, obtenerUltimaPuja } from './Controllers';
import { UltimaPuja } from '../@types/UltimaPuja';

const prisma = new PrismaClient();

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
app.get('/status', (req: Request, res: Response) => {
    res.status(200).send('OK');
});

io.on('connection', (socket) => {
    configureConexionController(socket);

    /* Obtener lote activo */
    socket.on('activarLote', async (lote: lotes) => {
        if (lote.subastado === 1) {
            io.emit('activarLote', lote);
        } else {
            io.emit('activarLote', null);
            io.emit('ultimaPuja', null);
        }
    });

    socket.on('obtenerLoteActivo', async (idEvento: number) => {
        const loteActivo = await prisma.lotes.findFirst({
            where: {
                subastado: 1,
                id_evento: idEvento
            }
        });
        socket.emit('activarLote', loteActivo);
    });

    /* Obtener ultima puja */
    socket.on('ultimaPuja', async ({ lote, ultimaPuja }: { lote: lotes, ultimaPuja: UltimaPuja }) => {
        io.emit('ultimaPuja', ultimaPuja);
        io.emit('activarLote', lote);
    });

    socket.on('obtenerUltimaPuja', async (idLote: number) => {

        const puja = await prisma.pujas.findFirst({
            where: {
                id_lote: Number(idLote),
            },
            include: {
                usuario: {
                    select: { nombres: true, identificacion: true }
                }
            },
            orderBy: [
                {
                    puja: 'desc',
                },
                {
                    id_puja: 'asc',
                }
            ],
            take: 1,
        });

        socket.emit('ultimaPuja', puja);

    });

    /* Obtener mejores pujas */
    socket.on('mejoresPujas', async (idLote: number) => {;
        
        const mejoresPujas = await prisma.pujas.findMany({
            where: {
                id_lote: Number(idLote),
                 
            },
            include: {
                usuario: {
                    select: { nombres: true, identificacion: true }
                }
            },
            orderBy: [
                {
                    puja: 'desc',
                },
                {
                    id_puja: 'asc',
                }
            ],
            take: 3,
        });

        io.emit('mejoresPujas', mejoresPujas);
    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
