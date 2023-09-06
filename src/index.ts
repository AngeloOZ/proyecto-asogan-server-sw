import * as dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { Server } from 'socket.io';
import compression from 'compression';
import cors from 'cors';
import http from 'http';
import https from 'https';
dotenv.config();

import { RTCPeerController, configureConexionController, listadoPujas, mejoresPujas, obtenerLoteActivo, ultimaPuja } from './Controllers';
import { Broadcasters } from '../@types';
import { Viewers } from '../@types';

// Stun and Turn iceServers
let iceServers = [];
let broadcasters: Broadcasters = {};
let viewers: Viewers = {};
const protocol = process.env.PROTOCOL || 'http';
const PORT = process.env.PORT || 4000;

const stunServerUrl = process.env.STUN_SERVER_URL;
const turnServerUrl = process.env.TURN_SERVER_URL;
const turnServerUsername = process.env.TURN_SERVER_USERNAME;
const turnServerCredential = process.env.TURN_SERVER_CREDENTIAL;
const stunServerEnabled = getEnvBoolean(process.env.STUN_SERVER_ENABLED);
const turnServerEnabled = getEnvBoolean(process.env.TURN_SERVER_ENABLED);

if (stunServerEnabled && stunServerUrl) {
    iceServers.push({ urls: stunServerUrl });
}

if (turnServerEnabled && turnServerUrl && turnServerUsername && turnServerCredential) {
    iceServers.push({ urls: turnServerUrl, username: turnServerUsername, credential: turnServerCredential });
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    allowUpgrades: true,
    transports: ["polling", "websocket"],
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    }
});
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST'],
    optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(compression());


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

app.get(['/conectados'], (req, res) => {
    return res.json({
        numberBroadcasters: Object.keys(broadcasters).length,
        numberViewers: Object.keys(viewers).length,
        broadcasters,
        viewers
    });
});

io.sockets.on("error", e => console.log(e));
io.sockets.on('connection', (socket) => {

    configureConexionController(socket);

    obtenerLoteActivo(socket, io);

    ultimaPuja(socket, io);

    mejoresPujas(socket, io);

    listadoPujas(socket, io);

    RTCPeerController({
        io,
        socket,
        viewers,
        iceServers,
        broadcasters,
    });

});

server.listen(PORT, () => {
    console.info('Server is running', {
        home: `http://localhost:${PORT}`,
        nodeVersion: process.versions.node,
    });
});

function getEnvBoolean(key, force_true_if_undefined = false) {
    if (key == undefined && force_true_if_undefined) return true;
    return key == 'true' ? true : false;
}