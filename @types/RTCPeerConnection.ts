import { DisconnectReason, Server, Socket } from "socket.io";

export type Broadcasters = {
    [broadcastID: string]: string;
};

export type Viewer = {
    broadcastID: string;
    username: string;
};

export type Viewers = {
    [viewerID: string]: Viewer;
};

export interface ISendToBroadcasterViewers {
    socket: Socket;
    broadcastID: string;
    message: any;
    viewers: Viewers;
}

export interface IHandleDisconect {
    socket: Socket;
    broadcasters: Broadcasters;
    viewers: Viewers;
    reason: DisconnectReason;
}

export interface IHandleViewer {
    socket: Socket;
    iceServers: any[];
    broadcasters: Broadcasters;
    viewers: Viewers;
    broadcastID: string;
    username: string;
}

export interface IHandleBroadcaster {
    socket: Socket;
    broadcasters: Broadcasters;
    broadcastID: string;
    viewers: Viewers;
}

export interface IRTCPeerConnection {
    socket: Socket;
    io: Server;
    iceServers: any[];
    broadcasters: Broadcasters;
    viewers: Viewers
}