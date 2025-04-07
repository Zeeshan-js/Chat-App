import React, { useEffect, useState } from "react"
import { requestHandler } from "../../utils/index.js"
import { createOrGetAOneOnOneChat, searchAvailableUser } from "../../../../backend/src/controllers/chat.controller.js"
import { createGroupChat, createUserChat } from "../../api/index.js"




const AddChatModel = ({ open, onclose, onSuccess }) => {
    // initialize and empty array for available users
    const [users, setUsers] = useState([])

    // Group chat participants array
    const [groupParticipants, setGroupParticipants] = useState([])

    // State variable for selected user
    const [selectedUser, setSelectedUser] = useState(null)

    // Loading variable for chat cration
    const [createChat, setCreateChat] = useState(false)

    // Group chat name state variable
    const [groupChatName, setGroupChatName] = useState("")

    // Is our chat a group chat
    const [isGroupChat, setIsGroupChat] = useState(false)

    // Get the available users
    const getUsers = async () => {
        requestHandler(
            async () => await searchAvailableUser(),
            null,
            (res) => {
                const { data } = res
                setUsers(data || [])
            },
            alert
        )
    }

    // Create one on one chat
    const createNewChat = async () => {
        if (!selectedUser) return alert ("Please select a user")
        requestHandler(
            async () => await createUserChat(selectedUser),
            setCreateChat,
            (res) => {
                const { data } = res

                // check if the chat with user already exists
                if (data.success === 200) {
                    alert("Chat already exists")
                    return
                }
                onSuccess(data)
                handleClose()
            },
            alert
        )
    }

    const createNewGroupChat = async () => {
        // Check if a groupchat name is provided
        if (!groupChatName) alert ("Group chat name is required")

        if (!groupParticipants.length || groupParticipants.length < 2) {
            alert ("Group chat need at least two participants")
        } 

        requestHandler(
            // make the api call with the required info and data like participants
            async () => await createGroupChat({ name: groupChatName, participants: groupParticipants }),
            setCreateChat,
            (res) => {
                const { data } = res
                onSuccess(data)
                handleClose()
            },
            alert
        )
    }

    // Function to reset the Add chat window
    const handleClose = () => {
        // reset the users array
        setUsers([])
        // remove the selected user
        setSelectedUser("")
        // empty the groupchat participants array
        setGroupParticipants([])
        // reset the groupchat name
        setGroupChatName("")
        // Set the chat type to not be group chat
        setIsGroupChat(false)
        // Execute the onClose function 
        onclose()
    }


    useEffect(() => {
        // Check if the modal/dialogue is not open
        if (!open) return 

        getUsers()
    }, [open])
 

    return (
        <div>
            <div>

            </div>








            {openAddChat && (
            <div className="w-1/3 h-1/3 bg-gray-700 border rounded-2xl absolute left-2/4 -translate-x-2/4">
              <X onClick={() => setOpenAddChat(!openAddChat)} className="absolute right-2 top-2 hover:text-red-500 transition hover:cursor-pointer"/>
                <div className="flex justify-center mt-4">
                  <input className="border text-xl p-1 px-3 rounded-2xl" type="text" />
                </div>
            </div>
          )}
        </div>
    )


}

export default AddChatModel;