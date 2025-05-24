import { Injectable, Logger } from "@nestjs/common";
import { ConnectedUserRepository } from "./connected-user.repository";
import { ConnectedUser, User } from "@prisma/client";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class ConnectedUserService {
    private readonly logger = new Logger("ConnectedUserService")
    constructor(private connectedUserRepository: ConnectedUserRepository) { }

    async createConnectedUser(user: User, socketId: string): Promise<ConnectedUser> {
        try {
            const newuser = await this.connectedUserRepository.create(user, socketId);
            if (!newuser.userId) {
                throw new WsException('User id is not found')
            }
            return newuser;
        }
        catch (error) {
            this.logger.error('Create failed', error.stack)
            throw new WsException('Unexpected error while creating a connected user')
        }
    }

    async deleteConnectedUser(socketId: string) {
        try {
            return await this.connectedUserRepository.delete(socketId);
        }
        catch (error) {
            this.logger.error('Delete failed', error.stack)
            throw new WsException('Unexpected error when deleting a connected user')
        }
    }

    async deleteAllUsers() {
        try {
            return await this.connectedUserRepository.deleteAll();
        }
        catch (error) {
            this.logger.error('Delete all failed', error.stack)
            throw new WsException('Unexpected error when deleting all connected users')
        }
    }

}