import axios from "axios";
import { useEffect, useState } from "react";
import { AwardIcon, Heading3, X } from "lucide-react";

function Chat() {
  const [toggle, setToggle] = useState(false);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredItem, setFilteredItem] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [chats, SetChats] = useState([]);
  const [query, setQuery] = useState("");
  const [word, setWord] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/v1/chat-app/chats/users", {});
        setUsers(response.data.data);
      } catch (error) {
        console.log("Error while fetching users :", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (query.trim() === "") {
      setFilteredItem([]);
    } else {
      const response = users.filter((item) =>
        item.username.toLowerCase().includes(query)
      );
      setFilteredItem(response);
    }
  }, [query]);

  const handleUsers = (userId) => {
    if (query.trim() === "") return;

    const user = users.find((item) => item._id === userId);

    if (participants.includes(user)) return;

    setParticipants((p) => [...p, user]);
    setFilteredItem([]);
  };

  const removeParticipant = (userId) => {
    const user = participants.filter((item) => item._id !== userId);
    setParticipants(user);
  };

  const createChat = async (receiverId) => {
    try {
      const response = await axios.post(
        `api/v1/chat-app/chats/c/${receiverId}`
      );
      getChats()
      setToggle(false)
    } catch (error) {
      console.log("Failed to create Chat :", error)
    }
  };

  const getChats = async () => {
    try {
      const response = await axios.get("api/v1/chat-app/chats")
      SetChats(response.data.data)
    } catch (error) {
      console.log("Chats Blasted :", error)
    }
  }

  useEffect(() => {
    getChats()
  }, [])

  return (
    <div className="h-full w-1/3 border-r p-3">
      <div>
        <h2 className="text-xl font-semibold text-white mb-3">Chat-app</h2>
        <div className="flex gap-2">
          <input
            className="text-white border w-full rounded-2xl p-2"
            type="text"
            placeholder="Search User or Group"
          />
          <button
            onClick={() => setToggle(!toggle)}
            className="border text-green-400 border-green-400 rounded-2xl p-1 hover:bg-green-400 hover:text-white transition cursor-pointer"
          >
            Add Chat
          </button>

          {toggle ? (
            <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
              <div className="min-h-5/12 w-1/3 p-3 overflow-auto relative border bg-[#21273D]">
                <X
                  className="h-8 w-8 p-1 absolute right-3 top-2 rounded-full cursor-pointer hover:bg-gray-600"
                  onClick={() => setToggle(false)}
                />

                <div className="flex my-4 gap-3 justify-center items-center">
                  <label className="flex flex-col items-center justify-center gap-1 cursor-pointer">
                    <input
                      onChange={() => setIsGroupChat(!isGroupChat)}
                      type="checkbox"
                      value=""
                      className="sr-only peer"
                    />
                    <div
                      className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer
                     dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                     peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                     after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full 
                     after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600
                     dark:peer-checked:bg-blue-600"
                    ></div>
                    <span className="ms-3 text-xs font-medium text-gray-900 dark:text-gray-300">
                      Group Chat
                    </span>
                  </label>

                  <div className="flex flex-col">
                    <input
                      className="text-white border rounded-lg pl-2 p-2"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      type="text"
                    />

                    {isGroupChat && (
                      <input
                        className="text-white border rounded-lg pl-2 p-2 absolute top-24"
                        value={word}
                        onChange={(e) => setWord(e.target.value)}
                        type="text"
                        placeholder="Group-chat name"
                      />
                    )}
                  </div>

                  <button
                    onClick={() => createChat(participants.map((p) => p._id))}
                    className="border p-2 rounded-lg border-green-600 text-green-600 hover:bg-green-500 hover:text-white transition cursor-pointer"
                  >
                    Create Chat
                  </button>
                </div>

                {filteredItem.length > 0 && (
                  <ul className="absolute w-2/4 h-1/3 overflow-auto scrollbar-hidden left-2/4 -translate-x-2/4">
                    {filteredItem.map((item) => (
                      <li
                        className="border p-2 m-1 rounded-lg bg-gray-500 cursor-pointer"
                        onClick={() => handleUsers(item._id)}
                        key={item._id}
                      >
                        {item.username}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="w-full absolute border-t left-0 bottom-8">
                  <p className="text-white p-3">Participants</p>
                  <div className="pl-1.5 flex gap-2">
                    {participants.map((participant) => (
                      <div
                        className="flex gap-2 items-center justify-between p-2 text-white border border-black h-9 w-fit rounded-2xl"
                        key={participant._id}
                      >
                        {" "}
                        {participant.username}{" "}
                        <X
                          onClick={() => removeParticipant(participant._id)}
                          className="h-5 w-5 cursor-pointer hover:text-red-500 transition"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <ul>
            {chats.map((chat, index) => (
              <li
              className="p-2 mt-3 rounded-lg hover:bg-gray-600 cursor-pointer" 
              key={index}>
                <div className="flex gap-2 items-center">
                  
                  {chat.name}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Chat;
