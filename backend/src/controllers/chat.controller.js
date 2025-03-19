import mongoose, { isValidObjectId, mongo } from "mongoose";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { emitSocketEvent } from "../common/index.js";
import { ChatEventEnum } from "../constants.js";
import { Message } from "../models/message.model.js";

// This is a common aggregation to get details like user and messages
const commonChatAggregation = () => {
  return [
    {
      // lookup for the participants present
      $lookup: {
        from: "users",
        localField: "participants",
        foreignField: "_id",
        as: "participants",
        pipeline: [
          {
            $project: {
              password: 0,
              refreshToken: 0,
            },
          },
        ],
      },
    },
    {
      // lookup for the group chats
      $lookup: {
        from: "messages",
        localField: "lastMessage",
        foreignField: "_id",
        as: "lastMessage",
        pipeline: [
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
                    email: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              sender: {
                $first: "$sender",
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        lastMessage: {
          $first: "$lastMessage",
        },
      },
    },
  ];
};

const deleteCascadeChatMessages = async (chatId) => {
  // first get the messages associated with that chat
  const messages = await Message.find({
    chat: new mongoose.Types.ObjectId(chatId),
  });

  let attachments = [];

  // get all the attachments associated with that chat
  attachments = attachments?.concat(
    ...messages.map((message) => {
      return message.attachment;
    })
  );

  // remove all the attachments
  attachments?.forEach((attachment) => {
    removeLocalFile(attachment.localPath);
  });

  // delete all the messages
  await Message.deleteMany({
    chat: new mongoose.Types.ObjectId(chatId),
  });
};

const searchAvailableUser = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: {
          $ne: req.user._id,
        },
      },
    },
    {
      $project: {
        avatar: 1,
        username: 1,
        email: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User successfully fetched"));
});

const createOrGetAOneOnOneChat = asyncHandler(async (req, res) => {
  const { receiverId } = req.params; // extract the other user id

  if (!isValidObjectId(receiverId)) {
    throw new ApiError(404, "Invalid User Id")
  }

  const receiver = await User.findById(receiverId);

  if (!receiver) {
    throw new ApiError(404, "Receiver does not exists");
  }

  // check if the user is sending the recieveing request to itself
  if (receiver._id.toString() === req.user._id.toString()) {
    throw new ApiError(401, "You cannot chat with yourself");
  }

  const chat = await Chat.aggregate([
    {
      $match: {
        isGroupChat: false,
        // filter out all the group chat cause we want one on one chat rooms

        // $and is a conditinal checking operator like the AND operator in JS where both ends needs to be true
        // You only get to the next stage if you satisfy the conditions you provided to $and operator
        $and: [
          {
            participants: { $elemMatch: { $eq: req.user._id } },
          },
          {
            participants: {
              $elemMatch: { $eq: new mongoose.Types.ObjectId(receiverId) },
            },
          },
        ],
      },
    },
    ...commonChatAggregation(),
  ]);

  if (chat.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, chat[0], "Chat retrieved successfully"));
  }

  const newChat = await Chat.create({
    name: receiver.username,
    participants: [req.user._id, new mongoose.Types.ObjectId(receiverId)],
    admin: req.user._id,
  });

  //
  const createChat = await Chat.aggregate([
    {
      $match: {
        _id: newChat._id,
      },
    },
    ...commonChatAggregation(),
  ]);

  const payload = createChat[0]; // storing the aggregatin result

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  payload?.participants?.forEach((participant) => {
    if (req.user._id.toString() === participant._id.toString()) return; // we don't want to send the event to user who initiated it.

    emitSocketEvent(
      req,
      participant._id?.toString(),
      ChatEventEnum.NEW_CHAT_EVENT,
      payload
    );
  });

  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Chat created successfully"));
});

const createAGroupChat = asyncHandler(async (req, res) => {
  const { name, participants } = req.body;

  if (participants.includes(req.user._id.toString())) {
    throw new ApiError(
      400,
      "Participants array should not contain the group creater"
    );
  }

  // check for duplicate memberts in group chat
  // the new { Set } method doesen't allow a duplicate value in object
  const members = [...new Set([...participants, req.user._id.toString()])];

  // check the total length of our group
  if (members.length < 3) {
    throw new ApiError(400, "Seems like you have passed a duplicate");
  }

  const groupChat = await Chat.create({
    name,
    isGroupChat: true,
    participants: members,
    admin: req.user._id,
  });

  const newGroupChat = await Chat.aggregate([
    {
      $match: {
        _id: groupChat._id,
      },
    },
    ...commonChatAggregation(),
  ]);

  const payload = newGroupChat[0]; // store the aggregated result

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  payload?.participants?.forEach((participant) => {
    if (participant._id.toString() === req.user._id.toString()) return; // don't emit the event on the creater of the group

    emitSocketEvent(
      req,
      participant._id.toString(),
      ChatEventEnum.NEW_CHAT_EVENT,
      payload
    );
  });

  return res
    .status(201)
    .json(new ApiResponse(201, payload[0], "Group chat created successfully"));
});

const getGroupChatDetails = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const chat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
        isGroupChat: true,
      },
    },
    ...commonChatAggregation(),
  ]);

  const groupChat = chat[0];

  if (!groupChat) {
    throw new ApiError(404, "Group chat does not exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, groupChat, "Group chat fetched"));
});

const renameGroupChat = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const { chatId } = req.params;

  if (!name) {
    throw new ApiError(401, "Please provide the name to change");
  }

  const chat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });

  if (!chat) {
    throw new ApiError(404, "Group chat does not exists");
  }

  if (chat.admin._id.toString() !== req.user._id.toString()) {
    throw new ApiError(401, "Only admin can change the group name");
  }

  const newChat = await Chat.findByIdAndUpdate(
    chat._id,
    {
      $set: {
        name,
      },
    },
    {
      new: true,
    }
  );

  const groupChat = await Chat.aggregate([
    {
      $match: {
        _id: newChat._id,
      },
    },
    ...commonChatAggregation(),
  ]);

  const payload = groupChat[0];

  if (!payload) {
    throw new ApiError(500, "Intrenal server error");
  }

  payload?.participants?.forEach((participant) => {
    if (participant._id.toString() === req.user._id.toString()) return;

    emitSocketEvent(
      req,
      participant._id.toString(),
      ChatEventEnum.UPDATE_GROUP_NAME_EVENT,
      payload
    );
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, payload, "Group chat name updated successfully")
    );
});

const deleteGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const groupChat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
        isGroupChat: true,
      },
    },
    ...commonChatAggregation(),
  ]);

  const chat = groupChat[0];

  if (!chat) {
    throw new ApiError(404, "Group chat does not exists");
  }

  if (chat.admin._id.toString() !== req.uesr._id.toString()) {
    throw new ApiError(400, "Only admin can delete a group chat");
  }

  await Chat.findByIdAndDelete(chatId);

  await deleteCascadeChatMessages(chatId);

  chat?.participants?.forEach((participant) => {
    if (participant._id.toString() === req.user._id.toString()) return;

    emitSocketEvent(
      req,
      participant._id.toString(),
      ChatEventEnum.LEAVE_CHAT_EVENT,
      chat
    );
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Group chat deleted successfully"));
});

const deleteOneOnOneChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
      },
    },
    ...commonChatAggregation(),
  ]);

  const payload = chat[0];

  if (!payload) {
    throw new ApiError(404, "Chat does not exists");
  }

  await Chat.deleteOne(chatId);
  await deleteCascadeChatMessages(chatId);

  const otherParticipant = payload?.participants?.find(
    (participant) => participant._id.toString() !== req.user._id.toString()
  );

  emitSocketEvent(
    req,
    otherParticipant._id.toString(),
    ChatEventEnum.LEAVE_CHAT_EVENT,
    payload
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Chat deleted successfully"));
});

const leaveGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  // Check if the chat is a groupChat
  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });

  if (!groupChat) {
    throw new ApiError(404, "Group chat does not found");
  }

  // verify the requesting user is part of that groupchat
  if (!groupChat.participants.includes(req.user._id)) {
    throw new ApiError(400, "You are not part of the group");
  }

  const chat = await Chat.findByIdAndUpdate(
    chatId,
    {
      // pull removes the requesting participant
      $pull: {
        participants: req.user._id,
      },
    },
    { new: true }
  );

  const updatedChat = await Chat.aggregate([
    {
      $match: {
        _id: chat._id,
      },
    },
    ...commonChatAggregation(),
  ]);

  const payload = updatedChat[0];

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, payload, "You left the group chat"));
});

const addNewParticipantInGroupChat = asyncHandler(async (req, res) => {
  const { chatId, participantId } = req.params;

  // find the chat
  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });

  if (!groupChat) {
    throw new ApiError(404, "Group chat does not found");
  }

  // only admins can add new participants
  if (groupChat.admin._id.toString() !== req.user._id.toString()) {
    throw new ApiError(400, "Only admin can add new members");
  }

  if (groupChat.participants.includes(participantId)) {
    throw new ApiError(400, "You are already in the group");
  }

  const updatedchat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: {
        participants: participantId,
      },
    },
    { new: true }
  );

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(updatedchat._id),
      },
    },
    ...commonChatAggregation(),
  ]);

  const payload = chat[0];

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  emitSocketEvent(req, participantId, ChatEventEnum.NEW_CHAT_EVENT, payload);

  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Participant added successfully"));
});

const removeParticipantFromGroupChat = asyncHandler(async (req, res) => {
  const { chatId, participantId } = req.params;

  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });

  if (!groupChat) {
    throw new ApiError(404, "Group chat does not found");
  }

  if (groupChat.admin._id.toString() !== req.user._id.toString()) {
    throw new ApiError(400, "Only admin can remove participants");
  }

  const currentParticipant = groupChat.participants;

  if (!currentParticipant.includes(participantId)) {
    throw new ApiError(400, "Participant is not in the group chat");
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        participants: participantId,
      },
    },
    { new: true }
  );

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: updatedChat._id,
      },
    },
    ...commonChatAggregation(),
  ]);

  const payload = chat[0];

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Participant removed successfully"));
});

const getAllChats = asyncHandler(async (req, res) => {
  const chat = await Chat.aggregate([
    {
      // get all the chat that matches our user._id
      $match: {
        participants: { $elemMatch: { $eq: req.user._id } },
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
    ...commonChatAggregation(),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, chat || [], "User chats fetched successfully!"));
});

export {
  createOrGetAOneOnOneChat,
  searchAvailableUser,
  createAGroupChat,
  getGroupChatDetails,
  renameGroupChat,
  deleteGroupChat,
  deleteOneOnOneChat,
  leaveGroupChat,
  addNewParticipantInGroupChat,
  removeParticipantFromGroupChat,
  getAllChats,
};
