import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { mongoIdPathVariableValidator, validate } from "../common/validate.js";
import {
  getAllMessages,
  sendMessage,
  deleteMessage,
} from "../controllers/message.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/:chatId")
  .get(mongoIdPathVariableValidator("chatId"), validate, getAllMessages)
  .post(
    upload.fields([
      {
        name: "attachment",
        maxCount: 5,
      },
    ]),
    mongoIdPathVariableValidator("chatId"),
    validate,
    sendMessage
  );

router
  .route("/:chatId/:messageId")
  .delete(
    mongoIdPathVariableValidator("chatId"),
    mongoIdPathVariableValidator("messageId"),
    validate,
    deleteMessage
  );

export default router;
