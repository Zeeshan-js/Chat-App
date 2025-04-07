import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { getAllChats } from "./api/index.js";
import { requestHandler } from "./utils/index.js";
import { X } from "lucide-react";


function Chat({ chatId }) {
  const [word, setWord] = useState("");
  const [chats, setChats] = useState([]);

  const [loadingChats, setLoadingChats] = useState(false); // indicates chats are loading
  const [openAddChat, setOpenAddChat] = useState(false); // to control the add chat window

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

          {/* Add Participants to chat window */}
          {openAddChat && (
            <div className="w-1/3 h-1/3 bg-gray-700 border rounded-2xl absolute left-2/4 -translate-x-2/4">
              <X onClick={() => setOpenAddChat(!openAddChat)} className="absolute right-2 top-2 hover:text-red-500 transition hover:cursor-pointer"/>
                <div className="flex justify-center mt-4">
                  <input className="border text-xl p-1 rounded-2xl" type="text" />
                </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}

export default Chat;
