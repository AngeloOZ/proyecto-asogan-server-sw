import { Server, Socket } from "socket.io";

import prisma from "../db/prisma";

import { lotes } from "@prisma/client";

export function obtenerLoteActivo(socket: Socket, io: Server) {
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
}