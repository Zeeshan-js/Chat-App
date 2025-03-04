import mongoose, { Schema } from "mongoose"

const messageSchema = new Schema({
    chat: {
        type: Schema.Types.ObjectId,
        ref: "Chat"
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
    },
    attachment: {
        type: [
            {
                url: String,
                localPath: String
            }
        ],
        default: []
    }

}, { timestamps: true })

export const Message = mongoose.model("Message", messageSchema)