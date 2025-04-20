import { UserInterface } from "./user.ts";

export interface ChatInterface {
    _id: String;
    admin: String;
    name: String;
    createdAt: String;
    updatedAt: String;
    isGroupChat: true;
    participants: UserInterface[];
    lastMessage: MessageInterface
}

export interface MessageInterface {
    _id: String;
    sender: Pick<UserInterface, "_id" | "username" | "avatar" | "email">;
    content: String;
    chat: String;
    attachment: {
        url: String,
        localPath: String,
        _id: String,
    }[];
    createdAt: String;
    updatedAt: String
}