import { Server, Socket } from "socket.io";

import prisma from "../db/prisma";

import { lotes } from "@prisma/client";

import { UltimaPuja } from "../../@types/UltimaPuja";

export function ultimaPuja(socket: Socket, io: Server) {

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

        io.emit('ultimaPuja', puja);

    });

}

export function mejoresPujas(socket: Socket, io: Server) {
    socket.on('mejoresPujas', async (idLote: number) => {

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
}

export function listadoPujas(socket: Socket, io: Server) {
    
    socket.on('listadoPujas', async (idLote: number) => {
        
        const mejoresPujas = await prisma.pujas.findMany({
            where: {
                id_lote: Number(idLote),

            },
            orderBy: [
                {
                    puja: 'asc',
                },
                {
                    id_puja: 'asc',
                }
            ],
        });

        io.emit('listadoPujas', mejoresPujas);
    });
}