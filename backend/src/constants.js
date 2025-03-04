
// roles for users
export const UserRolesEnum = {
    USER: "USER",
    ADMIN: "ADMIN"
}

export const AvailableRoles = Object.values(UserRolesEnum)


export const ChatEventEnum = Object.freeze({
    // When user is ready to go:
    CONNECTED_EVENT: "connected",
    // When user gets disconnected:
    DISCONNECT_EVENT: "disconnected",
    // When user joins a socket rooms:
    JOIN_CHAT_EVENT: "joinChat",
    // When participant gets removed from group, chat gets deleted or leaves a group:
    LEAVE_CHAT_EVENT: "leaveChat",
    // When participant starts typing:
    TYPING_EVENT: "typing",
    // When participant stops typing:
    STOP_TYPING_EVENT: "stopTyping",
    // Message received event:
    MESSAGE_RECEIVED_EVENT: "messageReceived",
    // When message is deleted:
    MESSAGE_DELETE_EVENT: "messageDeleted",
    // When there is new one on one chat, new group chat or user gets added in the group:
    NEW_CHAT_EVENT: "newChat",
    // When admin updates a group name:
    UPDATE_GROUP_NAME_EVENT: "updateGroupName",
    // When there is an error in socket:
    SOCKET_ERROR_EVENT: "socketError"
});

export const AvailableChatEvent = Object.values(ChatEventEnum)

