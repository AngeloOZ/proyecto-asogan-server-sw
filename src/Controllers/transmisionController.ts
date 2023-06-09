import { Server, Socket } from "socket.io";

let broadcaster

export function transmisionVideo(socket: Socket, io: Server) {
    socket.on("broadcaster", () => {

        broadcaster = socket.id;
        socket.broadcast.emit("broadcaster");
    });
    socket.on("watcher", () => {

        socket.to(broadcaster).emit("watcher", socket.id);

    });
    socket.on("offer", (id, message) => {

        socket.to(id).emit("offer", socket.id, message);
    });
    socket.on("answer", (id, message) => {

        socket.to(id).emit("answer", socket.id, message);
    });
    socket.on("candidate", (id, message) => {

        socket.to(id).emit("candidate", socket.id, message);
    });
    socket.on("disconnect", () => {

        socket.to(broadcaster).emit("disconnectPeer", socket.id);
    });

    socket.on("video", () => {

        socket.broadcast.emit("video2");

    });
}