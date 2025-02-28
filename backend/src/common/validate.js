import { param, validationResult } from "express-validator" 
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

export const validate = (req, res, next) => {
    // this is a method to check for any errors in the request the use has sent
    const check = validationResult(req)
    // if there is no error we move to next validation
    if (check) {
        next()
    } else {
        const error = []
        check.array().map((ele) => error.push({ [ele.path]: ele.msg}))
    }

    // 422 code is for unprocessable entity
    throw new ApiError(422, "You are not authorized to perform this operation")
};

// This function checks the ID we extract from the params is valid or not
export const mongoIdPathVariableValidator = (IdName) => asyncHandler(async (req, res, next) => {
    return [
        param(IdName).notEmpty().isMongoId().withMessage(`Invalid ${IdName}`)
    ]
});
