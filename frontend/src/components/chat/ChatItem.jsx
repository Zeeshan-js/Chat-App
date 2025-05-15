import { useAuth } from "../../context/AuthContext.jsx";
import { useState } from "react";
import {
  className,
  getChatObjectMetadata,
  requestHandler,
} from "../../utils/index.js";
import { deleteOneOnOneChat } from "../../api/index.js";
import { EllipsisVertical, Info, Trash2 } from "lucide-react";
import GroupChatDetailsModal from "./GroupChatDetailsModal.jsx";

const ChatItem = ({
  chat,
  onClick,
  isActive,
  unreadCount = 0,
  onDeleteChat,
}) => {
  const { user } = useAuth();
  const [openOptions, setOpenOptions] = useState(false);
  const [openGroupInfo, setOpenGroupInfo] = useState(false);

  // Define a asynchronous function deleteChat
  const deleteChat = async () => {
    requestHandler(
      async () => await deleteOneOnOneChat(chat._id),
      null,
      () => {
        onDeleteChat(chat._id);
      },
      alert
    );
  };

  if (!chat) return
  return (
    <>
      {openGroupInfo ? (<GroupChatDetailsModal
        open={openGroupInfo}
        onClose={() => {
          setOpenGroupInfo(false);
        }}
        chatId={chat._id}
        onGroupDelete={onDeleteChat}
      />) : null}
      <div
        onClick={() => onClick(chat)}
        onMouseLeave={() => setOpenOptions(false)}
        className={className(
          "flex items-center gap-3 group cursor-pointer hover:bg-gray-600 rounded-2xl p-1 pr-3 mb-1",
          isActive ? "border-[1px] border-zinc-500 bg-gray-800" : "",
          unreadCount > 0 ? "border-[1px] border-green-500 bg-gray-800" : ""
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenOptions(!openOptions);
          }}
          className={className("self-center p-1 relative")}
        >
          <EllipsisVertical className="h-6 group-hover:w-6 group-hover:opacity-100 w-0 opacity-0 transition-all ease-in-out duration-100 text-zinc-300" />
          <div
            className={className(
              "flex items-center gap-1.5 z-20 text-left absolute bottom-0 translate-y-full text-sm w-52 p-2 rounded-2xl bg-gray-800",
              openOptions ? "block" : "hidden"
            )}
          >
            {chat.isGroupChat ? (
              <p
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenGroupInfo(true);
                }}
                role="button"
                className="font-semibold p-3 inline-flex items-center rounded-lg w-full hover:bg-gray-900"
              >
                <Info className="h-4 w-4 mr-2" />
                About Group
              </p>
            ) : (
              <p
                onClick={(e) => {
                  e.stopPropagation();
                  const ok = confirm(
                    "Are you sure you want to delete this chat"
                  );
                  if (ok) {
                    deleteChat();
                  }
                }}
                role="button"
                className="inline-flex p-3 w-full font-semibold items-center rounded-lg hover:bg-gray-900"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Delete Chat
              </p>
            )}
          </div>
        </button>
        <div>
          {chat.isGroupChat ? (
            <div className="w-12 h-12 relative flex flex-nowrap justify-start items-center flex-shrink-0">
              {chat.participants.slice(0, 3).map((user, i) => {
                return (
                  <img
                    key={user._id } 
                    className={className(
                      "w-8 h-8 border-[1px] border-white rounded-full absolute outline-1 object-cover outline-dark group-hover:outline-secondary",
                      i === 0
                        ? "left-0 z-[3]"
                        : i === 1
                        ? "left-2.5 z-[2]"
                        : i === 2
                        ? "left-[18px] z-[1]"
                        : ""
                    )}
                    src={user.avatar.url}
                    alt=""
                  />
                );
              })}
            </div>
          ) : (
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={getChatObjectMetadata(chat, user).avatar}
              alt=""
            />
          )}
        </div>
        <div>
          <p className="truncate-1">
            {getChatObjectMetadata(chat, user).title}
          </p>
        </div>
        {unreadCount <= 0 ? null : (
          <div className="w-2 h-2 p-2 inline-flex text-xs ml-auto justify-center items-center rounded-full bg-green-500 ">
          <span>
            {unreadCount.length > 9 ? "9+" : unreadCount}
          </span>
        </div>
        )}
      </div>
    </>
  );
};

export default ChatItem;
