import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { cloudinaryUpload } from "../utils/cloudinary.js"
import { v2 as cloudinary } from "cloudinary"
import jwt from "jsonwebtoken"
import { UserRolesEnum } from "../constants.js"


const generateAccessAndRefreshToken = async function(userId) {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
    
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Someting went wrong while generating Access token and refresh token")
    }

}


const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body

    if ([username, email, password].some((val) => val?.trim() === '')) {
        throw new ApiError(400, "Please fill the required registeration details")
    }

    const userExists = await User.findOne({ email })

    if (userExists) {
        throw new ApiError(400, "User already exists")
    }

    let avatarLoacaPath;

    if (req.file) {
        avatarLoacaPath = req.file.path
    }

    const avatar = await cloudinaryUpload(avatarLoacaPath)


    const user = await User.create({
        username,
        email,
        password,
        avatar: avatar,
        role: role || UserRolesEnum.USER
    })

    const userCreated = await User.findById(user._id).select("-password -refreshToken")
    
    if (!userCreated) {
        throw new ApiError(500, "Couldn't register the user")
    }

    return res.status(200).json(
        new ApiResponse(200, { user: userCreated }, "User registered successfully")
    )
})

const userLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!(email && password)) {
        throw new ApiError(400, "Please enter email or password")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(404, "User does not exists")
    }

    const checkPassword = await user.isPasswordCorrect(password)

    if (!checkPassword) {
        throw new ApiError(400, "Password is incorrect")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    
    const loggedUser = await User.findById(user._id).select("-password -refresToken")

    
    if (!loggedUser) {
        throw new ApiError(500, "Server error occured 500")
    }
    

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken",accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(200, {user: loggedUser, accessToken, refreshToken}, "User successfully logged in")
    )

})

const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    const user = await User.findByIdAndUpdate(userId, {
        $unset: {
            refreshToken: 1
        }
    },
    {
        new: true
    }
)

    if (!user) {
        throw new ApiError(404, "Invalid user request")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {}, "User successfully logged out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingToken) {
        throw new ApiError(401, "Invalid token request")
    }

    const decodedToken = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET)

    if (!decodedToken) {
        throw new ApiError(400, "Invalid token")
    }

    const user = await User.findById(decodedToken?._id)

    if (!user) {
        throw new ApiError(401, "Invalid user request")
    }

    if (incomingToken !== user?.refreshToken) {
        throw new ApiError(401, "Token is invalid")
    }

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newRefreshToken, options)
    .json( new ApiResponse(200, { accessToken, refreshToken: newRefreshToken}, "Access token refreshed"))
})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    if (!oldPassword) {
        throw new ApiError(401, "Please enter the old Password first")
    }    

    const validatePassword = await user.isPasswordCorrect(oldPassword)

    if (!validatePassword) {
        throw new ApiError(401,"Invalid password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false})

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    )
})

const assignRole = asyncHandler(async (req, res) => {
    // change or assign roles to users
    const { role } = req.body
    const { userId } = req.params

    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(404, "User does not exits")
    }

    user.role = role
    user.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, {}, "Role changed for the user")
    )

})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id)
    const oldAvatar = user.avatar ? user.avatar.split("/").pop().split(".")[0] : null

    let updatedAvatarLocalPath = req.file?.path

    if (!updatedAvatarLocalPath) {
        throw new ApiError(404, "Avatar file is required to update")
    }

    const newAvatar = await cloudinaryUpload(updatedAvatarLocalPath)

    if (!newAvatar) {
        throw new ApiError(500, "Failed to upload new Avatar")
    }

    if (oldAvatar) {
        await cloudinary.uploader.destroy(oldAvatar)
    }

    const updatedUserAvatar = await User.findByIdAndUpdate(user._id, {
        $set: {
            avatar: {
                url: newAvatar,
                localPath: newAvatar
            }

        }
    },
    {
        new: true
    }
).select("-password")

    return res.status(200).json(new ApiResponse(200, updatedUserAvatar, "Avatar Changed successfully"))

})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { username, email } = req.body

    const userId = req.user?._id

    if (!(username || email)) {
        throw new ApiError(401, "Can't update empty fields")
    }

    const user = await User.findByIdAndUpdate(userId,{
        $set: {
            username,
            email: email
        }
    },
    {
        new: true
    }
    ).select("-password")

    return res.status(200).json(
        new ApiResponse(200, user, "Account details updated successfully")
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "Current user fetched")
    )
})



export { registerUser, userLogin, logoutUser, refreshAccessToken, assignRole, changePassword, updateUserAvatar, updateAccountDetails, getCurrentUser }