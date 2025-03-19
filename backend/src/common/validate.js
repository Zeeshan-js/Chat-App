import { body, param, validationResult } from "express-validator" 
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

export const validate = (req, res, next) => {
    // this is a method to check for any errors in the request the use has sent
    const check = validationResult(req)
    // if there is no error we move to next validation
    if (check.isEmpty()) {
        return next()
    } else {
        const error = []
        check.array().map((ele) => error.push({ [ele.path]: ele.msg}))
    }

    // 422 code is for unprocessable entity
    throw new ApiError(422, "You are not authorized to perform this operation")
};

// This function checks the ID we extract from the params is valid or not
export const mongoIdPathVariableValidator = (IdName) => {
    return [
        param(IdName).notEmpty().isMongoId().withMessage(`Invalid ${IdName}`)
    ]
};


// Function to validate the min and max group members and to verify that there are menbers

export const createAGroupChatValidator = () => {
    return [
        body("name").trim().notEmpty().withMessage("Group name is required"),
        body("participants").isArray({
            min: 3,
            max: 100
        }).withMessage("Participants must be an array with more than 2 and less than 100 members")
    ]
}


// Function to verify the group name when the admin decides to change it

export const updateGroupChatNameValidator = () => {
    return [body("name").trim().notEmpty().withMessage("Group name is required")]
}


export const sendMessageValidator = () => {
    body("content").trim().optional().notEmpty().withMessage("Content is required")
}
