"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerUltimaPuja = exports.obtenerLotePorEvento = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
function obtenerLotePorEvento(socket) {
    socket.on('setLotePorEvento', (id_evento) => __awaiter(this, void 0, void 0, function* () {
        console.log(`Evento recivido: ${id_evento}`);
        const lote = yield prisma_1.default.lotes.findFirst({ where: { id_evento, subastado: 1 } });
        prisma_1.default.$disconnect();
        socket.emit('setLotePorEvento', lote);
    }));
    socket.on('setLotePorEvento2', (lote) => __awaiter(this, void 0, void 0, function* () {
        console.log(`Evento recivido: `, lote);
        socket.emit('setLotePorEvento2', lote);
    }));
}
exports.obtenerLotePorEvento = obtenerLotePorEvento;
function obtenerUltimaPuja(socket) {
    socket.on('setUltimaPuja', (lote) => __awaiter(this, void 0, void 0, function* () {
        const ultimaPuja = yield prisma_1.default.pujas.findFirst({
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
        });
        prisma_1.default.$disconnect();
        socket.emit('setUltimaPuja', ultimaPuja);
    }));
}
exports.obtenerUltimaPuja = obtenerUltimaPuja;
