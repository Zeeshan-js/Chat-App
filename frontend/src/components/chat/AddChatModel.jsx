import React, { useEffect, useState } from "react";
import { requestHandler } from "../../utils/index.js";
import { Switch } from "@headlessui/react";
import Select from "../Select.jsx";
import {
  createGroupChat,
  createUserChat,
  getAvailableUsers,
} from "../../api/index.js";
import { X, Users } from "lucide-react";

const AddChatModel = ({ open, onclose, onSuccess }) => {
  // initialize and empty array for available users
  const [users, setUsers] = useState([]);

  // Group chat participants array
  const [groupParticipants, setGroupParticipants] = useState([]);

  // State variable for selected user
  const [selectedUser, setSelectedUser] = useState(null);

  // Loading variable for chat cration
  const [createChat, setCreateChat] = useState(false);

  // Group chat name state variable
  const [groupChatName, setGroupChatName] = useState("");

  // Is our chat a group chat
  const [isGroupChat, setIsGroupChat] = useState(false);

  // Get the available users
  const getUsers = async () => {
    requestHandler(
      async () => await getAvailableUsers(),
      null,
      (res) => {
        const { data } = res;
        setUsers(data || []);
      },
      alert
    );
  };

  // Create one on one chat
  const createNewChat = async () => {
    if (!selectedUser) return alert("Please select a user");
    requestHandler(
      async () => await createUserChat(selectedUser),
      setCreateChat,
      (res) => {
        const { data } = res;

        // check if the chat with user already exists
        if (data.success === 200) {
          alert("Chat already exists");
          return;
        }
        onSuccess(data);
        handleClose();
      },
      alert
    );
  };

  const createNewGroupChat = async () => {
    // Check if a groupchat name is provided
    if (!groupChatName) alert("Group chat name is required");

    if (!groupParticipants.length || groupParticipants.length < 2) {
      alert("Group chat need at least two participants");
    }

    requestHandler(
      // make the api call with the required info and data like participants
      async () =>
        await createGroupChat({
          name: groupChatName,
          participants: groupParticipants,
        }),
      setCreateChat,
      (res) => {
        const { data } = res;
        onSuccess(data);
        handleClose();
      },
      alert
    );
  };

  // Function to reset the Add chat window
  const handleClose = () => {
    // reset the users array
    setUsers([]);
    // remove the selected user
    setSelectedUser("");
    // empty the groupchat participants array
    setGroupParticipants([]);
    // reset the groupchat name
    setGroupChatName("");
    // Set the chat type to not be group chat
    setIsGroupChat(false);
    // Execute the onClose function
    onclose();
  };

  useEffect(() => {
    // Check if the modal/dialogue is not open
    if (!open) return;

    getUsers();
  }, [open]);

  return (
    <div className="w-2/6 border border-gray-400 rounded-2xl bg-black/35 fixed z-20 left-2/4 top-1/3 -translate-x-2/4">
      <div className="relative h-full p-4 pt-10 text-center sm:items-start">
        <X
          onClick={onclose}
          className="absolute right-2.5 top-2 hover:text-red-500 cursor-pointer transition"
        />
        <div className="flex gap-4 mb-3">
          <Switch
            checked={isGroupChat}
            onChange={setIsGroupChat}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition data-[checked]:bg-green-600"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
          </Switch>
          <p>Group Chat</p>
        </div>
        {isGroupChat ? (
          <>
            <input
              className="w-full p-1.5 rounded-lg bg-white/5 focus:outline-none"
              type="text"
              value={groupChatName}
              onChange={(e) => setGroupChatName(e.target.value)}
              placeholder="Group's name"
            />
          </>
        ) : null}
        <Select
          options={users.map((user) => {
            return {
              label: user.username,
              value: user._id,
            };
          })}
          value={isGroupChat ? "" : selectedUser || ""}
          onChange={({ value }) => {
            // check if its a group chat and every Participant is different
            if (isGroupChat && !groupParticipants.includes(value)) {
              // if it is then store the users in groupchat array
              setGroupParticipants([...groupParticipants, value]);
            } else {
              // if not then reference it to selected user
              setSelectedUser(value);
            }
          }}
        />
        {isGroupChat ? (
          <div className="my-2">
            <div className="flex items-center gap-2">
            <Users className="h-5" />
            <p className="text-zinc-300 text-start font-semibold">
              Selected particiapnts
            </p>
            </div>
            <div className="flex gap-2 my-3">
              {users
                .filter((user) => groupParticipants.includes(user._id))
                ?.map((participants) => {
                  return (
                    <div
                      className="w-fit p-1 border flex items-center rounded-2xl gap-2"
                      key={participants._id}
                    >
                      <img
                        className="h-6 w-6 rounded-full object-cover"
                        src={participants.avatar.url}
                        alt=""
                      />
                      <p>{participants.username}</p>
                      <X
                        onClick={(e) =>
                          setGroupParticipants(
                            groupParticipants.filter(
                              (value) => value !== participants._id
                            )
                          )
                        }
                        className="h-4 w-4 cursor-pointer hover:text-red-500 transition"
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        ) : null}
        <div className="flex gap-3 z-0">
          <button
            onClick={onclose}
            className="border p-2 w-2/4 rounded-3xl cursor-pointer hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={isGroupChat ? createNewGroupChat : createNewChat}
            className="border w-2/4 rounded-3xl cursor-pointer bg-indigo-600 hover:bg-indigo-500"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddChatModel;
