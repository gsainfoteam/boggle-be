import { RoomRepository } from "./room.repository";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { AssignUsersDto, CreateRoomDto, UpdateRoomDto } from "../dto/room.dto";
import { Room, User } from "@prisma/client";


@Injectable()
export class RoomService {
    constructor(private roomRepository: RoomRepository) { }

    async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
        try {
            const room = await this.roomRepository.create(createRoomDto);
            return room;
        } catch (error) {
            throw new InternalServerErrorException("Internal server error");
        }
    }

    async deleteRoom(uuid: string, user: User): Promise<Room> {
        try {
           const room = await this.roomRepository.findOne(uuid);
            if(user.uuid != room.hostId){
                throw new Error("Only host is allowed to delete the room")
            }
            return await this.roomRepository.delete(uuid);
             
        } catch (error) {
            throw new InternalServerErrorException("Internal server error");
        }
    }

    async findRoomById(uuid: string): Promise<Room> {
        try {
            return await this.roomRepository.findOne(uuid)
        }
        catch (error) {
            throw new InternalServerErrorException("Internal server error")
        }
    }


    async updateRoom(updateRoomDto: UpdateRoomDto, user: User): Promise<Room> {
        try {
            const room = await this.roomRepository.update(updateRoomDto);
            if(room.hostId != user.uuid){
                throw new Error("Only host is allowed to update the room")
            }
            return room
        }
        catch (error) {
            throw new InternalServerErrorException("Internal server error")
        }
    }


    async joinRoom(roomId: string, user: User): Promise<Room> {
        try {
            return await this.roomRepository.joinRoom(roomId, user.uuid);
        }
        catch (error) {
            throw new InternalServerErrorException("Internal server error")
        }
    }


    async leaveRoom(roomId: string, user: User): Promise<Room> {
        try {
            return await this.roomRepository.leaveRoom(roomId, user.uuid)
        }
        catch(error){
            throw new InternalServerErrorException("Internal server error")
        }
    }

    
    async assignUsers(assignUsersDto: AssignUsersDto, user:User){
        try{
            const room = await this.roomRepository.findOne(assignUsersDto.roomId);
            if(user.uuid != room.hostId){
                throw new Error("Only host is allowed to assign users"); 
            } 
            return await this.roomRepository.assignUsers(assignUsersDto);
        }
        catch(error){
            throw new InternalServerErrorException("Internal server Error")
        }
    }

}