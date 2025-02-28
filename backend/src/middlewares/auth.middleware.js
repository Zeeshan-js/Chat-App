import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"


const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer ", "")
    
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid Access Token")
    }
})

const verifyPermission = (roles = []) => asyncHandler(async (req, res, next) => {
    if (!req.user?._id) {
        throw new ApiError(401, "Invalid request")
    }
    if (roles.includes(req.user?.role)) {
        next()
    } else {
        throw new ApiError(402, "You are not valid to perform this operation")
    }

})

export { verifyJWT, verifyPermission };