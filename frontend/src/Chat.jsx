import { useEffect, useRef, useState } from "react";
import {
  Plus,
  SendHorizontal,
  Paperclip,
  XCircleIcon,
  CircleX,
  Power,
} from "lucide-react";
import {
  changeGroupName,
  deleteChatMessage,
  getAllChats,
  getAvailableUsers,
  getChatMessage,
  sendMessageToChat,
} from "./api/index.js";
import {
  className,
  getChatObjectMetadata,
  LocalStorage,
  requestHandler,
} from "./utils/index.js";
import AddChatModel from "./components/chat/AddChatModel.jsx";
import ChatItem from "./components/chat/ChatItem.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { Typing } from "./components/chat/Typing.jsx";
import { useSocket } from "./context/SocketContext.jsx";
import MessageItem from "./components/chat/MessageItem.jsx";
import Loader from "./components/Loader.jsx";

const TYPING_EVENT = "typing";
const STOP_TYPING_EVENT = "stopTyping";
const CONNECTED_EVENT = "connected";
const DISCONNECT_EVENT = "disconnect";
const JOIN_CHAT_EVENT = "joinChat";
const NEW_CHAT_EVENT = "newChat";
const LEAVE_CHAT_EVENT = "leaveChat";
const MESSAGE_RECEIVED_EVENT = "messageReceived";
const MESSAGE_DELETE_EVENT = "messageDeleted";
const UPDATE_GROUP_NAME_EVENT = "updateGroupName";

function Chat() {
  const [word, setWord] = useState("");

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]); // Array for messages of the chat
  const [unreadMessages, setUnreadMessages] = useState([]); // For unread messages
  const [attachedFile, setAttachedFile] = useState([]); // for attachments like phots

  const [isConnected, setIsConnected] = useState(false); // to keep track of socket connection
  const [loadingChats, setLoadingChats] = useState(false); // indicates chats are loading
  const [openAddChat, setOpenAddChat] = useState(false); // to control the add chat window
  const [isTyping, setIsTyping] = useState(false); // to keep track if user is still typing
  const [selfTyping, setSelfTyping] = useState(false); // to let the server know if I am typing
  const [loadingMessages, setLoadingMessages] = useState(false); // state to handle message loading

  const [message, setMessage] = useState("");

  const { user, logout } = useAuth();
  const { socket } = useSocket();

  // Initialize a reference
  const currentChat = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get all the chats that you are a part of
  const getChats = async () => {
    requestHandler(
      async () => await getAllChats(),
      setLoadingChats,
      (res) => {
        const { data } = res;
        setChats(data || []);
      },
      alert
    );
  };

  const onConnect = () => {
    setIsConnected(true);
  };

  const onDisconnect = () => {
    setIsConnected(false);
  };

  const updateChatLastMessage = (chatToUpdate, message) => {
    // Find the chat with chatId
    const chatUpdate = chats.find((chat) => chat?._id === chatToUpdate);

    // update the last message with the new one
    chatUpdate.lastMessage = message;

    // update the updatedAt
    chatUpdate.updatedAt = message?.updatedAt;

    setChats([
      chatUpdate,
      ...chats.filter((chat) => chat._id !== chatToUpdate),
    ]);
  };

  // function to update chats specifically on deletion of message
  const updateChatLastMessageDeletion = (chatId, message) => {
    const chatUpdate = chats.find((chat) => chat._id === chatId);

    // update the lastMessage of chat only in case if the ID of both message and chat matches
    if (chatUpdate.lastMessage._id === message._id) {
      requestHandler(
        async () => getChatMessage(chatId),
        null,
        (res) => {
          const { data } = res;
          chatUpdate.lastMessage = data[0];
          setChats([...chats]);
        },
        alert
      );
    }
  };

  const getMessages = async () => {
    // check for the current chat
    if (!currentChat.current?._id) return alert("No chat is selected");

    // check for the socket connection
    if (!socket) return alert("Socket is not connected");

    socket.emit(CONNECTED_EVENT, currentChat.current?._id);

    setUnreadMessages(
      unreadMessages.filter((m) => m.chat !== currentChat.current?._id)
    );

    requestHandler(
      async () => await getChatMessage(currentChat.current?._id || ""),
      setLoadingMessages,
      (res) => {
        const { data } = res;
        setMessages(data || []);
      },
      alert
    );
  };

  // Function to send a message to chat
  const sendChatMessage = () => {
    // if no current chat or socket then return
    if (!currentChat.current?._id || !socket) return;

    // emit the stop typing event
    socket.emit(STOP_TYPING_EVENT, currentChat.current?._id);

    requestHandler(
      async () =>
        await sendMessageToChat(
          currentChat.current?._id || "",
          message,
          attachedFile
        ),
      null,
      (res) => {
        const { data } = res;
        setMessage("");
        setAttachedFile([]);
        setMessages((prev) => [data, ...prev]);
        updateChatLastMessage(currentChat.current?._id || "", data);
      },
      alert
    );
  };

  const deleteMessage = (message) => {
    requestHandler(
      async () =>
        await deleteChatMessage(currentChat.current?._id, message._id),
      null,
      (res) => {
        const { data } = res;
        setMessages((prev) => prev.filter((mess) => mess._id !== data._id));
        updateChatLastMessageDeletion(currentChat.current._id, message._id);
      }
    );
  };

  const handleOnMessageChange = (e) => {
    // set the Message to target value
    setMessage(e.target.value);

    // check for socket connection or if socket is already connected
    if (!socket || !isConnected) return;

    if (!selfTyping) {
      setSelfTyping(true);
      // emit a typing event
      socket.emit(TYPING_EVENT, currentChat.current._id);
    }

    // clear the previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const timeout = 3000;

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit(STOP_TYPING_EVENT, currentChat.current?._id);
      setSelfTyping(false);
    }, timeout);
  };

  const onMessageReceived = (message) => {
    // check if the current chat is also the chat we are in
    if (message.chat !== currentChat.current?._id) {
      // if yes update the unread messages
      setUnreadMessages((prev) => [message, ...prev]);
    } else {
      // if not update the message
      setMessages((prev) => [message, ...prev]);
    }

    // update the last message for the chat to which the received message belongs
    updateChatLastMessage(message.chat || "", message);
  };

  const onMessageDelete = (msg) => {
    if (msg.chat !== currentChat.current?._id) {
      setUnreadMessages((prev) => prev.filter((p) => p._id !== msg._id));
    } else {
      setMessages((prev) => prev.filter((p) => p._id !== msg._id));
    }

    updateChatLastMessageDeletion(msg.chat, msg);
  };

  // This function handles the event when a user leaves a chat
  const onChatLeave = (chat) => {
    // check if the user is in the current chat
    if (chat._id === currentChat.current?._id) {
      // if yes then set the current chat to null
      currentChat.current = null;
      LocalStorage.remove("currentChat");
    }

    console.log("Chat is deleted");
    // update the chats by removing the chat that the user left
    setChats((prev) => prev.filter((c) => c._id !== chat._id));
  };

  const handleOnSocketTyping = (chatId) => {
    // check if the typing effect is emitting on current chat
    if (chatId !== currentChat.current?._id) return;

    // Set the typing state to true for the current chat
    setIsTyping(true);
  };

  const handleOnSocketStopTyping = (chatId) => {
    // check if the typing effect is emitting on current chat
    if (chatId !== currentChat.current?._id) return;

    // Set the typing state to true for the current chat
    setIsTyping(false);
  };

  const onNewChat = (chat) => {
    setChats((prev) => [chat, ...prev]);
  };

  const onGroupChatNameUpdate = (chat) => {
    // check if the chat is the current chat
    if (chat._id === currentChat.current?._id) {
      currentChat.current = chat;
      LocalStorage.set("currentChat", chat);
    }
    setChats(
      chats.map((prev) =>
        prev.map((chat) => {
          if (c._id === chat._id) {
            return chat._id;
          }
          return c;
        })
      )
    );
  };

  useEffect(() => {
    getChats();

    const _current = LocalStorage.get("currentChat");

    if (_current) {
      currentChat.current = _current;

      socket?.emit(JOIN_CHAT_EVENT, currentChat.current?._id);

      getMessages();
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Listener for when the socket connects
    socket.on(CONNECTED_EVENT, onConnect);
    // Listener for when the socket gets disconnected
    socket.on(DISCONNECT_EVENT, onDisconnect);
    // Listener for when a user is tying
    socket.on(TYPING_EVENT, handleOnSocketTyping);
    // Listener for when a user stops typing
    socket.on(STOP_TYPING_EVENT, handleOnSocketStopTyping);
    // Listener for when a user leaves a chat
    socket.on(LEAVE_CHAT_EVENT, onChatLeave);
    // Listener for when a new message is received
    socket.on(MESSAGE_RECEIVED_EVENT, onMessageReceived);
    // Listener for when a user initiate a new chat
    socket.on(NEW_CHAT_EVENT, onNewChat);
    // Listener for when a message is deleted
    socket.on(MESSAGE_DELETE_EVENT, onMessageDelete);
    // Listener for when group chat name updates
    socket.on(UPDATE_GROUP_NAME_EVENT, onGroupChatNameUpdate);

    return () => {
      // remove all the event we set up to avoid memory leaks and unintented behavious
      socket.off(CONNECTED_EVENT, onConnect);
      socket.off(DISCONNECT_EVENT, onDisconnect);
      socket.off(TYPING_EVENT, handleOnSocketTyping);
      socket.off(STOP_TYPING_EVENT, handleOnSocketStopTyping);
      socket.off(MESSAGE_RECEIVED_EVENT, onMessageReceived);
      socket.off(NEW_CHAT_EVENT, onNewChat);
      socket.off(LEAVE_CHAT_EVENT, onChatLeave);
      socket.off(MESSAGE_DELETE_EVENT, onMessageDelete);
      socket.off(UPDATE_GROUP_NAME_EVENT, onGroupChatNameUpdate);
    };
  }, [socket, chats]);

  return (
    <>
      <div className="h-screen w-full text-white bg-[#262629] flex items-center justify-center">
        <div className="w-2/3 h-2/3 flex border border-gray-600 rounded-2xl">
          {openAddChat ? (
            <AddChatModel
              open={openAddChat}
              onclose={() => {
                setOpenAddChat(false);
              }}
              onSuccess={() => {
                getChats();
              }}
            />
          ) : null}

          <div className="w-1/3 h-full p-3 border-r border-gray-700/40">
            <div className="flex items-center text-center justify-between pb-1">
              <h2 className="text-2xl font-bold">Chatters</h2>
              <Power
                className="hover:text-red-500 transition cursor-pointer"
                onClick={() => {
                  const ok = confirm("Are you sure you want to logout");
                  if (ok) {
                    logout();
                  }
                }}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <input
                className="w-full border rounded-2xl pl-2 bg-black/20"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Search chats"
                type="text"
              />
              <button
                onClick={() => setOpenAddChat(true)}
                className="flex border p-2.5 bg-indigo-600 rounded-2xl hover:cursor-pointer hover:bg-indigo-700 transition"
              >
                Add
                <Plus />
              </button>
            </div>
            <div className="mt-4">
              {loadingChats ? (
                <div>
                  <Typing />
                </div>
              ) : (
                [...chats]
                  .filter((c) =>
                    word
                      ? getChatObjectMetadata(c, user)
                          .title.toLowerCase()
                          .includes(word)
                      : true
                  )
                  .map((chat) => {
                    return (
                      <ChatItem
                        key={chat._id}
                        chat={chat}
                        onClick={(chat) => {
                          if (
                            currentChat.current?._id &&
                            currentChat.current?._id === chat._id
                          )
                            return;
                          LocalStorage.set("currentChat", chat);
                          currentChat.current = chat;
                          setMessage("");
                          getMessages();
                        }}
                        isActive={chat._id === currentChat.current?._id}
                        unreadCount={
                          unreadMessages.filter(
                            (mess) => mess.chat === chat._id
                          ).length
                        }
                        onDeleteChat={(c) => {
                          setChats((prev) =>
                            prev.filter((chat) => chat._id !== c)
                          );
                          if (currentChat.current?.id === c) {
                            currentChat.current = null;
                            LocalStorage.remove("currentChat");
                          }
                        }}
                      />
                    );
                  })
              )}
            </div>
          </div>

          <div className="w-full h-full relative p-2">
            <div
              className={className(
                "p-4 flex flex-col-reverse overflow-y-auto",
                attachedFile.length > 0
                  ? "h-[calc(100%-50px)]"
                  : "h-[calc(100%-70px)]"
              )}
            >
              {loadingMessages ? (
                <Loader />
              ) : (
                <>
                  {isTyping ? (
                    <div>
                      <Typing />
                    </div>
                  ) : null}
                  {messages.map((mess) => {
                    return (
                      <MessageItem
                        key={mess._id}
                        message={mess}
                        isOwnMessage={mess.sender?._id === user._id}
                        isGroupChatMessage={currentChat.current?.isGroupChat}
                        deleteChatMessage={() => deleteMessage(mess)}
                      />
                    );
                  })}
                </>
              )}
            </div>

            {attachedFile.length > 0
              ? attachedFile.map((file, i) => {
                  return (
                    <div
                      key={i}
                      className="w-32 h-32 group relative aspect-square rounded-xl cursor-pointer"
                    >
                      <div className="w-full h-full absolute z-20 -top-[140px] left-2/4 inset-0 flex justify-center items-center bg-black/40 group-hover:opacity-100 opacity-0 transition-opacity ease-in-out duration-150">
                        <button
                          className="absolute -top-2 -right-2"
                          onClick={() => {
                            setAttachedFile(
                              attachedFile.filter((_, ind) => ind !== i)
                            );
                          }}
                        >
                          <CircleX className="h-6 w-6 border text-white" />
                        </button>
                      </div>
                      <img
                        className="w-full h-full absolute z-0 -top-[140px] left-2/4 object-cover rounded-xl"
                        src={URL.createObjectURL(file)}
                        alt="attachment"
                      />
                    </div>
                  );
                })
              : null}
            {currentChat.current === null ? null : (
              <div className="flex absolute justify-center items-center bottom-2 left-0 w-full p-2 gap-2">
                <input
                  value=""
                  max={5}
                  onChange={(e) => {
                    if (e.target.files) {
                      setAttachedFile([...e.target.files]);
                      console.log("Changed")
                    }
                  }}
                  id="photo"
                  type="file"
                  className="hidden"
                />
                <label htmlFor="photo">
                  <Paperclip className="p-2 h-10 w-10 text-indigo-400 hover:bg-gray-600 rounded-2xl hover:cursor-pointer" />
                </label>
                <input
                  className="w-full bg-gray-700 pl-3 rounded-2xl p-2 text-lg"
                  value={message}
                  onChange={handleOnMessageChange}
                  onKeyDown={(e) => {
                    if (message.trim() !== "") {
                      if (e.key === "Enter") {
                        sendChatMessage();
                      }
                    }
                    return;
                  }}
                  type="text"
                  placeholder="Write a message"
                />
                <SendHorizontal
                  onClick={sendChatMessage}
                  className="p-2 h-11 w-11 text-white bg-indigo-600 rounded-2xl hover:cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
