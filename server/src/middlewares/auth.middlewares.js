import {ApiError} from "../utils/ApiError"
import jwt from "jsonwebtoken"
import {User} from "../models/User"
import {asyncHandler} from "../utils/asyncHandler"

export const verifyJWT = asyncHandler(async (req, res, next)=>{
    const token = req.cookies?.accesToken || req.header("Authorization")?.split(" ")[1]

    if(!token)
    {
        throw new ApiError(401, "Unauthorized request!")
    }

    try{

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationToken -emailVerificationExpiry"

        )

        if(!user)
        {
            throw new ApiError(401, "Invalid token")
        }

        req.user = user

        next()


    }catch(error){
        throw new ApiError(401, error?.message || "Invalid token")
    }
})


export const setFromTokenOrIgnore = asyncHandler(async (req, res, next)=>{

    const token = req.cookies?.accesToken || req.header("Authorization")?.split(" ")[1]

    try{
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await findById(decodedToken?._id).select(
            "-password -refreshToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationToken -emailVerificationExpiry"

        )

        req.user = user;
        next()
    }catch(error){
        next()
    }

})

export const verifyResourcePermission = (roles=[])=>asyncHandler(async (req, res, next)=>{
    if(!req.user?._id)
    {
        throw new ApiError(401, "Unauthorized request")
    }

    if(!roles.includes(req.user?.role))
    {
        throw new ApiError(403, "You don't have permission to access this resource!")
    }

    next()
})