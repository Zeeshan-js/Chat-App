import { body } from "express-validator"
import { AvailableRoles } from "../constants.js"



const userAssignRoleValidator = () => {
    return [
        body("role").optional().isIn(AvailableRoles).withMessage("Invalid user roel")
    ]
};


export { userAssignRoleValidator }