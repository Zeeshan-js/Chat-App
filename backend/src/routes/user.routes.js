import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, verifyPermission } from "../middlewares/auth.middleware.js";
import { UserRolesEnum } from "../constants.js";
import { mongoIdPathVariableValidator, validate } from "../common/validate.js";
import { userAssignRoleValidator } from "../common/user.validate.js";
import {
  registerUser,
  logoutUser,
  userLogin,
  updateUserAvatar,
  changePassword,
  updateAccountDetails,
  assignRole,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(userLogin);

// secured routes
// secured routes means the user needs to be logged in to perform these operations
router.route("/logout").post(verifyJWT, logoutUser);

router
  .route("/assign-role/:userId")
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator("userId"),
    userAssignRoleValidator,
    validate,
    assignRole
  );

router.route("/change-password").post(verifyJWT, changePassword);
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

export default router;
