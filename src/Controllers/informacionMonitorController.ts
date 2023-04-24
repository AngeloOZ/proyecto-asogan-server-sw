
import { Server } from 'socket.io';
import prisma from '../db/prisma';
import { lotes } from '@prisma/client';

export function obtenerLotePorEvento(socket: Server) {

    socket.on('setLotePorEvento', async (id_evento: number) => {
        console.log(`Evento recivido: ${id_evento}`);
        
        const lote = await prisma.lotes.findFirst({ where: { id_evento, subastado: 1 } });
        prisma.$disconnect();
        socket.emit('setLotePorEvento', lote);
    });

    socket.on('setLotePorEvento2', async (lote: lotes) => {
        console.log(`Evento recivido: `, lote);
    
        socket.emit('setLotePorEvento2', lote);
    });

}

export function obtenerUltimaPuja(socket: Server) {

    socket.on('setUltimaPuja', async (lote: lotes) => {

        const ultimaPuja = await prisma.pujas.findFirst({
            where: { id_lote: lote.id_lote },
            orderBy: [
                { puja: 'desc' },
                { fecha_creado: 'asc' }
            ],
            include: {
                usuario: {
                    select: { nombres: true, identificacion: true }
                }
            },
            take: 1
        })

        prisma.$disconnect();

        socket.emit('setUltimaPuja', ultimaPuja);
    });
}