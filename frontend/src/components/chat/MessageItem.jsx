import { Trash, X } from "lucide-react";
import { useState } from "react";
import { className } from "../../utils/index.js";
import { ArrowDownToLine, EllipsisVertical } from "lucide-react";
import moment from "moment";

const MessageItem = ({
  message,
  isOwnMessage,
  isGroupChatMessage,
  deleteChatMessage,
}) => {
  const [resizedImage, setResizedImage] = useState(null);
  const [openOptions, setOpenOptions] = useState(false);

  return (
    <div className="h-auto flex mb-5">
      {resizedImage ? (
        <div className="h-full relative">
          <X className="absolute top-3 right-3" />
          <img
            className="w-full h-full object-contain"
            src={resizedImage}
            alt=""
          />
        </div>
      ) : null}

      <div
        className={className(
          "flex justify-start items-end max-w-lg gap-3",
          isOwnMessage ? "ml-auto" : ""
        )}
      >
        <img
          className={className(
            "w-7 h-7 rounded-full object-cover flex flex-shrink-0",
            isOwnMessage ? "order-2" : ""
          )}
          src={message.sender?.avatar.url}
          alt=""
        />

        <div
          className={className(
            "rounded-2xl p-1 bg-gray-500",
            isOwnMessage ? "bg-indigo-500" : ""
          )}
        >
          {message.attachment.length > 0 ? (
            <div>
              {isOwnMessage && !message.content ? (
                <>
                  <button
                    onClick={() => setOpenOptions(!openOptions)}
                    className="relative group self-center p-1"
                  >
                    <EllipsisVertical className="group-hover:opacity-100 group-hover:w-6 w-0 opacity-0 cursor-pointer transition-all ease-in-out duration-100 text-zinc-300" />
                    <div
                      onMouseLeave={() => setOpenOptions(false)}
                      className={className(
                        "border rounded-xl text-left absolute z-30 hover:bg-blue-950 bg-gray-700 p-2",
                        openOptions ? "block" : "hidden"
                      )}
                    >
                      <p
                        onClick={(e) => {
                          e.stopPropagation();
                          const ok = confirm(
                            "Are you sure you want to delete message"
                          );
                          if (ok) {
                            deleteChatMessage(message);
                          }
                        }}
                        role="button"
                        className="flex gap-2 cursor-pointer"
                      >
                        Delete Message <Trash />
                      </p>
                    </div>
                  </button>
                </>
              ) : null}

              <div
                className={className(
                  "grid max-w-7xl gap-2",
                  message.attachment?.length === 1 ? "grid-cols-1" : "",
                  message.attachment?.length === 2 ? "grid-cols-2" : "",
                  message.attachment?.length >= 3 ? "grid-cols-3" : "",
                  message.content ? "mb-6" : ""
                )}
              >
                {message.attachment?.map((file) => {
                  return (
                    <div
                      key={file._id}
                      className={className(
                        "group p-1.5 aspect-square h-32 w-32 relative rounded-xl overflow-hidden cursor-pointer bg-gray-500",
                        isOwnMessage ? "bg-indigo-500" : ""
                      )}
                    >
                      <button
                        onClick={() => setResizedImage(file.url)}
                        className="absolute inset-0 z-20 flex justify-center items-center w-32 gap-2 h-32 bg-black/60 group-hover:opacity-100 opacity-0 transition-opacity ease-in-out duration-150"
                      >
                        <a
                          download
                          href={file.url}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ArrowDownToLine
                            title="download"
                            className="h-6 w-6 hover:text-zinc-400 text-white cursor-pointer"
                          />
                        </a>
                      </button>

                      <img
                        className="h-full w-full object-cover"
                        src={file.url}
                        alt="msg image"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {message.content ? (
            <>
              <div
                className={className(
                  "bg-gray-500 rounded-2xl items-center flex p-2",
                  isOwnMessage ? "bg-indigo-500" : ""
                )}
              >
                {isOwnMessage ? (
                  <>
                    <button
                      onClick={() => setOpenOptions(!openOptions)}
                      className="relative group self-center z-40 p-1"
                    >
                      <EllipsisVertical className="group-hover:opacity-100 group-hover:w-6 w-0 opacity-0 cursor-pointer transition-all ease-in-out duration-100 text-zinc-300" />
                      <div
                        onMouseLeave={() => setOpenOptions(false)}
                        className={className(
                          "border z-20 rounded-xl text-left -translate-x-24 absolute bottom-0 hover:bg-blue-950 bg-gray-700 p-2",
                          openOptions ? "block" : "hidden"
                        )}
                      >
                        <p
                          onClick={(e) => {
                            e.stopPropagation();
                            const ok = confirm(
                              "Are you sure you want to delete message"
                            );
                            if (ok) deleteChatMessage();
                          }}
                          className="flex items-center text-sm gap-2 cursor-pointer"
                          role="button"
                        >
                          Delete <Trash />
                        </p>
                      </div>
                    </button>
                  </>
                ) : null}
                <p>{message.content}</p>
              </div>
            </>
          ) : null}

          <p className={className("text-[10px] text-center")}>
            {moment(message.updatedAt).add("TIME_ZONE", "hours").fromNow(true)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
