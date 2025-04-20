import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { getAllChats, getAvailableUsers } from "./api/index.js";
import { getChatObjectMetadata, requestHandler } from "./utils/index.js";
import AddChatModel from "./components/chat/AddChatModel.jsx";
import ChatItem from "./components/chat/ChatItem.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { Typing } from "./components/chat/Typing.jsx";

function Chat({ chatId }) {
  const [word, setWord] = useState("");
  const [chats, setChats] = useState([]);

  const [loadingChats, setLoadingChats] = useState(false); // indicates chats are loading
  const [openAddChat, setOpenAddChat] = useState(false); // to control the add chat window

  const { user, logout } = useAuth();

  // Initialize a reference
  const currentChat = useRef(null);

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

  useEffect(() => {
    getChats();
  }, []);

  return (
    <>
      <div className="h-screen w-full text-white bg-[#262629] relative flex items-center justify-center">
        <div className="w-2/3 h-2/3 border border-gray-600 rounded-2xl">
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
            <h2 className="text-2xl font-bold">Chatters</h2>
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
                        isActive={chat._id === currentChat.current?._id}
                        onDeleteChat={(c) => {
                          setChats((prev) =>
                            prev.filter((chatId) => chatId !== c)
                          );
                          if (currentChat.current?.id === c) {
                            currentChat.current = null;
                          }
                        }}
                      />
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
