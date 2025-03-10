import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createAGroupChatValidator, updateGroupChatNameValidator, mongoIdPathVariableValidator, validate } from "../common/validate.js"

import { createAGroupChat, 
        deleteOneOnOneChat, 
        getAllChats, 
        leaveGroupChat, 
        searchAvailableUser, 
        renameGroupChat, 
        deleteGroupChat, 
        getGroupChatDetails,
        addNewParticipantInGroupChat,
        removeParticipantFromGroupChat,
    } from "../controllers/chat.controller.js"


const router = Router()

router.use(verifyJWT);

router.route("/").get(getAllChats);

router.route("/users").get(searchAvailableUser);

router.route("/group").post(createAGroupChatValidator(), validate, createAGroupChat);

router.route("/leave/group/:chatId").delete(mongoIdPathVariableValidator("chatId"), validate, leaveGroupChat);

router.route("/remove/:chatId").delete(mongoIdPathVariableValidator("chatId"), validate, deleteOneOnOneChat);

router
  .route("/group/:chatId")
  .get(mongoIdPathVariableValidator("chatId"), validate, getGroupChatDetails)
  .patch(
    mongoIdPathVariableValidator("chatId"),
    updateGroupChatNameValidator(),
    validate,
    renameGroupChat
  )
  .delete(mongoIdPathVariableValidator("chatId"), validate, deleteGroupChat);

  router
  .route("/group/:chatId/:participantId")
  .post(
    mongoIdPathVariableValidator("chatId"),
    mongoIdPathVariableValidator("participantId"),
    validate,
    addNewParticipantInGroupChat
  )
  .delete(
    mongoIdPathVariableValidator("chatId"),
    mongoIdPathVariableValidator("participantId"),
    validate,
    removeParticipantFromGroupChat
  );


export default router;