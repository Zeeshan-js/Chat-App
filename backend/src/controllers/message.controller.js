import mongoose from "mongoose";
import { Message } from "../models/message.model.js";
import { Chat } from "../models/chat.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cloudinaryUpload } from "../utils/cloudinary.js";
import { getLocalPath, getStaticFilePath, removeLocalFile } from "../utils/helper.js";
import { emitSocketEvent } from "../common/index.js";
import { ChatEventEnum } from "../constants.js";




// This is a common aggregation pipeline to structure the message chat schema for common lookups
const chatMessageCommonAggregation = () => {
    return [
        {
            $lookup: {
                from: "users",
                localField: "sender",
                foreignField: "_id",
                as: "sender",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            email: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                sender: {
                    $first: "$sender"
                }
            }
        }
    ]
};

const getAllMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)

    if (!chat) {
        throw new ApiError(404, "Chat did not found")
    }

    if (!chat.participants?.includes(req.user._id)) {
        throw new ApiError(400, "User is not a part of this chat")
    }

    const messages = await Message.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(chatId)
            }
        },
        ...chatMessageCommonAggregation(),
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, messages || [], "All messages fetched")
    )
});

const sendMessage = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { content } = req.body;

    // verify the chat exists
    const chat = await Chat.findById(chatId)

    if (!chat) {
        throw new ApiError(404, "Chat does not exists")
    }

    // check for the content or attachments
    if (!(content || req.files.attachment.length)) {
        throw new ApiError(400, "Content or attachment is required")
    }

    const attachments = []

    // If there are attachments we map through them and push them in the attachments array
    if (req.files && req.files.attachment.length > 0) {
        req.files?.attachment?.map((files) => {
            attachments.push({
                url: getStaticFilePath(req, files.filename),
                localPath: getLocalPath(files.filename)
            })
        })
    }

    const message = await Message.create({
        chat: new mongoose.Types.ObjectId(chatId),
        sender: new mongoose.Types.ObjectId(req.user._id),
        content: content || "",
        attachment: attachments || []
    })

    // Update the chat lastMessage to our current message this helps us keep track of messages
    const newChat = await Chat.findByIdAndUpdate(chatId,{
        $set: {
            lastMessage: message._id
        }
    }, { new: true })

    // structure the message schema
    const messages = await Message.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(message._id)
            }
        },
        ...chatMessageCommonAggregation()
    ])

    const payload = messages[0] // store the aggregation result

    if (!payload) {
        throw new ApiError(500, "Internal server error")
    }

    chat?.participants?.forEach((participantId) => {
        if (participantId.toString() === req.user._id.toString()) return // don't emit the event to the sender 

        emitSocketEvent(
            req,
            participantId.toString(),
            ChatEventEnum.MESSAGE_RECEIVED_EVENT,
            payload
        )
    })

    return res.status(201).json(
        new ApiResponse(201, payload, "Message sent successfully")
    )
});

const deleteMessage = asyncHandler(async (req, res) => {
    const { chatId, messageId } = req.params;

    const chat = await Chat.findOne({
        _id: new mongoose.Types.ObjectId(chatId)
    })

    if (!chat) {
        throw new ApiError(404, "Chat does not exists")
    }

    // check if the user is part of the chat
    if (!chat.participants.includes(req.user._id)) {
        throw new ApiError(401, "You are not part of this chat")
    }

    const message = await Message.findOne({
        _id: new mongoose.Types.ObjectId(messageId)
    })

    if (message.sender._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to perform this operation, because you are not the sender of this message")
    }

    // delete the message
    const deleteMessage = await Message.deleteOne({
        _id: new mongoose.Types.ObjectId(messageId)
    })

    // remove all the attachments if there is any
    if (message.attachment.length > 0) {
        message.attachment.map((files) => {
            removeLocalFile(files.localPath)
        })
    }

    // update the chat strucutre from removed message
    if (chat.lastMessage._id.toString() === message._id.toString()) {
        const lastMessage = await Message.findOne(
        {chat: chatId }, {}, { sort: { createdAt: -1 }})

        await Chat.findByIdAndUpdate(chatId, {
            $set: {
                lastMessage: lastMessage ? lastMessage._id : null
            }
        })
    }

    chat.participants?.forEach((participantId) => {
        if (participantId.toString() === req.user._id.toString()) return

        emitSocketEvent(
            req,
            participantId.toString(),
            ChatEventEnum.MESSAGE_DELETE_EVENT,
            message
        )
    })

    return res.status(200).json(
        new ApiResponse(200, message, "Message deleted successfully")
    )
})

export { getAllMessages, sendMessage, deleteMessage };