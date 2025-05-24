import {OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";


@WebSocketGateway(3002, {cors: {origin: '*'}}) 

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
 
    handleConnection(client: Socket, ...args: any[]) {
        console.log('Client connected:', client.id);

        client.broadcast.emit('user-joined', {
            message: `New user has joined the chat ${client.id}`}); 
    }

    handleDisconnect(client: any) {
        console.log('Client disconnected:', client.id);

        this.server.emit('user-left', {message : `User has left the chat ${client.id}`});
    }

    @SubscribeMessage('newMessage')
    handleNewMessage(client: Socket, message: string) {
        this.server.emit('newMessage', message); //
    }
}