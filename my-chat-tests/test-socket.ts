// test-socket.ts
import { io, Socket } from 'socket.io-client';
import { RoomTypeEnum } from '../src/chat/common/enums/room-type.enum';

const SERVER_URL = 'http://localhost:3002';

// IMPORTANT: REPLACE WITH YOUR NEWLY GENERATED JWT TOKEN
// Its payload MUST have a valid UUID for the 'uuid' field.
const YOUR_AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiZWJiZTFkMTMtYjdiNS00OTFhLWE4ZmItZDMxNmYxZWZjMDYwIiwiZW1haWwiOiJhYmNAYWJjLmNvbSIsImlhdCI6MTc1MTA4NzY4NiwiZXhwIjoxNzUxMTA1Njg2fQ.AWz8-9j9IlJyG6LTk_wh7q-dnd80ML4M8t1B2E65ij0';

// IMPORTANT: Replace with an actual UUID of another user from your database.
const OTHER_USER_UUID_1 = '8dc83a46-5e5a-45e7-86fd-bd40e599f7bd'; // Example UUID

// IMPORTANT: This should be the UUID from your YOUR_AUTH_TOKEN's payload.
// You'll need this for operations that require the current user's UUID.
const CURRENT_USER_UUID = 'ebbe1d13-b7b5-491a-a8fb-d316f1efc060'; // Replace with YOUR user's real UUID


let clientSocket: Socket;
let createdRoomId: string | null = null;
let sentMessageId: string | null = null; // To store the ID of the message sent


async function runTest() {
    console.log(`\n[CLIENT] Connecting to ${SERVER_URL}...`);

    clientSocket = io(SERVER_URL, {
        transports: ['websocket'],
        auth: {
            token: YOUR_AUTH_TOKEN,
        },
    });

    // --- Core Socket.IO Events ---
    clientSocket.on('connect', () => {
        console.log(`[CLIENT] Connected! Socket ID: ${clientSocket.id}`);
        // Once connected, trigger your test sequence
        triggerChatEventsSequence();
    });

    clientSocket.on('disconnect', (reason) => {
        console.log(`[CLIENT] Disconnected: ${reason}`);
    });

    clientSocket.on('connect_error', (err) => {
        console.error(`[CLIENT ERROR] Connection failed: ${err.message}`);
    });

    // --- Custom Events from Your NestJS ChatGateway ---
    clientSocket.on('exception', (error) => {
        console.error(`[SERVER EXCEPTION] Server sent an error:`, error);
    });

    clientSocket.on('userAllRooms', (rooms) => {
        console.log(`[SERVER EVENT] Received 'userAllRooms' (initial rooms for user):`, rooms);
    });

    clientSocket.on('roomCreated', (room) => {
        console.log(`[SERVER EVENT] Received 'roomCreated':`, room);
        createdRoomId = room.uuid; // Store the room ID for later messages
        console.log(`[INFO] Stored created room ID: ${createdRoomId}`);
    });

    clientSocket.on('roomDetailsFetched', (room) => {
        console.log(`[SERVER EVENT] Received 'roomDetailsFetched':`, room);
    });

    clientSocket.on('messageSent', (message) => {
        console.log(`[SERVER EVENT] Received 'messageSent':`, message);
        sentMessageId = message.uuid; // Assuming your message object has a 'uuid' field
        console.log(`[INFO] Stored sent message ID: ${sentMessageId}`);
    });

    clientSocket.on('allMessages', (messages) => {
        console.log(`[SERVER EVENT] Received 'allMessages':`, messages);
    });

    clientSocket.on('messageUpdated', (updatedConversation) => {
        console.log(`[SERVER EVENT] Received 'messageUpdated' (full conversation):`, updatedConversation);
    });

    clientSocket.on('messageDeleted', (data) => {
        console.log(`[SERVER EVENT] Received 'messageDeleted':`, data);
    });

    clientSocket.on('roomUpdated', (room) => {
        console.log(`[SERVER EVENT] Received 'roomUpdated':`, room);
    });

    clientSocket.on('roomDeleted', (data) => {
        console.log(`[SERVER EVENT] Received 'roomDeleted':`, data);
    });

    clientSocket.on('tokenRefreshed', (data) => {
        console.log(`[SERVER EVENT] Received 'tokenRefreshed':`, data);
        // You could update YOUR_AUTH_TOKEN here if you were simulating long sessions
        // YOUR_AUTH_TOKEN = data.accessToken;
    });
}

// --- Function to Orchestrate Complex Test Events ---
async function triggerChatEventsSequence() {
    console.log('\n--- Starting Complex Test Sequence ---');

    // TEST 1: Create a Room
    console.log('\n[TEST 1] Emitting "createRoom"...');
    clientSocket.emit('createRoom', {
        name: `Automated Test Room ${Date.now()}`,
        hostId: CURRENT_USER_UUID, // Use the UUID from YOUR_AUTH_TOKEN
        hostName: 'Automated Test Client',
        romType: RoomTypeEnum.GROUP, 
        participantsId: [OTHER_USER_UUID_1], // Include the current user and another user
    });


    // Wait for the roomCreated event
    await new Promise<void>((resolve) => {
        const checkRoomCreated = setInterval(() => {
            if (createdRoomId) {
                clearInterval(checkRoomCreated);
                console.log('[INFO] Room creation confirmed.');
                resolve();
            }
        }, 20); // Check every 200ms
    });

    // TEST 2: Get Room Details
    console.log(`\n[TEST 2] Emitting "getRoomDetails" for room ${createdRoomId}...`);
    clientSocket.emit('getRoomDetails', { roomId: createdRoomId });
    await new Promise(r => setTimeout(r, 500)); // Give a moment for response

    // TEST 3: Send a Message
    console.log(`\n[TEST 3] Emitting "sendMessage" to room ${createdRoomId}...`);
    clientSocket.emit('sendMessage', {
        roomId: createdRoomId,
        content: `Hello from automated test client! Message sent at ${new Date().toLocaleTimeString()}`
    });

    // Wait for the messageSent event
    await new Promise<void>((resolve) => {
        const checkMessageSent = setInterval(() => {
            if (sentMessageId) {
                clearInterval(checkMessageSent);
                console.log('[INFO] Message sent confirmed.');
                resolve();
            }
        }, 200); // Check every 200ms
    });

    // TEST 4: Find All Messages in the Room
    console.log(`\n[TEST 4] Emitting "findAllMessages" for room ${createdRoomId}...`);
    clientSocket.emit('findAllMessages', { roomId: createdRoomId });
    await new Promise(r => setTimeout(r, 500)); // Give a moment for response

    // TEST 5: Update a Message (Requires sentMessageId)
    if (sentMessageId) {
        console.log(`\n[TEST 5] Emitting "updateMessage" for message ${sentMessageId}...`);
        clientSocket.emit('updateMessage', {
            messageId: sentMessageId,
            content: `Updated message content at ${new Date().toLocaleTimeString()}`
        });
        await new Promise(r => setTimeout(r, 1000)); // Give a moment for response and broadcast
    } else {
        console.warn('[WARNING] Cannot run updateMessage test: sentMessageId not available.');
    }

    // TEST 6: Request Token Refresh (Optional, demonstrates this endpoint)
    // You would typically have a refresh token mechanism here.
    // Assuming you have a refresh token for the CURRENT_USER_UUID
    // This part assumes a very basic structure for the refresh token DTO.
    console.log(`\n[TEST 6] Emitting "refreshToken" for current user...`);
    clientSocket.emit('refreshToken', {
        refreshToken: 'YOUR_REFRESH_TOKEN_HERE_IF_YOU_HAVE_ONE' // Replace with an actual refresh token if applicable
    });
    await new Promise(r => setTimeout(r, 1000)); // Give a moment for response

    // TEST 7: Delete a Message (Requires sentMessageId)
    if (sentMessageId) {
        console.log(`\n[TEST 7] Emitting "deleteMessage" for message ${sentMessageId}...`);
        clientSocket.emit('deleteMessage', {
            roomId: createdRoomId,
            messageIds: [sentMessageId]
        });
        await new Promise(r => setTimeout(r, 1000)); // Give a moment for response and broadcast
    } else {
        console.warn('[WARNING] Cannot run deleteMessage test: sentMessageId not available.');
    }

    // TEST 8: Update Room Name (Requires host permissions, using CURRENT_USER_UUID)
    console.log(`\n[TEST 8] Emitting "updateRoom" for room ${createdRoomId}...`);
    clientSocket.emit('updateRoom', {
        roomId: createdRoomId,
        name: `Renamed Test Room ${Date.now()}`
        // participantsId is optional here, can be added if you want to test adding/removing members
    });
    await new Promise(r => setTimeout(r, 1000)); // Give a moment for response and broadcast


    // TEST 9: Delete Room (Requires host permissions, using CURRENT_USER_UUID)
    console.log(`\n[TEST 9] Emitting "deleteRoom" for room ${createdRoomId}...`);
    clientSocket.emit('deleteRoom', {
        roomId: createdRoomId
        // Your server's deleteRoom method expects `roomId` and `currentUser.uuid` for auth.
        // The DTO itself doesn't need hostId if your gateway derives it.
    });
    await new Promise(r => setTimeout(r, 1000)); // Give a moment for response and broadcast

    console.log('\n--- Complex Test Sequence Finished (emissions sent) ---');

    // Disconnect after all tests are emitted and given time for responses
    setTimeout(() => {
        if (clientSocket.connected) {
            console.log('\n[CLIENT] Disconnecting after test sequence completion.');
            clientSocket.disconnect();
        }
    }, 2000); // Give a final 2 seconds for any last server responses
}

// --- Start the Test ---
runTest();