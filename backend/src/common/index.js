import { Socket } from "socket.io"
import cookie from "cookie"
import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import { AvailableChatEvent, ChatEventEnum } from "../constants.js"

// this event emits on when user joins a chat
const mountJointChat = (socket) => {
    socket.on(ChatEventEnum.JOIN_CHAT_EVENT,(chatId) => {
    console.log(`User joined the chat 👍 chatId: ${chatId}`)
    socket.join(chatId)
    });
};

// this event emits on when a user starts typing in chat room
const mountParticipantTypingEvent = (socket) => {
    socket.on(ChatEventEnum.TYPING_EVENT, (chatId) => {
        socket.in(chatId).emit(ChatEventEnum.TYPING_EVENT, chatId)
    });
};

// this event emits on when a user stops typing in chat room
const mountParticipantStoppedTypingEvent = (socket) => {
    socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId) => {
        socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId)
    })
}

const initializeSocketIo = (io) => {
    return io.on("connection", async(socket) => {
        try {
            const cookies = cookie.parse(socket.handshake.headers?.cookie || "")
    
            let token = cookies?.accessToken // extract the accessToken from the cookies
    
            if (!token) {
                // 
                token = socket.handshake.auth?.token
            }
    
            if (!token) {
                throw new ApiError(401, "Unauthorized handshake - Token is missing")
            }
    
            const decodedToken = jwt.verify(token,ACCESS_TOKEN_SECRET)
            const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
            if (!user) {
                throw new ApiError(401, "Unauthorized handshake - Token is invalid")
            }
    
            
            socket.user = user // pass the entire user to the socket.user
    
            socket.join(user._id.toString())
            socket.emit(ChatEventEnum.CONNECTED_EVENT)
            console.log("User is connected userId :", user._id.toString())
    
            // These method needs to be initialized in the Socket initialization
            mountJointChat(socket)
            mountParticipantTypingEvent(socket)
            mountParticipantStoppedTypingEvent(socket)
    
            socket.on(ChatEventEnum.DISCONNECT_EVENT,() => {
                console.log("User is disconnected userId: "+ socket.user?._id)
                if (socket.user?._id) {
                 socket.leave(socket.user?._id)
                }
            })
        } catch (error) {
            socket.on(ChatEventEnum.SOCKET_ERROR_EVENT,() => 
                error?.message || "Something went wrong while connecting to the socket")
        }
    })
}

const emitSocketEvent = (req, roomId, event, payload => {
    req.app.get("io").in(roomId).emit(event, payload);
})

export { initializeSocketIo, emitSocketEvent }