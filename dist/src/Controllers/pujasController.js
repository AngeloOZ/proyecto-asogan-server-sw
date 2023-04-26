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
exports.mejoresPujas = exports.ultimaPuja = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
function ultimaPuja(socket, io) {
    socket.on('ultimaPuja', ({ lote, ultimaPuja }) => __awaiter(this, void 0, void 0, function* () {
        io.emit('ultimaPuja', ultimaPuja);
        io.emit('activarLote', lote);
    }));
    socket.on('obtenerUltimaPuja', (idLote) => __awaiter(this, void 0, void 0, function* () {
        const puja = yield prisma_1.default.pujas.findFirst({
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
    }));
}
exports.ultimaPuja = ultimaPuja;
function mejoresPujas(socket, io) {
    socket.on('mejoresPujas', (idLote) => __awaiter(this, void 0, void 0, function* () {
        ;
        const mejoresPujas = yield prisma_1.default.pujas.findMany({
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
    }));
}
exports.mejoresPujas = mejoresPujas;
