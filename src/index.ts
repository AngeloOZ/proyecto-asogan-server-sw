import express, { Request, Response } from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import http from 'http';
import * as dotenv from 'dotenv';
import RTCMultiConnectionServer from 'rtcmulticonnection-server';
import { configureConexionController, listadoPujas, mejoresPujas, obtenerLoteActivo, ultimaPuja, transmisionVideo } from './Controllers';

dotenv.config();

const PORT = process.env.PORT || 4000;
const IP: string = process.env.IP || "0.0.0.0";
const app = express();
const server = new http.Server(app);

const jsonPath = { config: "config.json", logs: "logs.json" };
const BASH_COLORS_HELPER = RTCMultiConnectionServer.BASH_COLORS_HELPER;
const getValuesFromConfigJson = RTCMultiConnectionServer.getValuesFromConfigJson;
const getBashParameters = RTCMultiConnectionServer.getBashParameters;

let config = getValuesFromConfigJson(jsonPath);
config = getBashParameters(config, BASH_COLORS_HELPER);

app.use(cors());
app.use((req, res, next) => {
    config = getValuesFromConfigJson(jsonPath);
    config = getBashParameters(config, BASH_COLORS_HELPER);
    next();
});

RTCMultiConnectionServer.beforeHttpListen(server, config);

const httpServer = server.listen(PORT, function () {
    RTCMultiConnectionServer.afterHttpListen(httpServer, config);

    console.log(`Server is running on  http://localhost:${PORT}`);
});

const io = new Server(server, {
    allowUpgrades: true,
    transports: ["polling", "websocket"],
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    }
});

app.get('/', (req: Request, res: Response) => {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.write('Server is running');
    res.end();
});

app.get('/status', (req: Request, res: Response) => {
    res.status(200).send('Server is running');
});

io.sockets.on("error", e => console.log(e));

io.on('connection', (socket) => {

    RTCMultiConnectionServer.addSocket(socket, config);

    const params = socket.handshake.query;

    if (!params.socketCustomEvent) {
        params.socketCustomEvent = "custom-message";
    }

    const socketMessageEvent = params.socketCustomEvent as string;

    socket.on(socketMessageEvent, function (message) {
        socket.broadcast.emit(socketMessageEvent, message);
    });

    socket.on("cliente", function () {
        socket.broadcast.emit("clienteTransmision");
    });

    socket.on("conectados", function (conexion, id) {

        socket.broadcast.emit("conectadosTransmision", conexion, id);
    });


    configureConexionController(socket);

    obtenerLoteActivo(socket, io);

    ultimaPuja(socket, io);

    mejoresPujas(socket, io);

    listadoPujas(socket, io);

    // transmisionVideo(socket, io);

});
