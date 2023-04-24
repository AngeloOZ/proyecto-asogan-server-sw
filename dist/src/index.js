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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
const Controllers_1 = require("./Controllers");
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});
// Configuración de la ruta de prueba
app.get('/status', (req, res) => {
    res.status(200).send('OK');
});
io.on('connection', (socket) => {
    (0, Controllers_1.configureConexionController)(socket);
    /* Obtener lote activo */
    socket.on('activarLote', (lote) => __awaiter(void 0, void 0, void 0, function* () {
        if (lote.subastado === 1) {
            io.emit('activarLote', lote);
        }
        else {
            io.emit('activarLote', null);
            io.emit('ultimaPuja', null);
        }
    }));
    socket.on('obtenerLoteActivo', (idEvento) => __awaiter(void 0, void 0, void 0, function* () {
        const loteActivo = yield prisma.lotes.findFirst({
            where: {
                subastado: 1,
                id_evento: idEvento
            }
        });
        socket.emit('activarLote', loteActivo);
    }));
    /* Obtener ultima puja */
    socket.on('ultimaPuja', ({ lote, ultimaPuja }) => __awaiter(void 0, void 0, void 0, function* () {
        io.emit('ultimaPuja', ultimaPuja);
        io.emit('activarLote', lote);
    }));
    socket.on('obtenerUltimaPuja', (idLote) => __awaiter(void 0, void 0, void 0, function* () {
        const puja = yield prisma.pujas.findFirst({
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
    }));
    /* Obtener mejores pujas */
    socket.on('mejoresPujas', (idLote) => __awaiter(void 0, void 0, void 0, function* () {
        ;
        const mejoresPujas = yield prisma.pujas.findMany({
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
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
