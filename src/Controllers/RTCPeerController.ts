import { DisconnectReason } from "socket.io";
import { IHandleBroadcaster, IHandleDisconect, IHandleViewer, IRTCPeerConnection, ISendToBroadcasterViewers } from '../../@types';

export function RTCPeerController({ broadcasters, iceServers, socket, viewers }: IRTCPeerConnection) {

    socket.on('broadcaster', (broadcastID: string) => {
        handleBroadcaster({ socket, broadcasters, broadcastID, viewers });
    });
    socket.on('viewer', (broadcastID: string, username: string) => {
        handleViewer({ socket, iceServers, broadcasters, viewers, broadcastID, username });
    });
    socket.on('offer', (id: string, message: any) => {
        socket.to(id).emit('offer', socket.id, message, iceServers);
    });
    socket.on('answer', (id: string, message: any) => {
        socket.to(id).emit('answer', socket.id, message);
    });
    socket.on('candidate', (id: string, message: any) => {
        socket.to(id).emit('candidate', socket.id, message);
    });
    socket.on('disconnect', (reason: DisconnectReason) => {
        handleDisconnect({ socket, broadcasters, viewers, reason });
    });
}

function handleBroadcaster({ broadcastID, broadcasters, socket, viewers }: IHandleBroadcaster) {
    // No broadcastID in broadcasters init
    // if (!(broadcastID in broadcasters)) broadcasters[broadcastID] = {};
    if (!(broadcastID in broadcasters)) broadcasters[broadcastID] = "";
    broadcasters[broadcastID] = socket.id;
    console.log('New BroadCast ', broadcasters);
    sendToBroadcasterViewers({ socket, broadcastID, message: 'broadcaster', viewers });
}

function handleViewer({ socket, broadcasters, viewers, broadcastID, iceServers, username }: IHandleViewer) {
    if (!(socket.id in viewers)) viewers[socket.id] = { broadcastID: "", username: "" };

    viewers[socket.id]['broadcastID'] = broadcastID;
    viewers[socket.id]['username'] = username;
    // From Viewers socket emit to specified broadcaster.id

    // console.log(`Viewer connected to ${broadcastID} and his id is ${socket.id} and his username is ${username}`);
    socket.to(broadcasters[broadcastID]).emit('viewer', socket.id, iceServers, username);
}

function handleDisconnect({ socket, viewers, broadcasters, reason }: IHandleDisconect) {
    // Check if socket disconnected is a viewer, if so, delete it from the viewers list and update the broadcaster
    if (socket.id in viewers) {
        socket
            .to(broadcasters[viewers[socket.id]['broadcastID']])
            .emit('disconnectPeer', socket.id, viewers[socket.id]['username']);
        delete viewers[socket.id];
    }

    // Check if socket disconnected is broadcaster, if so, delete it from the broadcasters lists
    for (let broadcastID in broadcasters) {
        if (broadcasters[broadcastID] == socket.id) {
            delete broadcasters[broadcastID];
            sendToBroadcasterViewers({ socket, broadcastID, message: 'broadcasterDisconnect', viewers });            
        }
    }
}

function sendToBroadcasterViewers({ socket, broadcastID, message, viewers }: ISendToBroadcasterViewers) {
    for (let id in viewers) {
        const viewer = viewers[id];
        if (viewer['broadcastID'] == broadcastID){
            socket.to(id).emit(message);
            delete viewers[id];
        } 
    }
}
