import { Pencil, X, UserRoundPlus, Trash2, Plus } from "lucide-react";
import {
  addNewParticipantsToGroup,
  changeGroupName,
  deleteGroup,
  getAvailableUsers,
  getGroupDetails,
  removeGroupParticipants,
} from "../../api/index.js";
import { Button, Dialog, Transition } from "@headlessui/react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  className,
  getChatObjectMetadata,
  requestHandler,
} from "../../utils/index.js";
import React, { Fragment, useEffect, useState } from "react";
import Select from "../Select.jsx";
import { UserGroupIcon } from "@heroicons/react/20/solid";

const GroupChatDetailsModal = ({ open, onClose, chatId, onGroupDelete }) => {
  // States to manage to the UI flag for adding a participant
  const { user } = useAuth();

  // State variable for current Group Chat
  const [groupChatDetails, setGroupChatDetails] = useState(null);

  // State variable for available users
  const [users, setUsers] = useState([]);

  //State to manage the UI flag of group name change
  const [changingGroupName, setChangingGroupName] = useState(false);

  // State to manage UI of adding new participants
  const [addingNewParticipants, setAddingNewParticipants] = useState(false);

  // Capture new Participants ID to add in group
  const [newParticipants, setNewParticipants] = useState("");

  // State variable to handle group chat name update
  const [newGroupChatName, setNewGroupChatName] = useState("");

  // Function to Rename group chat
  const handleGroupChatNameUpdate = async () => {
    // Check for new Group Chat name
    if (!newGroupChatName) return alert("New Group Chat name is required");

    requestHandler(
      async () => await changeGroupName(chatId, newGroupChatName),
      null,
      (res) => {
        const { data } = res;
        setGroupChatDetails(data); // Set the new group details
        setNewGroupChatName(data.name || "");
        setChangingGroupName(false);
        alert(`Group Chat name updated to ${data.name}`);
      },
      alert
    );
  };

  const deleteGroupChat = async () => {
    if (groupChatDetails?.admin !== user._id) {
      return alert("Only admin can delete the group");
    }

    requestHandler(
      async () => await deleteGroup(chatId),
      null,
      () => {
        onGroupDelete(chatId);
        handleClose();
      },
      alert
    );
  };

  // Function to get available Users
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

  // Function to add new participants to group
  const addNewParticipants = async () => {
    // Check if the request is made by admin
    if (groupChatDetails.admin !== user._id.toString()) {
      return alert("Only admin can add new participants");
    }

    if (!newParticipants) return alert("Please select the new group members");

    requestHandler(
      async () => await addNewParticipantsToGroup(chatId, newParticipants),
      null,
      (res) => {
        const { data } = res;
        const updatedGroupDetails = {
          ...groupChatDetails,
          participants: data.participants || [],
        };
        setGroupChatDetails(updatedGroupDetails);
        console.log("Group details :", groupChatDetails)
        alert("Participant added");
      },
      alert
    );
  };

  const removeParticipants = async (participantId) => {
    // Only admin can make this request
    if (groupChatDetails.admin !== user._id) {
      return alert("Only admin can remove participants");
    }

    requestHandler(
      async () => await removeGroupParticipants(chatId, participantId),
      null,
      () => {
        const updatedGroupDetails = {
          // copy the existing group details
          ...groupChatDetails,
          participants:
            (groupChatDetails?.participants &&
              groupChatDetails.participants.filter(
                (member) => member._id !== participantId
              )) ||
            [],
        };
        setGroupChatDetails(updatedGroupDetails);
        alert("Participant removed");
      },
      alert
    );
  };

  // function to get the group chat details
  const getGroupChatDetails = async () => {
    requestHandler(
      async () => await getGroupDetails(chatId),
      null,
      (res) => {
        const { data } = res;
        setGroupChatDetails(data);
        console.log(data);
        setNewGroupChatName(data.name);
      },
      alert
    );
  };

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    if (!open) return; // If the GroupChatDetailsModal is not open exit early

    getUsers();
    getGroupChatDetails();
  }, [open]);

  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={handleClose}>
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-500 sm-duration-700"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transform transition ease-in-out duration-500 sm-duration-700"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                    <div className="flex flex-col h-full overflow-y-scroll bg-gray-700 py-6 shadow-xl">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <div className="flex h-7 ml-3 items-center">
                            <button
                              className="relative rounded-md bg-gray-700 text-zinc-400 hover:text-zinc-500 focus:outline-none"
                              onClick={handleClose}
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">Close panel</span>
                              <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">
                        <div className="flex flex-col justify-center items-start">
                          <div className="flex justify-center items-center w-full h-max pl-12 relative gap-3">
                            {groupChatDetails?.participants
                              .slice(0, 3)
                              .map((p, i) => {
                                return (
                                  <img
                                    className="w-24 h-24 -ml-16 rounded-full outline-3 object-cover"
                                    key={p._id}
                                    src={p.avatar.url}
                                    alt="avatar"
                                  />
                                );
                              })}
                          </div>
                          <div className="w-full flex justify-center mt-3 items-center text-center">
                            {changingGroupName ? (
                              <div className="border border-zinc-300 rounded-2xl flex flex-col p-2 px-3">
                                <input
                                  className="focus:outline-none w-full text-white p-2 mb-2"
                                  value={newGroupChatName}
                                  onChange={(e) =>
                                    setNewGroupChatName(e.target.value)
                                  }
                                  placeholder="Enter new name"
                                  type="text"
                                />
                                <div className="flex gap-2">
                                  <button
                                    className="w-2/4 border rounded-xl p-1.5 hover:bg-gray-500 hover:text-white"
                                    onClick={() => setChangingGroupName(false)}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    className="w-2/4 bg-indigo-500 hover:bg-indigo-600 text-white p-1.5 rounded-xl"
                                    onClick={handleGroupChatNameUpdate}
                                  >
                                    Change
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-2xl font-bold text-white">
                                {groupChatDetails?.name}
                                <Pencil
                                  onClick={() => setChangingGroupName(true)}
                                  className="h-8 w-8 p-2 rounded-xl hover:bg-red-500"
                                />
                              </div>
                            )}
                          </div>
                          <div className="w-full mt-3 text-center">
                            {groupChatDetails?.participants &&
                            groupChatDetails?.participants.length > 3 ? (
                              <p>
                                Group. {groupChatDetails?.participants.length}{" "}
                                members
                              </p>
                            ) : null}
                          </div>
                          <div className="w-full py-4 mt-5 border-t border-gray-500">
                            <span className="flex items-center gap-2 text-white">
                              <UserGroupIcon className="h-8" />{" "}
                              {groupChatDetails?.participants.length} Members
                            </span>
                            <div>
                              {groupChatDetails?.participants.map((p) => (
                                <div
                                  className="flex justify-between items-center mt-3 px-4 py-3 rounded-2xl hover:bg-gray-500"
                                  key={p._id}
                                >
                                  <div className="flex items-center gap-2 text-white font-semibold">
                                    <img
                                      className="w-9 h-9 rounded-full object-cover"
                                      src={p.avatar.url || ""}
                                      alt="PP"
                                    />
                                    <p>
                                      {p.username}{" "}
                                      {groupChatDetails?.admin === p?._id ? (
                                        <span className="border border-green-400 text-green-400 text-sm p-1 rounded-2xl">
                                          admin
                                        </span>
                                      ) : null}
                                    </p>
                                  </div>
                                  {groupChatDetails.admin === user._id ? (
                                    <button
                                      className="p-1.5 rounded-xl bg-red-400 text-white hover:bg-red-500"
                                      onClick={() => removeParticipants(p._id)}
                                    >
                                      Remove
                                    </button>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="w-full border-t border-gray-500 pt-2">
                            <div className="mt-2">
                              <button
                                className="w-full h-10 mb-2 p-2 rounded-2xl bg-blue-500 text-white flex justify-center items-center gap-2 cursor-pointer"
                                onClick={() => setAddingNewParticipants(true)}
                              >
                                <UserRoundPlus /> Add Participants
                              </button>
                              <button onClick={deleteGroupChat} className="w-full h-10 p-2 rounded-2xl bg-red-400 text-white flex justify-center items-center gap-2 cursor-pointer">
                                <Trash2 /> Delete Group
                              </button>

                              {addingNewParticipants ? (
                                <div className="border border-zinc-300 p-2 rounded-2xl mt-3">
                                  <Select
                                    options={users.map((u) => {
                                      return {
                                        label: u.username,
                                        value: u._id,
                                      };
                                    })}
                                    value={newParticipants || ""}
                                    onChange={({ value }) => {
                                      if (
                                        groupChatDetails?.participants.includes(
                                          value
                                        )
                                      ) {
                                        return alert(
                                          "The user is already in the group"
                                        );
                                      } else {
                                        setNewParticipants(value);
                                      }
                                    }}
                                  />

                                  <div className="w-full flex gap-2">
                                    <button
                                      onClick={() =>
                                        setAddingNewParticipants(false)
                                      }
                                      className="w-2/4 p-1.5 border rounded-2xl hover:bg-gray-400 cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={addNewParticipants}
                                      className="flex justify-center items-center text-white bg-blue-500 w-2/4 rounded-2xl cursor-pointer"
                                    >
                                      <Plus /> Add
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default GroupChatDetailsModal;
