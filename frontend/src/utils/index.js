const isBrowser =
  typeof window !== "undefined" && typeof localStorage !== "undefined";

// utility class to manage keys in local storage
export class LocalStorage {
  // get key from local storage
  static get(key) {
    if (!isBrowser) return;
    const value = localStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (error) {
        console.log("get storage",error)
        return null;
      }
    }
    return null;
  }

  // set a key with value in local storage
  static set(key, value) {
    if (!isBrowser) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  // remove a value from local storage by key
  static remove(key) {
    if (!isBrowser) return;
    localStorage.removeItem(key);
  }

  // clear all items from local storage
  static clear() {
    if (!isBrowser) return;
    localStorage.clear();
  }
}

// This utility function provides data about chat for group chat and single chat
// This function generated metadata for chat objects

export const getChatObjectMetadata = (chat, loggedInUser) => {
  // Determinie the content of the last message if there is any
  // If the last message contains only attachment, indicate its count
  const lastMessage = chat.lastMessage?.content
    ? chat.lastMessage?.content
    : chat.lastMessage
    ? `${chat.lastMessage?.attachment.length} attachment${chat.lastMessage?.attachment.length > 1 ? "s" : ""}` 
    : "No messages here yet";
  // Placeholder text if there are no messages

  if (chat.isGroupChat) {
    // Return metadata specific to groupchat
    return {
      avatar:
        "https://res.cloudinary.com/dtefwwyea/image/upload/v1744169019/raoy1ifof4bsa7be1s5a.jpg",
      title: chat.name,
      description: `${chat.participants.length} members in the chat`,
      lastMessage: chat.lastMessage
        ? chat.lastMessage?.sender.username + ":" + lastMessage
        : lastMessage,
    };
  } else {
    // Individual chat
    // Return metada to specific to group chat

    // Find the other participant of chat
    const participant = chat.participants.find(
      (p) => p._id !== loggedInUser?._id
    );
    return {
      avatar: participant?.avatar.url,
      title: participant?.username,
      description: participant?.email,
      lastMessage,
    };
  }
};


// A utility function to concatinate CSS class with proper spacing
export const className = (...className) => {
  return className.filter(Boolean).join(" ")
}

// Utility function to handle API request with loading, success and error handling
export const requestHandler = async (api, setLoading, onSuccess, onError) => {
  setLoading && setLoading(true);
  try {
    // Make the API request
    const response = await api();
    const { data } = response;
    if (data.success) {
      // Call the onSuccess function with response data
      onSuccess(data);
    }
  } catch (error) {
    // Handle error cases, including unauthorized and forbidden cases
    console.log("This is error", error);
    localStorage.clear();
    onError(error.message || "Something went wrong");
  } finally {
    if (setLoading) setLoading(false);
  }
};
