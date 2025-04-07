import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { getAllChats, getAvailableUsers } from "./api/index.js";
import { requestHandler } from "./utils/index.js";
import { X } from "lucide-react";
import AddChatModel from "./components/chat/AddChatModel.jsx";


function Chat({ chatId }) {
  const [word, setWord] = useState("");
  const [chats, setChats] = useState([]);

  const [loadingChats, setLoadingChats] = useState(false); // indicates chats are loading
  const [openAddChat, setOpenAddChat] = useState(false); // to control the add chat window

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
    <AddChatModel
    open={openAddChat}
    onclose={() => {setOpenAddChat(false)}}
    onSuccess={() => {
      getChats()
    }}
    />
    <div className="h-screen w-full text-white bg-[#262629] relative flex items-center justify-center">
      <div className="w-2/3 h-2/3 border border-gray-600">
        <div className="w-1/3 h-full p-3 border-r border-gray-600">
          <h2 className="text-2xl font-bold">Chatters</h2>
          <div className="mt-3 flex gap-2">
            <input
              className="w-full border rounded-2xl pl-2 bg-gray-700"
              placeholder="Search chats"
              type="text"
            />
            <button onClick={() => setOpenAddChat(!openAddChat)} className="flex border p-2.5 bg-indigo-600 rounded-2xl hover:cursor-pointer hover:bg-indigo-700 transition">
              Add
              <Plus />
            </button>
          </div>
          <div>
            <ul>
              {chats.map((chat) => (
                <li key={chat._id}>{chat.name}</li>
              ))}
            </ul>
          </div>
          


        </div>
      </div>
    </div>
    </>
  );
}

export default Chat;
